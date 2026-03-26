import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function SharedReportPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params
    const supabase = await createClient()

    // Fetch report by share token
    const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('share_token', token)
        .single()

    if (error || !report) {
        notFound()
    }

    // Check expiry
    const isExpired = new Date(report.share_expires_at) < new Date()
    if (isExpired) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
                fontFamily: 'var(--font-sans)',
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: 440,
                    padding: 40,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: 'var(--danger-light, #FEE2E2)',
                        color: 'var(--danger, #EF4444)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Report Link Expired</h1>
                    <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>
                        This shared report link has expired. The report owner can generate a new shareable link from their dashboard.
                    </p>
                </div>
            </div>
        )
    }

    // Generate signed URL for the report
    const { data: signedUrl } = await supabase.storage
        .from('statements')
        .createSignedUrl(report.storage_path, 3600)

    const reportTypeLabel = report.report_type === 'income' ? 'Income Verification Report' : 'Loan Readiness Report'

    return (
        <div className="shared-report-page" style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            {/* Top bar */}
            <div className="shared-report-topbar" style={{
                background: 'white',
                borderBottom: '1px solid #E2E8F0',
                padding: '14px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div className="shared-report-meta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#4361EE' }}>StatementIQ</span>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>|</span>
                    <span style={{ fontSize: 14, color: '#64748B' }}>{reportTypeLabel}</span>
                </div>
                {signedUrl?.signedUrl && (
                    <a
                        className="shared-report-download"
                        href={signedUrl.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8,
                            background: '#4361EE', color: 'white',
                            fontSize: 13, fontWeight: 600, textDecoration: 'none',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Report
                    </a>
                )}
            </div>

            {/* Report preview */}
            <div className="shared-report-content" style={{
                maxWidth: 900,
                margin: '30px auto',
                padding: '0 20px',
            }}>
                {signedUrl?.signedUrl ? (
                    <iframe
                        className="shared-report-frame"
                        src={signedUrl.signedUrl}
                        title={reportTypeLabel}
                        style={{
                            width: '100%',
                            height: 'calc(100vh - 120px)',
                            border: '1px solid #E2E8F0',
                            borderRadius: 10,
                            background: 'white',
                        }}
                    />
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: 'white',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                    }}>
                        <p style={{ fontSize: 16, color: '#64748B' }}>Unable to load report preview. Please try again later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
