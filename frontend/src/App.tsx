import { useState, useRef } from 'react'
import { Search, Calendar, TrendingUp, TrendingDown, ArrowLeftRight, Activity, Zap, BarChart3, Info, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import PriceChart from './components/PriceChart'
import { Skeleton, StatCardSkeleton, ChartSkeleton } from './components/Skeleton'

interface ChartData {
    ticker: string
    earnings_date: string
    latest_date: string
    earnings_price: number
    latest_price: number
    price_change_pct: number
    next_day_change_pct: number | null
    min_price: number
    max_price: number
    price_range: number
    data: Array<{ date: string; price: number }>
}

interface StatCardProps {
    label: string
    value: string | number
    icon: React.ReactNode
    subtext?: string
    trend?: number | null
}

type DateFilter = '1M' | '3M' | '6M' | 'ALL'

function App() {
    const [ticker, setTicker] = useState('')
    const [earningsDate, setEarningsDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chartData, setChartData] = useState<ChartData | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [dateFilter, setDateFilter] = useState<DateFilter>('ALL')
    const chartRef = useRef<HTMLDivElement>(null)

    const filterChartData = (data: ChartData, filter: DateFilter) => {
        if (filter === 'ALL') return data

        const daysMap: Record<DateFilter, number> = {
            '1M': 30,
            '3M': 90,
            '6M': 180,
            'ALL': 0
        }

        const days = daysMap[filter]
        const latestDate = new Date(data.latest_date)
        const cutoffDate = new Date(latestDate)
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const filteredData = data.data.filter(item => {
            const itemDate = new Date(item.date)
            return itemDate >= cutoffDate
        })

        // Recalculate statistics for filtered data
        const prices = filteredData.map(item => item.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        const priceRange = maxPrice - minPrice

        return {
            ...data,
            data: filteredData,
            min_price: minPrice,
            max_price: maxPrice,
            price_range: priceRange
        }
    }

    const handleDownloadPNG = async () => {
        if (chartRef.current === null || chartData === null) return

        const printOnlyElements = chartRef.current.querySelectorAll('.print-only')

        try {
            // Temporarily show the print-only elements
            printOnlyElements.forEach(el => {
                (el as HTMLElement).style.display = 'block'
            })

            const dataUrl = await toPng(chartRef.current, {
                backgroundColor: 'transparent',
                pixelRatio: 2
            })

            const link = document.createElement('a')
            link.download = `${chartData.ticker}-earnings-analysis.png`
            link.href = dataUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Failed to capture chart image:', err)
            setError('Failed to generate PNG. Please try again or use a different browser.')
        } finally {
            // Always hide the print-only elements, even if capture failed
            printOnlyElements.forEach(el => {
                (el as HTMLElement).style.display = 'none'
            })
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticker || !earningsDate) return

        setLoading(true)
        setError(null)
        setHasSearched(true)
        setChartData(null) // Clear previous data so we show skeletons
        setDateFilter('ALL') // Reset filter on new search
        try {
            const response = await fetch(`/api/chart/${ticker.toUpperCase()}?earnings_date=${earningsDate}`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown network error' }))
                throw new Error(errorData.detail || 'Data not found. Please verify ticker symbol and date.')
            }
            const data = await response.json()
            setChartData(data)
        } catch (err: any) {
            setError(err.message)
            setChartData(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full px-6 py-12 md:p-12 max-w-6xl mx-auto flex flex-col gap-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-tighter text-xl">
                        <Zap className="w-6 h-6 fill-current" />
                        MXI2
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight">Earnings Analysis</h1>
                    <p className="text-text-secondary text-lg max-w-md">Visualize stock performance surrounding earnings events with high-fidelity analytics.</p>
                </div>

                <form onSubmit={handleSearch} className="glass p-3 flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <div className="relative w-full sm:w-40">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            placeholder="Ticker"
                            className="pl-11 bg-transparent border-none focus:ring-0 w-full"
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-border-color hidden sm:block" />
                    <div className="relative w-full sm:w-48">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="date"
                            value={earningsDate}
                            onChange={(e) => setEarningsDate(e.target.value)}
                            className="pl-11 bg-transparent border-none focus:ring-0 w-full"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? 'Analyzing...' : 'Generate Report'}
                    </button>
                </form>
            </header>

            {error && (
                <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {!hasSearched && !loading && (
                <div className="glass flex-1 min-h-[400px] flex flex-col items-center justify-center p-12 text-center gap-4 border-dashed">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <BarChart3 className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Ready to analyze?</h3>
                    <p className="text-text-secondary max-w-sm mb-4">Enter a ticker symbol and an earnings date above to see visual performance metrics and price movements.</p>
                </div>
            )}

            {loading && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                    <div className="glass p-8">
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-3">
                                <Skeleton className="w-32 h-10 rounded-xl" />
                                <Skeleton className="w-64 h-4 rounded-full" />
                            </div>
                            <Skeleton className="w-24 h-12 rounded-xl" />
                        </div>
                        <ChartSkeleton />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                    </div>
                </div>
            )}

            {chartData && !loading && (
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="glass p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-4xl font-black tracking-tight">{chartData.ticker}</h2>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${chartData.price_change_pct >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        {chartData.price_change_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {chartData.price_change_pct >= 0 ? '+' : ''}{chartData.price_change_pct}%
                                    </div>
                                </div>
                                <p className="text-text-secondary flex items-center gap-2 font-medium">
                                    <Activity className="w-4 h-4" />
                                    Analysis Period: {filterChartData(chartData, dateFilter).data[0]?.date || chartData.data[0].date} — {chartData.latest_date}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Current Price</p>
                                    <p className="text-3xl font-black">${chartData.latest_price}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                            {(['1M', '3M', '6M', 'ALL'] as DateFilter[]).map((filter) => (
                                <DateFilterButton
                                    key={filter}
                                    filter={filter}
                                    isActive={dateFilter === filter}
                                    onClick={() => setDateFilter(filter)}
                                />
                            ))}
                        </div>

                        <div className="chart-container" ref={chartRef}>
                            <div className="print-only mb-4">
                                <h3 className="text-2xl font-black tracking-tight mb-1">{chartData.ticker} - Post-Earnings Analysis</h3>
                                <p className="text-sm text-text-secondary">Earnings Date: {chartData.earnings_date}</p>
                            </div>
                            <PriceChart data={filterChartData(chartData, dateFilter).data} earningsDate={chartData.earnings_date} />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleDownloadPNG}
                                className="flex items-center gap-2 py-2 px-4 text-sm bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                <Download className="w-4 h-4" />
                                Download PNG
                            </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
                            <StatCard
                                label="Earnings Price"
                                value={`$${chartData.earnings_price}`}
                                icon={<Calendar className="w-5 h-5" />}
                                subtext={`Reported on ${chartData.earnings_date}`}
                            />
                            <StatCard
                                label="Current Price"
                                value={`$${chartData.latest_price}`}
                                icon={<TrendingUp className="w-5 h-5" />}
                                subtext={`Last updated ${chartData.latest_date}`}
                            />
                            <StatCard
                                label="1-Day Reaction"
                                value={chartData.next_day_change_pct !== null ? `${chartData.next_day_change_pct}%` : 'N/A'}
                                icon={<ArrowLeftRight className="w-5 h-5" />}
                                trend={chartData.next_day_change_pct}
                            />
                            <StatCard
                                label="Price Range"
                                value={`$${filterChartData(chartData, dateFilter).price_range.toFixed(2)}`}
                                icon={<TrendingDown className="w-5 h-5" />}
                                subtext={`L: $${filterChartData(chartData, dateFilter).min_price.toFixed(2)} | H: $${filterChartData(chartData, dateFilter).max_price.toFixed(2)}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface DateFilterButtonProps {
    filter: DateFilter
    isActive: boolean
    onClick: () => void
}

function DateFilterButton({ filter, isActive, onClick }: DateFilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                : 'bg-white/[0.03] border border-white/10 text-text-secondary hover:bg-white/[0.08] hover:border-white/20'
                }`}
        >
            {filter}
        </button>
    )
}

function StatCard({ label, value, icon, subtext, trend }: StatCardProps) {
    return (
        <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{label}</span>
            </div>
            <div className="text-2xl font-black mb-1 flex items-center gap-2">
                {value}
                {trend !== undefined && trend !== null && (
                    <div className={`flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${trend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </div>
                )}
            </div>
            {subtext && <p className="text-[10px] text-text-muted font-bold tracking-tight uppercase opacity-60 m-0">{subtext}</p>}
        </div>
    )
}

export default App
