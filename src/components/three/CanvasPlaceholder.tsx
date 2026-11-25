export function CanvasPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-surface rounded-card">
      <span className="text-muted text-sm font-mono animate-pulse">[*] {label}</span>
    </div>
  )
}
