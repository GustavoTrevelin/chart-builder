import { useState } from 'react'
import { Search, Calendar, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import PriceChart from './components/PriceChart'

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

function App() {
    const [ticker, setTicker] = useState('')
    const [earningsDate, setEarningsDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chartData, setChartData] = useState<ChartData | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticker || !earningsDate) return

        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/chart/${ticker.toUpperCase()}?earnings_date=${earningsDate}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data. Check ticker and date format (YYYY-MM-DD).')
            }
            const data = await response.json()
            setChartData(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full p-8 max-w-6xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-2 gradient-text">Earnings Chart Builder</h1>
                <p className="text-gray-400">Analyze price performance post-earnings with modern precision.</p>
            </header>

            <div className="glass p-6 mb-8 flex flex-wrap gap-4 items-end justify-center">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ticker Symbol</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            placeholder="e.g. AAPL"
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Earnings Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="date"
                            value={earningsDate}
                            onChange={(e) => setEarningsDate(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <button onClick={handleSearch} disabled={loading} className="px-8">
                    {loading ? 'Analyzing...' : 'Generate Chart'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8 text-center">
                    {error}
                </div>
            )}

            {chartData && (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-700">
                    <div className="glass p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{chartData.ticker}</h2>
                                <p className="text-gray-400">Trading Period: {chartData.data[0].date} to {chartData.latest_date}</p>
                            </div>
                            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${chartData.price_change_pct >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {chartData.price_change_pct >= 0 ? '+' : ''}{chartData.price_change_pct}%
                            </div>
                        </div>

                        <div className="chart-container">
                            <PriceChart data={chartData.data} earningsDate={chartData.earnings_date} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            <StatCard
                                label="Earnings Price"
                                value={`$${chartData.earnings_price}`}
                                icon={<Calendar className="w-5 h-5" />}
                                subtext={`on ${chartData.earnings_date}`}
                            />
                            <StatCard
                                label="Latest Price"
                                value={`$${chartData.latest_price}`}
                                icon={<TrendingUp className="w-5 h-5" />}
                                subtext={`on ${chartData.latest_date}`}
                            />
                            <StatCard
                                label="1-Day Change"
                                value={chartData.next_day_change_pct !== null ? `${chartData.next_day_change_pct}%` : 'N/A'}
                                icon={<ArrowLeftRight className="w-5 h-5" />}
                                trend={chartData.next_day_change_pct}
                            />
                            <StatCard
                                label="Price Range"
                                value={`$${chartData.price_range}`}
                                icon={<TrendingDown className="w-5 h-5" />}
                                subtext={`Min: ${chartData.min_price} | Max: ${chartData.max_price}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, icon, subtext, trend }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                    {icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
            </div>
            <div className="text-xl font-bold mb-1 flex items-center gap-2">
                {value}
                {trend !== undefined && trend !== null && (
                    <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </span>
                )}
            </div>
            {subtext && <p className="text-[10px] text-gray-500 font-medium">{subtext}</p>}
        </div>
    )
}

export default App
