import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Card({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <section aria-label={label} className={cn("card fancy-shadow p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "demo" | "live" | "muted" }) {
  const tones: Record<string, string> = {
    info: "bg-brand-50 text-brand-700 border border-brand-100",
    demo: "bg-amber-50 text-amber-800 border border-amber-200",
    live: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    muted: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-ink-600">{label}</span>
          <span className="font-semibold" aria-live="polite">{value}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-lg", className ?? "h-4 w-full")} />;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
        props.className,
      )}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink-900 transition hover:border-brand-500 hover:text-brand-700 disabled:opacity-60",
        props.className,
      )}
    />
  );
}
