import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest mb-4">
        404
      </p>
      <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-3">
        Page not found
      </h1>
      <p className="text-[var(--color-muted)] mb-8 max-w-sm">
        The page you requested doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/ko"
        className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-dim)] transition-colors"
      >
        Back to Home →
      </Link>
    </div>
  );
}
