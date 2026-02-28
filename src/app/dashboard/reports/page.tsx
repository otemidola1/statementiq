'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Report {
    id: string
    report_type: string
    created_at: string
    share_token: string
    share_expires_at: string
    batch_id: string
    storage_path: string
}

interface Batch {
    id: string
    bank_name_detected: string
    statement_period_start: string
    statement_period_end: string
    status: string
    created_at: string
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<string | null>(null)
    const [selectedBatch, setSelectedBatch] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [{ data: reportData }, { data: batchData }] = await Promise.all([
            supabase.from('reports').select('*').order('created_at', { ascending: false }),
            supabase.from('upload_batches').select('*').eq('status', 'complete').order('created_at', { ascending: false }),
        ])
        setReports(reportData || [])
        setBatches(batchData || [])
        if (batchData && batchData.length > 0 && !selectedBatch) {
            setSelectedBatch(batchData[0].id)
        }
        setLoading(false)
    }

    const generateReport = async (type: 'income' | 'loan') => {
        if (!selectedBatch) {
            setError('Please select a statement batch first.')
            return
        }
        setError(null)
        setSuccess(null)
        setGenerating(type)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('Please log in to generate reports.')
                setGenerating(null)
                return
            }

            const functionName = type === 'income' ? 'generate-income-report' : 'generate-loan-report'
            const res = await supabase.functions.invoke(functionName, {
                body: { batch_id: selectedBatch },
            })

            if (res.error) {
                setError(res.error.message || 'Failed to generate report.')
            } else if (res.data?.error) {
                setError(res.data.error)
            } else {
                setSuccess(`${type === 'income' ? 'Income Verification' : 'Loan Readiness'} report generated successfully!`)
                // If the response contains a download URL, open it
                if (res.data?.download_url) {
                    window.open(res.data.download_url, '_blank')
                }
                loadData()
            }
        } catch (e) {
            setError('An unexpected error occurred. Please try again.')
        }

        setGenerating(null)
    }

    const downloadReport = async (report: Report) => {
        const { data } = await supabase.storage.from('statements')
            .createSignedUrl(report.storage_path, 3600)
        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    const copyShareLink = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/report/${token}`)
        setCopied(token)
        setTimeout(() => setCopied(null), 2000)
    }

    const reportTypes = [
        {
            type: 'income' as const,
            title: 'Income Verification Report',
            desc: 'Professional PDF showing average monthly income, income consistency score, and income history. For mortgage and rental applications.',
            bg: 'var(--success-light)',
            color: 'var(--success)',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15l2 2 4-4" />
                </svg>
            ),
        },
        {
            type: 'loan' as const,
            title: 'Loan Readiness Report',
            desc: 'Lender-facing report of cash flow health, revenue trend, and monthly performance. Know how your financials look before applying.',
            bg: 'var(--primary-light)',
            color: 'var(--primary)',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
            ),
        },
    ]

    const selectedBatchInfo = batches.find(b => b.id === selectedBatch)

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Financial Reports</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Generate professional reports from your analyzed statements
                </p>
            </div>

            {/* Batch selector */}
            {batches.length > 0 && (
                <div className="card" style={{ padding: 18, marginBottom: 18 }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>Select Statement Batch</label>
                    <select
                        className="input"
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                        style={{ width: '100%', maxWidth: 480 }}
                    >
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.bank_name_detected || 'Unknown Bank'} — {b.statement_period_start} to {b.statement_period_end}
                            </option>
                        ))}
                    </select>
                    {selectedBatchInfo && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <span className="badge badge-primary">{selectedBatchInfo.bank_name_detected}</span>
                            <span className="badge badge-gray">
                                {selectedBatchInfo.statement_period_start} — {selectedBatchInfo.statement_period_end}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Status messages */}
            {error && (
                <div style={{
                    padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius)',
                    background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 600 }}>×</button>
                </div>
            )}
            {success && (
                <div style={{
                    padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius)',
                    background: 'var(--success-light)', color: 'var(--success)', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {success}
                    <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--success)', fontWeight: 600 }}>×</button>
                </div>
            )}

            {/* Report type cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {reportTypes.map((rt) => (
                    <div key={rt.type} className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: rt.bg, color: rt.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {rt.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{rt.title}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rt.desc}</p>
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            disabled={generating === rt.type || batches.length === 0}
                            onClick={() => generateReport(rt.type)}
                            style={{ width: '100%', padding: '10px 16px' }}
                        >
                            {generating === rt.type ? (
                                <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating...</>
                            ) : batches.length === 0 ? (
                                'Upload a statement first'
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Past reports table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                    <h2 className="section-title">Past Reports</h2>
                </div>

                {loading ? (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No reports generated yet</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload a statement and generate your first report</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Generated</th>
                                <th>Expires</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {report.report_type === 'income' ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15l2 2 4-4" /></svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                                            )}
                                            {report.report_type === 'income' ? 'Income Verification' : 'Loan Readiness'}
                                        </span>
                                    </td>
                                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ fontSize: 13, color: new Date(report.share_expires_at) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                            {new Date(report.share_expires_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn-primary btn-sm" onClick={() => downloadReport(report)}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                Download
                                            </button>
                                            <button
                                                className="btn-ghost btn-sm"
                                                onClick={() => copyShareLink(report.share_token)}
                                            >
                                                {copied === report.share_token ? (
                                                    <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                                                        Share
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
