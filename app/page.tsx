// /app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 " />

      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-pcolor/90 text-white grid place-items-center font-bold">HR</span>
          <span className="text-lg font-semibold tracking-tight">Hr Plus</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hover:bg-transparent">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-pcolor hover:bg-scolor">
            <Link href="/register" className="inline-flex items-center gap-1">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 pt-8 md:grid-cols-2 md:pt-16">
        <div className="flex flex-col justify-center">
          

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-pcolor hover:bg-scolor">
              <Link href="/register" className="inline-flex items-center gap-2">
                Create your account <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="backdrop-blur border-border">
              <Link href="/login" className="inline-flex items-center gap-2">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Social proof / badges */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-greencolor" />
              Secure by design
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-scolor" />
              Fast & responsive
            </span>
          </div>
        </div>

        {/* Preview Card */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-linear-to-tr from-pcolor/10 via-scolor/10 to-transparent blur-2xl" />
          <div className="rounded-2xl border border-white/10 bg-card/70 p-4 shadow-2xl backdrop-blur">
            {/* Fake dashboard preview */}
            <div className="rounded-lg bg-background p-3">
              <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="mt-3 h-20 rounded bg-muted" />
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-3 h-28 rounded bg-muted" />
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-3 h-28 rounded bg-muted" />
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground">
              Preview of your dashboard — roles unlock the right tools.
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Feature title="Role-Based Access" desc="Super Admin, Admin, and Developer modes out of the box." />
          <Feature title="Modern Stack" desc="Next.js App Router, shadcn/ui, Tailwind — fast and scalable." />
          <Feature title="Beautiful by Default" desc="Polished UI with smooth transitions and smart defaults." />
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-16 w-full max-w-6xl px-6 pb-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hr Plus. All rights reserved.
      </footer>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
