import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Wallet, ShoppingCart, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/exportCsv";

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold font-heading mt-1">{value}</p>
      </div>
    </div>
  );
}

function CategoryBreakdown({ title, items, colorClass }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-heading font-bold text-lg mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-sm">Нет данных</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{cat || "Без категории"}</span>
              <span className={`font-semibold ${colorClass}`}>{amount.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Income.list(),
      base44.entities.Expense.list(),
    ]).then(([inc, exp]) => {
      setIncomes(inc);
      setExpenses(exp);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const now = new Date();
  const isCurrentMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const totalDebt = incomes.filter((i) => isCurrentMonth(i.debt_return_date || i.date)).reduce((s, i) => s + (i.debt || 0), 0);
  const balance = totalIncome - totalExpenses - totalDebt;
  const orderCount = incomes.length;

  const fmt = (n) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const incomeByCategory = incomes.reduce((acc, item) => {
    const cat = item.category || "Без категории";
    acc[cat] = (acc[cat] || 0) + (item.amount || 0);
    return acc;
  }, {});

  const expenseByCategory = expenses.reduce((acc, item) => {
    const cat = item.category || "Без категории";
    acc[cat] = (acc[cat] || 0) + (item.amount || 0);
    return acc;
  }, {});

  const handleExport = () => {
    const rows = [
      ["Доходы", fmt(totalIncome)],
      ["Расходы", fmt(totalExpenses)],
      ["Долг", fmt(totalDebt)],
      ["Остаток", fmt(balance)],
      ["Количество заказов", orderCount],
      [],
      ["Доходы по категориям", ""],
      ...Object.entries(incomeByCategory).map(([k, v]) => [k, fmt(v)]),
      [],
      ["Расходы по категориям", ""],
      ...Object.entries(expenseByCategory).map(([k, v]) => [k, fmt(v)]),
    ];
    exportToCsv("отчёт.csv", ["Показатель", "Значение"], rows);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Дашборд</h1>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Экспорт отчёта</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Доходы" value={`${fmt(totalIncome)} ₽`} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={TrendingDown} label="Расходы" value={`${fmt(totalExpenses)} ₽`} color="text-red-500" bgColor="bg-red-50" />
        <StatCard icon={Wallet} label="Остаток" value={`${fmt(balance)} ₽`} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={ShoppingCart} label="Количество заказов" value={orderCount} color="text-violet-600" bgColor="bg-violet-50" />
        <StatCard icon={AlertTriangle} label="Долг" value={`${fmt(totalDebt)} ₽`} color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <CategoryBreakdown title="Доходы по категориям" items={incomeByCategory} colorClass="text-emerald-600" />
        <CategoryBreakdown title="Расходы по категориям" items={expenseByCategory} colorClass="text-red-500" />
      </div>
    </div>
  );
}