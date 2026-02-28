'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

// Dynamic import Recharts to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })

interface Transaction {
    id: string
    date: string
    description: string
    amount: number
    type: 'debit' | 'credit'
    category: string
    category_confidence: number
    is_flagged: boolean
    flag_reason?: string
    user_edited_category: boolean
}

interface BatchInfo {
    bank_name_detected: string
    statement_period_start: string
    statement_period_end: string
    status: string
}

interface RecurringCharge {
    id: string
    merchant_name: string
    amount: number
    frequency: string
    annual_total: number
}

const CATEGORIES = [
    'Groceries', 'Dining', 'Shopping', 'Transportation', 'Fuel',
    'Subscriptions', 'Entertainment', 'Healthcare', 'Education',
    'Rent & Mortgage', 'Utilities', 'Insurance', 'Travel',
    'Income', 'Transfers', 'Cash', 'Bank Fees', 'Checks',
    'Investments', 'Other',
]

export default function ResultsPage() {
    const params = useParams()
    const batchId = params.batchId as string
    const supabase = createClient()

    const [batch, setBatch] = useState<BatchInfo | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [recurring, setRecurring] = useState<RecurringCharge[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [editingCategory, setEditingCategory] = useState<string | null>(null)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [activeTab, setActiveTab] = useState<'transactions' | 'recurring'>('transactions')

    useEffect(() => { loadData() }, [batchId])

    const loadData = async () => {
        const [{ data: batchData }, { data: txData }, { data: recData }] = await Promise.all([
            supabase.from('upload_batches')
                .select('bank_name_detected, statement_period_start, statement_period_end, status')
                .eq('id', batchId).single(),
            supabase.from('transactions')
                .select('*').eq('batch_id', batchId)
                .order('date', { ascending: false }),
            supabase.from('recurring_charges')
                .select('*').eq('batch_id', batchId)
                .order('annual_total', { ascending: false }),
        ])
        setBatch(batchData)
        setTransactions(txData || [])
        setRecurring(recData || [])
        setLoading(false)
    }

    const updateCategory = async (txId: string, newCategory: string) => {
        await supabase.from('transactions')
            .update({ category: newCategory, user_edited_category: true, category_confidence: 1.0 })
            .eq('id', txId)
        setTransactions(prev => prev.map(t =>
            t.id === txId ? { ...t, category: newCategory, user_edited_category: true, category_confidence: 1.0 } : t
        ))
        setEditingCategory(null)
    }

    // Export functions
    const exportCSV = async () => {
        const Papa = (await import('papaparse')).default
        const rows = filteredTx.map(t => ({
            Date: t.date,
            Description: t.description,
            Category: t.category,
            Amount: t.type === 'credit' ? t.amount : -t.amount,
            Type: t.type,
            Flagged: t.is_flagged ? 'Yes' : 'No',
        }))
        const csv = Papa.unparse(rows)
        downloadFile(csv, `statementiq-${batchId.slice(0, 8)}.csv`, 'text/csv')
        setShowExportMenu(false)
    }

    const exportExcel = async () => {
        const XLSX = await import('xlsx')
        const rows = filteredTx.map(t => ({
            Date: t.date,
            Description: t.description,
            Category: t.category,
            Amount: t.type === 'credit' ? t.amount : -t.amount,
            Type: t.type,
            Flagged: t.is_flagged ? 'Yes' : 'No',
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
        XLSX.writeFile(wb, `statementiq-${batchId.slice(0, 8)}.xlsx`)
        setShowExportMenu(false)
    }

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netCashFlow = totalIncome - totalExpenses

    const categoryBreakdown = transactions
        .filter(t => t.type === 'debit')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
            return acc
        }, {} as Record<string, number>)

    const filteredTx = transactions.filter(t => {
        if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
        if (categoryFilter && t.category !== categoryFilter) return false
        return true
    })

    // Monthly data for bar chart
    const monthlyData = transactions.reduce((acc, t) => {
        const month = t.date.slice(0, 7)
        if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 }
        if (t.type === 'credit') acc[month].income += t.amount
        else acc[month].expenses += Math.abs(t.amount)
        return acc
    }, {} as Record<string, { month: string; income: number; expenses: number }>)
    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

    // Donut chart data
    const donutData = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))

    const colors = ['#4B6FFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1']

    const kpis = [
        {
            label: 'Total Income',
            value: `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            color: 'var(--success)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
        },
        {
            label: 'Total Expenses',
            value: `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            color: 'var(--danger)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
        },
        {
            label: 'Net Cash Flow',
            value: `${netCashFlow >= 0 ? '+' : ''}$${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            color: netCashFlow >= 0 ? 'var(--success)' : 'var(--danger)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        },
        {
            label: 'Transactions',
            value: transactions.length,
            color: 'var(--primary)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        },
    ]

    if (loading) {
        return (
            <div className="animate-in">
                <div className="skeleton" style={{ height: 36, width: 300, marginBottom: 28 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
                </div>
                <div className="skeleton" style={{ height: 400 }} />
            </div>
        )
    }

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Results Dashboard</h1>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {batch?.bank_name_detected && (
                            <span className="badge badge-primary">{batch.bank_name_detected}</span>
                        )}
                        {batch?.statement_period_start && batch?.statement_period_end && (
                            <span className="badge badge-gray">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                {batch.statement_period_start} — {batch.statement_period_end}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <button className="btn-primary" onClick={() => setShowExportMenu(!showExportMenu)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {showExportMenu && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowExportMenu(false)} />
                            <div style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                                minWidth: 180, zIndex: 20, overflow: 'hidden',
                            }}>
                                <button onClick={exportCSV} style={{
                                    width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                                    fontSize: 13, color: 'var(--text)', transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" /></svg>
                                    Export as CSV
                                </button>
                                <button onClick={exportExcel} style={{
                                    width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                                    fontSize: 13, color: 'var(--text)', transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M8 9h2" /></svg>
                                    Export as Excel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="card stat-card" style={{ padding: 18 }}>
                        <div>
                            <p className="stat-label">{kpi.label}</p>
                            <p className="stat-value" style={{ color: kpi.color, fontSize: 22 }}>{kpi.value}</p>
                        </div>
                        <div className="icon-container icon-lg" style={{ color: kpi.color }}>
                            {kpi.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {/* Donut chart */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                        Spending by Category
                    </h3>
                    {donutData.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No spending data to display</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 180, height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {donutData.map((_, i) => (
                                                <Cell key={i} fill={colors[i % colors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                                            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {donutData.map((d, i) => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
                                        <span style={{ flex: 1 }}>{d.name}</span>
                                        <span style={{ fontWeight: 600, fontSize: 12 }}>
                                            ${d.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly bar chart */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                        Monthly Cash Flow
                    </h3>
                    {monthlyChartData.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No monthly data to display</p>
                        </div>
                    ) : (
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyChartData} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                                        contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
                                    />
                                    <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expenses" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)' }} /> Income
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)' }} /> Expenses
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                <div className="card" style={{ padding: 18 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Avg Daily Spend</p>
                    <p style={{ fontSize: 20, fontWeight: 700 }}>
                        ${transactions.length > 0 ? (totalExpenses / 30).toFixed(2) : '0.00'}
                    </p>
                </div>
                <div className="card" style={{ padding: 18 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Largest Transaction</p>
                    <p style={{ fontSize: 20, fontWeight: 700 }}>
                        ${transactions.length > 0 ? Math.max(...transactions.map(t => Math.abs(t.amount))).toFixed(2) : '0.00'}
                    </p>
                </div>
                <div className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        </svg>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Flagged Transactions</p>
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>
                        {transactions.filter(t => t.is_flagged).length}
                    </p>
                </div>
            </div>

            {/* Tabs: Transactions / Recurring */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                <button
                    onClick={() => setActiveTab('transactions')}
                    style={{
                        padding: '8px 18px', borderRadius: 'var(--radius)', border: 'none',
                        background: activeTab === 'transactions' ? 'var(--primary)' : 'var(--bg-elevated)',
                        color: activeTab === 'transactions' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    }}
                >
                    Transactions ({filteredTx.length})
                </button>
                <button
                    onClick={() => setActiveTab('recurring')}
                    style={{
                        padding: '8px 18px', borderRadius: 'var(--radius)', border: 'none',
                        background: activeTab === 'recurring' ? 'var(--primary)' : 'var(--bg-elevated)',
                        color: activeTab === 'recurring' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: -1 }}>
                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Subscriptions ({recurring.length})
                </button>
            </div>

            {/* Transaction Table */}
            {activeTab === 'transactions' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="section-title">
                            Transactions <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({filteredTx.length})</span>
                        </h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    className="input"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: 180, paddingLeft: 32 }}
                                />
                            </div>
                            <select
                                className="input"
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                style={{ width: 150 }}
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredTx.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No transactions to display</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload a statement to see your transactions here</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    {['Date', 'Description', 'Category', 'Amount', 'Type'].map(h => (
                                        <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTx.map(tx => (
                                    <tr key={tx.id} style={{
                                        borderLeft: tx.is_flagged ? '3px solid var(--danger)' : 'none',
                                    }}>
                                        <td>{tx.date}</td>
                                        <td>
                                            {tx.is_flagged && (
                                                <span title={tx.flag_reason} style={{ display: 'inline-flex', marginRight: 6, color: 'var(--warning)' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                                    </svg>
                                                </span>
                                            )}
                                            {tx.description}
                                        </td>
                                        <td>
                                            {editingCategory === tx.id ? (
                                                <select
                                                    className="input"
                                                    value={tx.category}
                                                    onChange={e => updateCategory(tx.id, e.target.value)}
                                                    onBlur={() => setEditingCategory(null)}
                                                    autoFocus
                                                    style={{ padding: '4px 8px', fontSize: 13, width: 150 }}
                                                >
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <span
                                                    className={`badge ${tx.category_confidence < 0.5 ? 'badge-gray' : 'badge-primary'}`}
                                                    onClick={() => setEditingCategory(tx.id)}
                                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                    title={tx.category_confidence < 0.5 ? 'Low confidence — click to edit' : 'Click to edit'}
                                                >
                                                    {tx.category}
                                                    {tx.category_confidence < 0.5 && (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{
                                            fontWeight: 600, textAlign: 'right',
                                            color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)',
                                        }}>
                                            {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <span className={`badge ${tx.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Recurring charges panel */}
            {activeTab === 'recurring' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 className="section-title">
                            Detected Subscriptions & Recurring Charges
                        </h3>
                    </div>
                    {recurring.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75">
                                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No recurring charges detected</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Subscriptions are detected when the same merchant charges the same amount multiple times
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--text)' }}>{recurring.length}</strong> subscriptions detected
                                </span>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Annual total: <strong style={{ color: 'var(--danger)' }}>
                                        ${recurring.reduce((s, r) => s + r.annual_total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </strong>
                                </span>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Merchant</th>
                                        <th>Amount</th>
                                        <th>Frequency</th>
                                        <th style={{ textAlign: 'right' }}>Annual Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recurring.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 500 }}>{r.merchant_name}</td>
                                            <td>${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td>
                                                <span className="badge badge-gray">{r.frequency}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>
                                                ${r.annual_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
