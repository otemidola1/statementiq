'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
    }

    const handleGoogleSignUp = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) setError(error.message)
    }

    return (
        <div className="auth-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'var(--bg)',
        }}>
            <div className="auth-shell" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                {/* Logo */}
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 32,
                    textDecoration: 'none',
                }}>
                    <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                        Statement<span style={{ color: 'var(--primary)' }}>IQ</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="card auth-card" style={{ padding: '32px 28px', textAlign: 'left' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Create your account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                        Start converting bank statements in seconds
                    </p>

                    {error && (
                        <div style={{
                            background: 'var(--danger-light)',
                            color: 'var(--danger)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius)',
                            fontSize: 13,
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 14 }}>
                            <label className="input-label">Full Name</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label className="input-label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label className="input-label">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="input-label">Confirm Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: '11px', fontSize: 14 }}
                        >
                            {loading ? (
                                <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating account...</>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '20px 0',
                        gap: 12,
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogleSignUp}
                        type="button"
                        className="btn-ghost"
                        style={{
                            width: '100%',
                            padding: '11px',
                            fontSize: 14,
                            justifyContent: 'center',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Terms */}
                    <p style={{
                        fontSize: 12,
                        color: 'var(--text-tertiary)',
                        marginTop: 18,
                        textAlign: 'center',
                        lineHeight: 1.5,
                    }}>
                        By creating an account, you agree to our{' '}
                        <Link href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                </div>

                {/* Login link */}
                <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
                </p>
            </div>
        </div>
    )
}
