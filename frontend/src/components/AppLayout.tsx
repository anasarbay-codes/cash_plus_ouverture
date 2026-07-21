import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Users, FileText, Rocket, LayoutDashboard, Building2, LogOut, Menu, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }

const allNav: NavItem[] = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/prospections", label: "Prospection", icon: Users },
  { to: "/demandes", label: "Demandes d'ouverture", icon: FileText },
  { to: "/suivis", label: "Suivi d'ouverture", icon: Rocket },
  { to: "/users", label: "Utilisateurs", icon: Users },
];

const agentNav: NavItem[] = allNav.filter((n) => n.to === "/" || n.to === "/prospections");

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useAuthStore((s) => s.role);
  const name = useAuthStore((s) => s.name);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const nav = useMemo(() => {
    if (role === "AGENT") return agentNav;
    if (role === "VALIDATEUR") return allNav.filter((n) => n.to !== "/users");
    return allNav;
  }, [role]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLinks = ({ className, mobile }: { className?: string; mobile?: boolean }) => (
    <nav className={className}>
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={cn(
              mobile
                ? "flex flex-col items-center gap-0.5 text-[10px]"
                : "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
              "transition-colors",
              active
                ? mobile
                  ? "text-primary font-medium"
                  : "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : mobile
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
            {mobile ? item.label.replace(/ .*/, "") : item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile drawer sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Cash Plus</div>
              <div className="text-xs text-sidebar-foreground/70">Gestion Ouvertures</div>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-sidebar-accent/60">
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks className="flex-1 px-3 py-4 space-y-1" />
        <div className="p-4 border-t border-sidebar-border">
          {name && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{name}</div>
                <div className="text-[11px] text-sidebar-foreground/60 capitalize">{role?.toLowerCase()}</div>
              </div>
              <button
                type="button"
                onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
                className="p-1.5 rounded hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                title="Deconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Cash Plus</div>
            <div className="text-xs text-sidebar-foreground/70">Gestion Ouvertures</div>
          </div>
        </div>
        <NavLinks className="flex-1 px-3 py-4 space-y-1" />
        <div className="p-4 border-t border-sidebar-border">
          {name && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{name}</div>
                <div className="text-[11px] text-sidebar-foreground/60 capitalize">{role?.toLowerCase()}</div>
              </div>
              <button
                type="button"
                onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
                className="p-1.5 rounded hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                title="Deconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile header with hamburger */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1.5 rounded hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Cash Plus</span>
          </div>
          <div className="w-8" />
        </header>

        <header className="hidden md:block border-b bg-card">
          <div className="px-6 md:px-10 py-5">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>

        {/* Mobile title */}
        <div className="md:hidden px-4 pt-4 pb-2">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex-1 px-4 md:px-10 py-4 md:py-8">{children}</div>
      </main>

      {/* Mobile bottom navbar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-card border-t flex items-center justify-around py-1 safe-area-bottom">
        <NavLinks className="flex items-center justify-around w-full" mobile />
      </nav>
    </div>
  );
}
