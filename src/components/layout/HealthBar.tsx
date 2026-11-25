import { healthBg, healthText } from '@/lib/utils'

interface HealthBarProps {
  value:      number
  height?:    string
  showLabel?: boolean
  /** override fill color class (mis. compromise bar = bg-danger) */
  color?:     string
}

export function HealthBar({ value, height = 'h-1.5', showLabel = false, color }: HealthBarProps) {
  const v = Math.round(value)
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} bg-line rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color ?? healthBg(v)}`}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && (
        <span className={`font-mono text-xs w-10 text-right ${color ? 'text-txt' : healthText(v)}`}>{v}%</span>
      )}
    </div>
  )
}
