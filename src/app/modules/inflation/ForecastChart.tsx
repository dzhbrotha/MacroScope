import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART, TOOLTIP_STYLE } from '../../../shared/charts/chartStyle'
import type { ForecastPoint } from './forecast'

interface ForecastChartProps {
  data: ForecastPoint[]
  boundaryYear: number
  unit?: string
  height?: number
  actualLabel?: string
  forecastLabel?: string
}

export default function ForecastChart({
  data,
  boundaryYear,
  unit = '%',
  height = 300,
  actualLabel = 'Actual',
  forecastLabel = 'Forecast',
}: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
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
          formatter={(value, name) => [`${Number(value).toFixed(2)}${unit}`, String(name)]}
          labelFormatter={(label) => String(label)}
        />
        <ReferenceLine
          x={boundaryYear}
          stroke={CHART.axis}
          strokeDasharray="4 4"
          label={{
            value: forecastLabel,
            fill: CHART.axis,
            fontSize: 11,
            position: 'insideTopRight',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          name={actualLabel}
          stroke={CHART.accent}
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name={forecastLabel}
          stroke={CHART.accentSoft}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
