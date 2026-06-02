"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Vocabulaire", icon: Library },
  { href: "/review", label: "Réviser", icon: BookOpen },
  { href: "/stories", label: "Histoires", icon: Sparkles },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
        <Link
          href="/dashboard"
          className="mr-2 flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-7 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
            L
          </span>
          <span className="hidden sm:inline">Lexio</span>
        </Link>

        <div className="flex flex-1 items-center gap-0.5">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Button
                key={href}
                render={
                  <Link href={href} aria-current={active ? "page" : undefined} />
                }
                variant={active ? "secondary" : "ghost"}
                size="sm"
              >
                <Icon className="size-4" />
                <span className="hidden md:inline">{label}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            render={<Link href="/settings" aria-label="Réglages" />}
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            size="icon"
          >
            <Settings className="size-5" />
          </Button>
          <ThemeToggle />
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Se déconnecter"
            >
              <LogOut className="size-5" />
            </Button>
          </form>
        </div>
      </nav>
    </header>
  );
}
