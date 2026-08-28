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
import type { IndicatorPoint } from '../../backend/worldbank'
import { CHART, TOOLTIP_STYLE } from './chartStyle'

export interface ChartMarker {
  year: number
  label: string
}

interface IndicatorLineChartProps {
  data: IndicatorPoint[]
  unit?: string
  seriesName?: string
  markers?: ChartMarker[]
  height?: number
}

export default function IndicatorLineChart({
  data,
  unit = '',
  seriesName = 'Value',
  markers = [],
  height = 260,
}: IndicatorLineChartProps) {
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
          cursor={{ stroke: CHART.axis, strokeDasharray: '3 3' }}
          formatter={(value) => [`${Number(value).toFixed(2)}${unit}`, seriesName]}
          labelFormatter={(label) => String(label)}
        />
        {markers.map((marker) => (
          <ReferenceLine
            key={marker.year}
            x={marker.year}
            stroke={CHART.axis}
            strokeDasharray="4 4"
            label={{ value: marker.label, fill: CHART.axis, fontSize: 11, position: 'insideTop' }}
          />
        ))}
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART.accent}
          strokeWidth={2}
          dot={false}
          connectNulls
          name={seriesName}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
