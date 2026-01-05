import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'

interface PriceChartProps {
    data: Array<{ date: string; price: number }>
    earningsDate: string
}

const PriceChart = ({ data, earningsDate }: PriceChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FE0018" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#FE0018" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                    minTickGap={40}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#161618',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px'
                    }}
                    itemStyle={{ color: '#FE0018' }}
                />
                <ReferenceArea
                    x1={earningsDate}
                    x2={data[data.length - 1].date}
                    strokeOpacity={0.3}
                    fill="rgba(255,255,255,0.05)"
                    label={{ position: 'top', value: 'Post-Earnings', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#FE0018"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#FE0018' }}
                    animationDuration={1500}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default PriceChart
