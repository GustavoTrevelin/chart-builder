import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'

interface PriceChartProps {
    data: Array<{ date: string; price: number }>
    earningsDate: string
}

const PriceChart = ({ data, earningsDate }: PriceChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                        const [year, month, day] = str.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                    minTickGap={40}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#121214',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#FF3B30', fontWeight: 'bold' }}
                />
                <ReferenceArea
                    x1={earningsDate}
                    x2={data[data.length - 1].date}
                    strokeOpacity={0.3}
                    fill="rgba(255,255,255,0.02)"
                    label={{ position: 'top', value: 'POST-EARNINGS', fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 'bold' }}
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#FF3B30"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#FF3B30' }}
                    animationDuration={1500}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default PriceChart
