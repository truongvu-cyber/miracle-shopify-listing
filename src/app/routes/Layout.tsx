import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useListingStore } from "@/hooks/useListingStore";
import { useThemeStore } from "@/hooks/useThemeStore";
import { SettingsModal } from "@/components/listing/SettingsModal";
import {
  FilePlus2,
  History,
  Settings,
  ShoppingBag,
  CheckCircle,
  ListChecks,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
} from "lucide-react";

function SidebarLink({
  to,
  icon: Icon,
  label,
  end,
  onClick,
}: {
  to: string;
  icon: typeof FilePlus2;
  label: string;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-[var(--brand)] text-[var(--text-on-brand)] shadow-lg shadow-[var(--brand)]/25"
            : "text-[var(--text-sidebar)] hover:text-[var(--text-sidebar-active)] hover:bg-white/5"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const options = [
    { value: "light" as const, icon: Sun, label: "Sáng" },
    { value: "dark" as const, icon: Moon, label: "Tối" },
    { value: "system" as const, icon: Monitor, label: "Hệ thống" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-white/5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`p-1.5 rounded-[var(--radius-sm)] transition-all duration-150 cursor-pointer ${
            theme === value
              ? "bg-[var(--brand)] text-white shadow-sm"
              : "text-[var(--text-sidebar)] hover:text-white"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { jobs, completedJobsToday } = useListingStore();
  const completed = completedJobsToday();

  // Close sidebar on route change (mobile)
  const closeSidebar = () => setSidebarOpen(false);

  // Close sidebar on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-app)] transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-30 md:hidden p-2 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-[var(--shadow-md)] cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-60 flex-shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border)]
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile close */}
        <button
          onClick={closeSidebar}
          className="absolute top-3 right-3 md:hidden p-1 rounded text-[var(--text-sidebar)] hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--brand)] flex items-center justify-center shadow-lg shadow-[var(--brand)]/30">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Miracle Shopify
            </h1>
            <p className="text-[11px] text-[var(--text-sidebar)]">Listing v1.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarLink to="/" icon={FilePlus2} label="Tạo Listing" end onClick={closeSidebar} />
          <SidebarLink to="/history" icon={History} label="Lịch sử" onClick={closeSidebar} />
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <ThemeToggle />
        </div>

        {/* Settings */}
        <div className="px-3 pb-3">
          <button
            onClick={() => { setSettingsOpen(true); closeSidebar(); }}
            className="
              flex items-center gap-3 w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm
              text-[var(--text-sidebar)] hover:text-[var(--text-sidebar-active)] hover:bg-white/5
              transition-all duration-150 cursor-pointer
            "
          >
            <Settings className="h-[18px] w-[18px]" />
            Cài đặt
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[var(--text-sidebar)]">
              <ListChecks className="h-3.5 w-3.5" />
              <span>{jobs.length} jobs</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--success)]">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{completed} hôm nay</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-0 md:pt-0">
        <div className="pt-12 md:pt-0">
          <Outlet />
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
