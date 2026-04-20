export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 space-y-1 px-5 pt-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">{title}</h1>
      {subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}
    </header>
  );
}
