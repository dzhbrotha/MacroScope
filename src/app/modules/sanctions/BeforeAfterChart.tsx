import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART, TOOLTIP_STYLE } from '../../../shared/charts/chartStyle'

export interface BeforeAfterRow {
  name: string
  before: number | null
  after: number | null
}

interface BeforeAfterChartProps {
  rows: BeforeAfterRow[]
  beforeLabel: string
  afterLabel: string
  height?: number
}

// The three indicator cards carry the same numbers, but the fall after a
// sanction package only reads at a glance as a pair of bars.
export default function BeforeAfterChart({
  rows,
  beforeLabel,
  afterLabel,
  height = 280,
}: BeforeAfterChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={{ stroke: CHART.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: CHART.axis }}
          cursor={{ fill: CHART.grid, opacity: 0.25 }}
          formatter={(value, name) => [`${Number(value).toFixed(1)}%`, String(name)]}
        />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 12, color: CHART.axis }}
        />
        <Bar dataKey="before" name={beforeLabel} fill={CHART.accent} />
        <Bar dataKey="after" name={afterLabel} fill={CHART.error} />
      </BarChart>
    </ResponsiveContainer>
  )
}
