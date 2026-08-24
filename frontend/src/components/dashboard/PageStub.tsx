export default function PageStub({ title, module }: { title: string; module: string }) {
  return (
    <div className="border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-mono text-xs text-muted">{module}</p>
      <h2 className="mt-2 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted">This module hasn&apos;t been built yet.</p>
    </div>
  );
}
