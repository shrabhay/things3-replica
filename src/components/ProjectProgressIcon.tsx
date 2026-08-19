/** A small ring that fills clockwise as a project's to-dos are completed — the "pie chart" progress indicator. */
export function ProjectProgressIcon({
  percent,
  size = 15,
  className,
}: {
  percent: number;
  size?: number;
  className?: string;
}) {
  const strokeWidth = size <= 16 ? 2 : 2.5;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - clamped / 100);
  const center = size / 2;
  const done = clamped >= 100;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={strokeWidth}
      />
      {clamped > 0 && !done && (
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
      {done && (
        <>
          <circle cx={center} cy={center} r={r} fill="currentColor" fillOpacity={0.15} />
          <path
            d={`M ${size * 0.27} ${size * 0.52} L ${size * 0.43} ${size * 0.68} L ${size * 0.75} ${size * 0.32}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
