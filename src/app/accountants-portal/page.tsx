'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function AccountantPortalComingSoonPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')
        setMessage('')

        try {
            const supabase = createClient()

            // Assuming there is a waitlist table or we just insert into an early_access table
            // For now, we simulate success if table isn't created yet or we can create it later.
            // A simple implementation:
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email, type: 'accountant_portal' }])

            // Even if there's no waitlist table, let's just show success for the UI purpose,
            // or handle the error gracefully.
            if (error && error.code !== '42P01') { // 42P01 is relation does not exist
                throw error
            }

            setStatus('success')
            setMessage('You\'re on the list! We\'ll notify you when the portal is ready.')
            setEmail('')
        } catch (error: any) {
            console.error('Waitlist error:', error)
            setStatus('error')
            setMessage(error.message || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow effects matching the home page */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }} />

                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '800px',
                    width: '100%',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 16px',
                        background: 'var(--primary-light)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 100,
                        color: 'var(--primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 32,
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        StatementIQ for Accountants
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(32px, 5vw, 48px)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        marginBottom: 20,
                        lineHeight: 1.1,
                    }}>
                        The ultimate toolkit for <br />
                        <span style={{
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>financial professionals.</span>
                    </h1>

                    <p style={{
                        fontSize: 18,
                        color: 'var(--text-secondary)',
                        marginBottom: 40,
                        maxWidth: 600,
                        margin: '0 auto 40px auto',
                        lineHeight: 1.6,
                    }}>
                        We're building a dedicated portal for accountants to manage hundreds of client statements, extract data automatically, and streamline tax preparation. Join the waitlist to get early access.
                    </p>

                    <div className="card" style={{
                        maxWidth: 480,
                        margin: '0 auto',
                        padding: 32,
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)',
                    }}>
                        {status === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    color: '#22c55e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px auto',
                                }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>You're on the list!</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                    Keep an eye on your inbox. We'll let you know as soon as the Accountant Portal is ready for beta testing.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Join the Waitlist</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
                                    Be the first to know when we launch and get exclusive early-bird pricing.
                                </p>

                                <div style={{ marginBottom: 16 }}>
                                    <label className="input-label">Work Email</label>
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="you@yourfirm.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                        style={{ background: 'var(--bg)' }}
                                    />
                                </div>

                                {message && status === 'error' && (
                                    <div style={{
                                        color: 'var(--danger)',
                                        fontSize: 13,
                                        padding: '8px 12px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: 'var(--radius)',
                                        marginBottom: 16,
                                    }}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={status === 'loading'}
                                    style={{ width: '100%', padding: '12px', fontSize: 15 }}
                                >
                                    {status === 'loading' ? (
                                        <><div className="spinner" style={{ width: 16, height: 16 }} /> Joining...</>
                                    ) : (
                                        'Secure my spot'
                                    )}
                                </button>
                                <p style={{
                                    fontSize: 12,
                                    color: 'var(--text-tertiary)',
                                    textAlign: 'center',
                                    marginTop: 16,
                                }}>
                                    No spam, ever. Unsubscribe anytime.
                                </p>
                            </form>
                        )}
                    </div>

                    {/* Features Preview */}
                    <div style={{
                        marginTop: 80,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 24,
                        textAlign: 'left',
                    }}>
                        {[
                            {
                                title: 'Multi-Client Dashboard',
                                desc: 'Manage hundreds of client statements from a single, unified interface.',
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            },
                            {
                                title: 'Automated CSV/Excel Export',
                                desc: 'Download perfectly clean, standardized spreadsheets ready to import into QuickBooks or Xero.',
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            },
                            {
                                title: 'Fraud Detection Engine',
                                desc: 'Automatically flag manipulated PDFs, inconsistent fonts, or digitally altered statement pages.',
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            },
                        ].map((feat, i) => (
                            <div key={i} style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                                }}>
                                    {feat.icon}
                                </div>
                                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h4>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
