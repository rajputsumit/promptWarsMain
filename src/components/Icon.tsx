import { clsx } from "@/lib/clsx";

/** Thin wrapper over Material Symbols. Decorative by default (aria-hidden). */
export function Icon({
  name,
  className,
  filled = false,
  label,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  label?: string;
}) {
  return (
    <span
      className={clsx("material-symbols-outlined", filled && "icon-fill", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
