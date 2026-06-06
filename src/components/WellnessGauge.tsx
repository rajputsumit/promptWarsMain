/** Animated circular wellness gauge — the dashboard's hero element. */
export function WellnessGauge({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  return (
    <div className="relative mb-6 h-48 w-48">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label={`Overall wellness ${score} out of 100, ${label}`}>
        <path
          className="stroke-current text-surface-variant"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth={3}
        />
        <path
          className="circle-progress stroke-current text-primary"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
          strokeWidth={3}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline-lg text-[48px] font-medium tracking-tight text-primary">
          {score}
        </span>
        <span className="mt-1 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
      </div>
    </div>
  );
}
