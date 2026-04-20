export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-6 space-y-1.5 px-5 pt-10">
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-fg">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-fg-hint">{subtitle}</p>}
    </header>
  );
}
