import type {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';
import type { Member } from '../../types';

const mainNavItems = [
  { href: '#catalog', label: '제품 탐색' },
  { href: '#cart', label: '장바구니' },
  { href: '#mypage', label: 'My Page' },
  { href: '#admin', label: 'Admin' },
] as const;

export function ScreenHeader({ member }: { member: Member | null }) {
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm"><SparkGridIcon className="h-4 w-4 text-accent" /></div><div><p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Sync Apple</p><h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Premium Mall</h1></div></div><nav className="hidden items-center gap-1 lg:flex">{mainNavItems.map((item) => <a key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{item.label}</a>)}</nav><div className="flex items-center gap-2"><div className="hidden rounded-full border border-border/80 bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm md:flex md:items-center md:gap-2"><span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />Live commerce preview</div><div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-medium text-accent shadow-sm">{member ? `${member.name} 님` : 'Guest'}</div></div></div></header>;
}

export function Button({
  ariaLabel,
  asChild,
  children,
  className,
  onClick,
  size = 'default',
  variant = 'default',
}: {
  ariaLabel?: string;
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'secondary-dark' | 'ghost' | 'light';
}) {
  const sizeClass = size === 'sm' ? 'h-9 px-4 text-xs' : size === 'lg' ? 'h-12 px-5 text-sm' : 'h-10 px-4 text-sm';
  const variantClass =
    variant === 'secondary'
      ? 'border border-border bg-card text-foreground hover:bg-muted'
      : variant === 'secondary-dark'
        ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
        : variant === 'ghost'
          ? 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
          : variant === 'light'
            ? 'bg-white text-slate-950 hover:bg-slate-100'
            : 'bg-accent text-white hover:bg-sky-600';
  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClass,
    variantClass,
    className,
  );

  if (asChild && isAnchorChild(children)) {
    return <a href={children.props.href} className={classes}>{children.props.children}</a>;
  }

  return <button type="button" aria-label={ariaLabel} className={classes} onClick={onClick}>{children}</button>;
}

function isAnchorChild(children: ReactNode): children is ReactElement<{ href: string; children: ReactNode }> {
  return Boolean(children && typeof children === 'object' && 'props' in children && typeof children.props.href === 'string');
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', props.className)} />;
}

export function FieldGroup({ children, label }: { children: ReactNode; label: string }) {
  return <label className="space-y-2"><span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{label}</span>{children}</label>;
}

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cn('rounded-[30px] border border-border bg-card p-6 shadow-sm', className)}>{children}</section>;
}

export function Badge({ children, className, variant = 'default' }: { children: ReactNode; className?: string; variant?: 'default' | 'secondary' | 'secondary-dark' | 'outline' }) {
  const variantClass = variant === 'secondary' ? 'border-transparent bg-emerald-500/10 text-emerald-700' : variant === 'secondary-dark' ? 'border-white/10 bg-white/8 text-slate-200' : variant === 'outline' ? 'border-border bg-background/70 text-muted-foreground' : 'border-accent/10 bg-accent/10 text-accent';
  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]', variantClass, className)}>{children}</span>;
}

export function SectionHeading({ description, eyebrow, invert = false, title }: { description: string; eyebrow: string; invert?: boolean; title: string }) {
  return <div><p className={cn('text-xs font-medium uppercase tracking-[0.28em]', invert ? 'text-slate-400' : 'text-muted-foreground')}>{eyebrow}</p><h2 className={cn('mt-2 text-2xl font-semibold tracking-tight sm:text-3xl', invert ? 'text-white' : 'text-foreground')}>{title}</h2><p className={cn('mt-2 max-w-2xl text-sm leading-6', invert ? 'text-slate-300' : 'text-muted-foreground')}>{description}</p></div>;
}

export function QuickSummaryCard({ description, label, value }: { description: string; label: string; value: number }) {
  return <div className="rounded-[24px] border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5"><p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>;
}

export function MetaPill({ label, value }: { label: string; value: number }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2"><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span><span className="text-sm font-medium text-foreground">{value}</span></div>;
}

export function InlineBanner({ children, tone = 'success' }: { children: ReactNode; tone?: 'success' | 'critical' }) {
  return <div className={cn('rounded-2xl border px-4 py-3 text-sm shadow-sm', tone === 'critical' ? 'border-destructive/20 bg-destructive/5 text-destructive' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700')}>{children}</div>;
}

export function EmptyState({ actionLabel, description, onAction, title, tone = 'default' }: { actionLabel?: string; description: string; onAction?: () => void; title: string; tone?: 'default' | 'critical' | 'inverted' }) {
  return <div className={cn('flex flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-10 text-center', tone === 'critical' ? 'border-destructive/20 bg-destructive/5' : tone === 'inverted' ? 'border-white/10 bg-white/5' : 'border-border bg-muted/30')}><div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', tone === 'critical' ? 'bg-destructive/10 text-destructive' : tone === 'inverted' ? 'bg-white/10 text-white' : 'bg-accent/10 text-accent')}><InboxIcon className="h-5 w-5" /></div><h3 className={cn('mt-4 text-lg font-semibold', tone === 'inverted' ? 'text-white' : 'text-foreground')}>{title}</h3><p className={cn('mt-2 max-w-md text-sm leading-6', tone === 'inverted' ? 'text-slate-300' : 'text-muted-foreground')}>{description}</p>{actionLabel && onAction ? <Button className="mt-5" variant={tone === 'inverted' ? 'light' : 'default'} onClick={onAction}>{actionLabel}</Button> : null}</div>;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-muted', className)} />;
}

export function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[24px] border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"><p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">{label}</p><p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</p></div>;
}

export function SparkGridIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true"><path d="M8 3v6H3" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 8h-6V3" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 21v-6H3" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 16h-6v5" strokeLinecap="round" strokeLinejoin="round" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></svg>;
}

export function PulseIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true"><path d="M3 12h4l2.5-5 5 10 2.5-5H21" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function InboxIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true"><path d="M4 13.5V6.75A1.75 1.75 0 0 1 5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v6.75" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 13.5h4.5l1.5 2h4l1.5-2H20V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
