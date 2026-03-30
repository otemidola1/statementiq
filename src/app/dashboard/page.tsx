import { createClient } from '@/lib/supabase/server'

const PLAN_LIMITS: Record<string, { storage: number; pages: number }> = {
    free: { storage: 50, pages: 10 },
    starter: { storage: 200, pages: 100 },
    professional: { storage: 500, pages: 500 },
    accountant: { storage: 1024, pages: Infinity },
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [
        { data: profile },
        { data: recentBatches },
        { count: txCount },
        { count: reportCount },
    ] = await Promise.all([
        supabase.from('profiles').select('plan, storage_used_bytes, monthly_pages_used').eq('id', user?.id).single(),
        supabase.from('upload_batches').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
    ])

    const plan = (profile?.plan || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    const storageMB = ((profile?.storage_used_bytes || 0) / (1024 * 1024)).toFixed(1)
    const pagesUsed = profile?.monthly_pages_used || 0

    const stats = [
        {
            label: 'Total Uploads',
            value: recentBatches?.length || 0,
            color: 'var(--primary)',
            bg: 'var(--primary-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
        },
        {
            label: 'Transactions',
            value: txCount || 0,
            color: 'var(--success)',
            bg: 'var(--success-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        },
        {
            label: 'Reports',
            value: reportCount || 0,
            color: 'var(--warning)',
            bg: 'var(--warning-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
        },
        {
            label: 'Plan',
            value: plan.charAt(0).toUpperCase() + plan.slice(1),
            color: '#7C3AED',
            bg: '#F3E8FF',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
        },
    ]

    const storagePct = limits.storage > 0 ? Math.min(100, parseFloat(storageMB) / limits.storage * 100) : 0
    const pagesPct = limits.pages === Infinity ? 0 : Math.min(100, pagesUsed / limits.pages * 100)

    return (
        <div className="animate-in">
            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Welcome back — upload a bank statement to get started.
                </p>
            </div>

            {/* Stats grid */}
            <div className="dashboard-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                marginBottom: 20,
            }}>
                {stats.map((stat) => (
                    <div key={stat.label} className="card stat-card">
                        <div>
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                        <div className="icon-container icon-lg" style={{ background: stat.bg, borderRadius: 'var(--radius)' }}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage meters */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
                <div className="dashboard-usage-grid" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    {/* Storage meter */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Storage
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                {storageMB} MB / {limits.storage} MB
                            </span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{
                                width: `${storagePct}%`,
                                background: storagePct > 85 ? 'var(--danger)' : 'var(--primary)',
                            }} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="dashboard-usage-divider" style={{ width: 1, height: 32, background: 'var(--border)' }} />

                    {/* Pages meter */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Pages This Month
                            </span>
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

            {/* Recent uploads */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="dashboard-recent-header" style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 className="section-title">Recent Uploads</h2>
                    <a href="/dashboard/upload" className="btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        New Upload
                    </a>
                </div>

                {!recentBatches || recentBatches.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No uploads yet</p>
                        <p style={{ fontSize: 13, marginBottom: 20, color: 'var(--text-secondary)' }}>Upload your first bank statement to get started</p>
                        <a href="/dashboard/upload" className="btn-primary btn-sm">Upload Statement</a>
                    </div>
                ) : (
                    <div className="dashboard-table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Bank</th>
                                    <th>Pages</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBatches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{new Date(batch.created_at).toLocaleDateString()}</td>
                                        <td>{batch.bank_name_detected || '—'}</td>
                                        <td>{batch.page_count || '—'}</td>
                                        <td>
                                            <span className={`badge badge-${batch.status === 'complete' ? 'success' : batch.status === 'failed' ? 'danger' : 'warning'}`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {batch.status === 'complete' && (
                                                <a href={`/dashboard/results/${batch.id}`} className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                                                    View Results
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
