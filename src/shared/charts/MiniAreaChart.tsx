import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { IndicatorPoint } from '../../backend/worldbank'
import { CHART, TOOLTIP_STYLE } from './chartStyle'

interface MiniAreaChartProps {
  data: IndicatorPoint[]
  color?: string
  unit?: string
  name: string
  height?: number
  /** Charts sharing an id move their crosshair together. */
  syncId?: string
  format?: (value: number) => string
}

let gradientSeed = 0

export default function MiniAreaChart({
  data,
  color = CHART.accent,
  unit = '',
  name,
  height = 148,
  syncId,
  format,
}: MiniAreaChartProps) {
  // Each chart needs its own gradient id, otherwise four panels on one page all
  // paint with the colour of whichever was mounted first.
  const gradientId = `fill-${(gradientSeed += 1)}`
  const zeroCrossing = data.some((point) => (point.value ?? 0) < 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} syncId={syncId} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey="year"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickCount={4}
          allowDecimals={false}
          tick={{ fill: CHART.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          height={18}
        />
        <YAxis hide domain={['auto', 'auto']} />
        {zeroCrossing ? <ReferenceLine y={0} stroke={CHART.grid} /> : null}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: CHART.axis, fontSize: 11 }}
          cursor={{ stroke: CHART.axis, strokeDasharray: '3 3' }}
          formatter={(value) => [
            format ? format(Number(value)) : `${Number(value).toFixed(1)}${unit}`,
            name,
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: color }}
          connectNulls
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
