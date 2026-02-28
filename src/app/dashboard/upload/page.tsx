'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const PLAN_LIMITS: Record<string, { storage: number; pages: number }> = {
    free: { storage: 50, pages: 10 },
    starter: { storage: 200, pages: 100 },
    professional: { storage: 500, pages: 500 },
    accountant: { storage: 1024, pages: Infinity },
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

export default function UploadPage() {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState<UploadStatus>('idle')
    const [processStep, setProcessStep] = useState(0)
    const [error, setError] = useState('')
    const [resultBatchId, setResultBatchId] = useState<string | null>(null)
    const [storageInfo, setStorageInfo] = useState<{
        plan: string; storage_used_bytes: number; monthly_pages_used: number
    } | null>(null)

    const loadStorageInfo = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles')
                .select('plan, storage_used_bytes, monthly_pages_used')
                .eq('id', user.id).single()
            if (data) setStorageInfo(data)
        }
    }, [supabase])

    useEffect(() => { loadStorageInfo() }, [loadStorageInfo])

    const plan = (storageInfo?.plan || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    const storageUsedMB = (storageInfo?.storage_used_bytes || 0) / (1024 * 1024)
    const storagePct = Math.min(100, (storageUsedMB / limits.storage) * 100)
    const pagesUsed = storageInfo?.monthly_pages_used || 0
    const pagesPct = limits.pages === Infinity ? 0 : Math.min(100, (pagesUsed / limits.pages) * 100)

    const handleFile = (file: File) => {
        setError('')
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are accepted')
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
            return
        }
        const afterUploadMB = storageUsedMB + file.size / (1024 * 1024)
        if (afterUploadMB > limits.storage) {
            setError(`Storage quota exceeded. ${limits.storage}MB limit on your ${plan} plan.`)
            return
        }
        setSelectedFile(file)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [storageUsedMB, limits])

    const handleUpload = async () => {
        if (!selectedFile) return
        setError('')
        setStatus('uploading')
        setProcessStep(1)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Step 1: Upload to storage
            const storagePath = `${user.id}/${Date.now()}_${selectedFile.name}`
            const { error: uploadErr } = await supabase.storage
                .from('statements')
                .upload(storagePath, selectedFile, { contentType: 'application/pdf' })
            if (uploadErr) throw new Error(uploadErr.message)

            setProcessStep(2)
            setStatus('processing')

            // Step 2: Create upload batch + source file
            const { data: batch, error: batchErr } = await supabase
                .from('upload_batches')
                .insert({ user_id: user.id, status: 'processing' })
                .select().single()
            if (batchErr) throw new Error(batchErr.message)

            const { data: sourceFile, error: sfErr } = await supabase
                .from('source_files')
                .insert({
                    user_id: user.id,
                    batch_id: batch.id,
                    original_filename: selectedFile.name,
                    storage_path: storagePath,
                    file_size: selectedFile.size,
                    processing_status: 'processing',
                })
                .select().single()
            if (sfErr) throw new Error(sfErr.message)

            setProcessStep(3)

            // Step 3: Call processing Edge Function
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-statement`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    },
                    body: JSON.stringify({
                        batch_id: batch.id,
                        source_file_id: sourceFile.id,
                        storage_path: storagePath,
                        original_filename: selectedFile.name,
                    }),
                }
            )

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `Processing failed (${response.status})`)
            }

            setProcessStep(4)
            setStatus('complete')
            setResultBatchId(batch.id)
            loadStorageInfo()
        } catch (err: unknown) {
            let message = err instanceof Error ? err.message : 'Upload failed'

            // Handle common fetch/network errors more gracefully
            if (message === 'Failed to fetch') {
                message = 'Connection error: Could not reach the processing server. This usually happens due to a network issue or the server blocking the request (CORS). We\'ve deployed a fix, please try again or refresh the page.'
            }

            setError(message)
            setStatus('error')
        }
    }

    const steps = [
        { label: 'Uploading file', active: processStep >= 1 },
        { label: 'Creating records', active: processStep >= 2 },
        { label: 'Processing statement', active: processStep >= 3 },
        { label: 'Analysis complete', active: processStep >= 4 },
    ]

    return (
        <div className="animate-in">
            {/* Page header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Upload Statement
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Upload a PDF bank statement to extract and categorize transactions.
                </p>
            </div>

            {/* Usage meters */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Storage</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                {storageUsedMB.toFixed(1)} MB / {limits.storage} MB
                            </span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{
                                width: `${storagePct}%`,
                                background: storagePct > 85 ? 'var(--danger)' : 'var(--primary)',
                            }} />
                        </div>
                    </div>
                    <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Pages This Month</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                {pagesUsed} / {limits.pages === Infinity ? '∞' : limits.pages}
                            </span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{
                                width: limits.pages === Infinity ? '0%' : `${pagesPct}%`,
                                background: pagesPct > 85 ? 'var(--danger)' : 'var(--success)',
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: 'var(--danger-light)',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: 'var(--danger-text)',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {status === 'idle' || status === 'error' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            padding: '56px 40px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--transition)',
                            borderBottom: selectedFile ? '1px solid var(--border)' : 'none',
                            background: dragOver ? 'var(--primary-50)' : 'transparent',
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />

                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: dragOver ? 'var(--primary-100)' : 'var(--bg-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 18px',
                            transition: 'all var(--transition)',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--primary)' : 'var(--text-tertiary)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        </div>

                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: 'var(--text)' }}>
                            {dragOver ? 'Drop your PDF here' : 'Click to upload or drag and drop'}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                            PDF files only, up to 5MB
                        </p>
                    </div>

                    {/* Selected file */}
                    {selectedFile && (
                        <div style={{ padding: '18px 24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--danger-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                            {selectedFile.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                            {(selectedFile.size / 1024).toFixed(0)} KB • PDF
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="btn-ghost btn-sm"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="btn-primary btn-sm"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 16 12 12 8 16" />
                                            <line x1="12" y1="12" x2="12" y2="21" />
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                        </svg>
                                        Process Statement
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Processing / Complete view */
                <div className="card" style={{ padding: 32 }}>
                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                        {/* Processing steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {steps.map((step, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    padding: '14px 0',
                                    borderBottom: i < steps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                }}>
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        background: step.active ? (processStep > i + 1 || status === 'complete' && i === steps.length - 1 ? 'var(--success)' : 'var(--primary)') : 'var(--bg-elevated)',
                                        transition: 'all var(--transition-slow)',
                                    }}>
                                        {step.active && (processStep > i + 1 || (status === 'complete' && i === steps.length - 1)) ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : step.active ? (
                                            <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                                        ) : (
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>{i + 1}</span>
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: 14,
                                        fontWeight: step.active ? 600 : 400,
                                        color: step.active ? 'var(--text)' : 'var(--text-tertiary)',
                                    }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Completion actions */}
                        {status === 'complete' && resultBatchId && (
                            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                                <a
                                    href={`/dashboard/results/${resultBatchId}`}
                                    className="btn-primary"
                                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                                >
                                    View Results
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </a>
                                <button
                                    className="btn-ghost"
                                    onClick={() => { setStatus('idle'); setSelectedFile(null); setProcessStep(0); setResultBatchId(null) }}
                                >
                                    Upload Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20 }}>
                {[
                    {
                        title: 'Supported banks',
                        desc: 'Works with PDF statements from any bank worldwide.',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>,
                    },
                    {
                        title: 'Auto-cleanup',
                        desc: 'PDFs are automatically deleted after processing to save storage.',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
                    },
                    {
                        title: 'Data security',
                        desc: 'Bank-grade encryption. Your data is never shared or sold.',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
                    },
                ].map((info) => (
                    <div key={info.title} className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            {info.icon}
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{info.title}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {info.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
