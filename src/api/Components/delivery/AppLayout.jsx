import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, Wallet, LogOut, Menu, X, ShoppingBag, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/", label: "Дашборд", icon: LayoutDashboard },
  { path: "/income", label: "Доходы", icon: TrendingUp },
  { path: "/expenses", label: "Расходы", icon: TrendingDown },
  { path: "/balance", label: "Остаток", icon: Wallet },
  { path: "/orders", label: "Заказы", icon: ShoppingBag },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    base44.entities.Production.list().then(setProductions).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Wallet className="w-6 h-6 text-emerald-600 mr-3" />
          <span className="font-heading font-bold text-lg tracking-tight">Festo</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
          {productions.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Производство</div>
              {productions.map((p) => {
                const active = location.pathname === `/production/${p.id}`;
                return (
                  <Link
                    key={p.id}
                    to={`/production/${p.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <Truck className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-heading font-bold text-lg">Festo</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}