import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { IndicatorPoint } from '../../backend/worldbank'
import { CHART, TOOLTIP_STYLE } from './chartStyle'

export interface ChartSeries {
  key: string
  name: string
  color: string
  data: IndicatorPoint[]
}

interface MultiLineChartProps {
  series: ChartSeries[]
  unit?: string
  height?: number
}

function mergeSeries(series: ChartSeries[]) {
  const years = new Set<number>()
  series.forEach((item) => item.data.forEach((point) => years.add(point.year)))
  return [...years]
    .sort((a, b) => a - b)
    .map((year) => {
      const row: Record<string, number | null> = { year }
      series.forEach((item) => {
        row[item.key] = item.data.find((point) => point.year === year)?.value ?? null
      })
      return row
    })
}

export default function MultiLineChart({ series, unit = '', height = 320 }: MultiLineChartProps) {
  const rows = mergeSeries(series)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickCount={8}
          allowDecimals={false}
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={{ stroke: CHART.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(value) => `${value}${unit}`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: CHART.axis }}
          cursor={{ stroke: CHART.axis, strokeDasharray: '3 3' }}
          formatter={(value, name) => [`${Number(value).toFixed(2)}${unit}`, String(name)]}
          labelFormatter={(label) => String(label)}
        />
        <Legend
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: CHART.axis }}
        />
        {series.map((item) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name}
            stroke={item.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
