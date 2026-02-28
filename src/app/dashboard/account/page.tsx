'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
    const [profile, setProfile] = useState<{ name: string; email: string; plan: string; created_at: string } | null>(null)
    const [showCancel, setShowCancel] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('name, email, plan, created_at').eq('id', user.id).single()
                if (data) setProfile(data)
            }
        }
        load()
    }, [supabase])

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Account & Billing</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your profile and subscription</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
                {/* Profile card */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, fontWeight: 700,
                        }}>
                            {profile?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <p style={{ fontSize: 16, fontWeight: 600 }}>{profile?.name || 'Loading...'}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profile?.email}</p>
                        </div>
                    </div>
                    <button className="btn-ghost" style={{ width: '100%', marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Change Password
                    </button>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '...'}
                    </p>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Plan */}
                    <div className="card" style={{ padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Current Plan</h3>
                                <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: 12 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                    {profile?.plan || 'free'} Plan
                                </span>
                            </div>
                            <a href="/pricing" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                Upgrade
                            </a>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pages used this month</span>
                                <span style={{ fontWeight: 600 }}>0 / 10</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: '0%' }} />
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="card" style={{ padding: 22 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Payment Method</h3>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: 14, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                            marginBottom: 14,
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No payment method on file</span>
                        </div>
                        <button className="btn-ghost btn-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Payment Method
                        </button>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                            Payments powered by Flutterwave. API key required.
                        </p>
                    </div>

                    {/* Danger zone */}
                    <div className="card" style={{ padding: 22, borderColor: '#FCA5A5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.75">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>Danger Zone</h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                            Once you cancel, you&apos;ll lose access to premium features at the end of your billing period.
                        </p>
                        <button
                            onClick={() => setShowCancel(true)}
                            style={{
                                padding: '8px 18px', fontSize: 13, fontWeight: 600,
                                background: 'transparent', border: '1px solid var(--danger)',
                                borderRadius: 'var(--radius)', color: 'var(--danger)',
                                cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all var(--transition)',
                            }}
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancel && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCancel(false)}>
                    <div className="modal" style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: 'var(--danger-light)', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.75">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cancel Subscription?</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                            You&apos;ll lose access to auto-categorization, dashboards, reports, and all premium features.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button className="btn-ghost" onClick={() => setShowCancel(false)}>Keep Plan</button>
                            <button
                                style={{
                                    padding: '10px 20px', background: 'var(--danger)', color: 'white',
                                    border: 'none', borderRadius: 'var(--radius)', fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
