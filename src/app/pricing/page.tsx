'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const CheckIconWhite = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const XIconMuted = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const plans = [
    {
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        tagline: 'Get started',
        btnStyle: 'btn-ghost',
        btnText: 'Get Started',
        featured: false,
        features: [
            { name: '10 pages per month', included: true },
            { name: 'CSV export only', included: true },
            { name: 'Auto-categorization', included: false },
            { name: 'Dashboard & charts', included: false },
            { name: 'Subscription detector', included: false },
            { name: 'Google Sheets export', included: false },
            { name: 'Income Verification Report', included: false },
            { name: 'Fraud detection', included: false },
            { name: 'QuickBooks/Xero export', included: false },
            { name: 'Accountant portal', included: false },
        ],
    },
    {
        name: 'Starter',
        price: { monthly: 2000, annual: 2000 },
        tagline: 'For individuals',
        btnStyle: 'btn-primary',
        btnText: 'Start Free Trial',
        featured: false,
        features: [
            { name: '100 pages per month', included: true },
            { name: 'CSV & Excel export', included: true },
            { name: 'Auto-categorization', included: true },
            { name: 'Dashboard & charts', included: true },
            { name: 'Subscription detector', included: true },
            { name: 'Google Sheets export', included: true },
            { name: 'Income Verification Report', included: false },
            { name: 'Fraud detection', included: false },
            { name: 'QuickBooks/Xero export', included: false },
            { name: 'Accountant portal', included: false },
        ],
    },
    {
        name: 'Professional',
        price: { monthly: 5000, annual: 5000 },
        tagline: 'For power users',
        btnStyle: 'btn-primary',
        btnText: 'Start Free Trial',
        featured: true,
        features: [
            { name: '500 pages per month', included: true },
            { name: 'CSV & Excel export', included: true },
            { name: 'Auto-categorization', included: true },
            { name: 'Dashboard & charts', included: true },
            { name: 'Subscription detector', included: true },
            { name: 'Google Sheets export', included: true },
            { name: 'Income Verification Report ($15/report)', included: true },
            { name: 'Fraud detection', included: true },
            { name: 'QuickBooks/Xero export', included: true },
            { name: 'Accountant portal', included: false },
        ],
    },
    {
        name: 'Accountant',
        price: { monthly: 10000, annual: 10000 },
        tagline: 'For firms',
        btnStyle: 'btn-ghost',
        btnText: 'Contact Sales',
        featured: false,
        features: [
            { name: 'Unlimited pages', included: true },
            { name: 'CSV & Excel export', included: true },
            { name: 'Auto-categorization', included: true },
            { name: 'Dashboard & charts', included: true },
            { name: 'Subscription detector', included: true },
            { name: 'Google Sheets export', included: true },
            { name: 'Unlimited Reports', included: true },
            { name: 'Fraud detection', included: true },
            { name: 'QuickBooks/Xero export', included: true },
            { name: 'Accountant portal', included: true },
        ],
    },
]

const faqs = [
    { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.' },
    { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, bank transfers, and mobile money through Flutterwave. We support Naira, USD, and 30+ currencies.' },
    { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time from your Account page. Changes take effect immediately.' },
    { q: 'How secure is my financial data?', a: 'We use bank-grade encryption for all data in transit and at rest. Files are stored in private buckets with signed, time-limited access URLs. We never sell your data.' },
    { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.' },
    { q: 'Do you offer refunds?', a: 'We offer a full refund within 7 days of your first payment if you\'re not satisfied. Contact support and we\'ll process it immediately.' },
]

export default function PricingPage() {
    const [annual, setAnnual] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    return (
        <>
            <Navbar />

            <section className="pricing-shell" style={{ textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: 'var(--primary-light)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--primary)',
                    marginBottom: 20,
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Pricing
                </div>

                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 2.625rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    marginBottom: 12,
                }}>
                    Simple, transparent{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>pricing</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2.6vw, 1.0625rem)', marginBottom: 36 }}>
                    Start free. Upgrade when you need more power.
                </p>

                {/* Toggle */}
                <div className="pricing-toggle" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 'clamp(28px, 5vw, 48px)',
                    background: 'var(--card)',
                    padding: '4px',
                    borderRadius: 100,
                    border: '1px solid var(--border)',
                }}>
                    <button
                        onClick={() => setAnnual(false)}
                        style={{
                            padding: '8px 24px',
                            borderRadius: 100,
                            border: 'none',
                            background: !annual ? 'var(--primary)' : 'transparent',
                            color: !annual ? 'var(--card)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all var(--transition)',
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setAnnual(true)}
                        style={{
                            padding: '8px 24px',
                            borderRadius: 100,
                            border: 'none',
                            background: annual ? 'var(--primary)' : 'transparent',
                            color: annual ? 'var(--card)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all var(--transition)',
                        }}
                    >
                        Annual
                    </button>
                    {annual && (
                        <span className="badge badge-success" style={{ marginLeft: 8 }}>Save 20%</span>
                    )}
                </div>

                {/* Plan cards */}
                <div className="pricing-plans-grid" style={{ display: 'grid', gap: 16, textAlign: 'left' }}>
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card pricing-plan-card${plan.featured ? ' pricing-plan-featured' : ''}`}
                            style={{
                                padding: 24,
                                borderColor: plan.featured ? 'var(--primary)' : undefined,
                                borderWidth: plan.featured ? 2 : undefined,
                                background: plan.featured ? 'var(--primary)' : undefined,
                                color: plan.featured ? 'var(--card)' : undefined,
                                position: 'relative',
                                transform: plan.featured ? 'scale(1.02)' : undefined,
                                transition: 'transform var(--transition), box-shadow var(--transition)',
                            }}
                        >
                            {plan.featured && (
                                <div style={{
                                    position: 'absolute',
                                    top: -12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--warning)',
                                    color: '#1E1E2E',
                                    padding: '4px 16px',
                                    borderRadius: 100,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                    Most Popular
                                </div>
                            )}

                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                            <p style={{
                                fontSize: 13,
                                color: plan.featured ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                                marginBottom: 16,
                            }}>
                                {plan.tagline}
                            </p>

                            <div style={{ marginBottom: 20 }}>
                                <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em' }}>
                                    {plan.name === 'Accountant'
                                        ? 'Coming Soon'
                                        : `₦${(annual ? plan.price.annual : plan.price.monthly).toLocaleString()}`}
                                </span>
                                {plan.name !== 'Accountant' && (
                                    <span style={{
                                        fontSize: 14,
                                        color: plan.featured ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                                    }}>
                                        /mo
                                    </span>
                                )}
                            </div>

                            <Link
                                href={plan.name === 'Accountant' ? '/accountants-portal' : '/signup'}
                                className={plan.featured ? '' : plan.btnStyle}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '11px',
                                    borderRadius: 'var(--radius)',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    marginBottom: 20,
                                    transition: 'all var(--transition)',
                                    ...(plan.featured
                                        ? { background: 'var(--card)', color: 'var(--primary)' }
                                        : plan.name === 'Accountant'
                                            ? { borderColor: 'var(--warning)', color: 'var(--warning-text)' }
                                            : {}),
                                }}
                            >
                                {plan.name === 'Accountant' && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></svg>
                                )}
                                {plan.btnText}
                            </Link>

                            <div style={{
                                height: 1,
                                background: plan.featured ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                                marginBottom: 18,
                            }} />

                            <ul className="pricing-plan-features" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {plan.features.map((f) => (
                                    <li key={f.name} style={{
                                        fontSize: 13,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        color: f.included
                                            ? (plan.featured ? 'rgba(255,255,255,0.9)' : 'var(--text)')
                                            : (plan.featured ? 'rgba(255,255,255,0.3)' : '#D1D5DB'),
                                    }}>
                                        <span style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {f.included
                                                ? (plan.featured ? <CheckIconWhite /> : <CheckIcon />)
                                                : (plan.featured ? <XIconMuted /> : <XIcon />)}
                                        </span>
                                        {f.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="pricing-faq-shell">
                <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 36, letterSpacing: '-0.02em' }}>
                    Frequently asked questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{ overflow: 'hidden' }}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text)',
                                    fontFamily: 'inherit',
                                    textAlign: 'left',
                                }}
                            >
                                {faq.q}
                                <svg
                                    width="16" height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--text-tertiary)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    style={{
                                        transition: 'transform var(--transition)',
                                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {openFaq === i && (
                                <div style={{
                                    padding: '0 20px 16px',
                                    fontSize: 14,
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.7,
                                }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    )
}
