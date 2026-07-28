import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import moment from "moment";

export default function BalancePage() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    Promise.all([
      base44.entities.Income.list(),
      base44.entities.Expense.list(),
    ]).then(([inc, exp]) => {
      setIncomes(inc);
      setExpenses(exp);
      setLoading(false);
      setNow(new Date());
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
  const isCurrentMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const totalDebt = incomes.filter((i) => isCurrentMonth(i.debt_return_date || i.date)).reduce((s, i) => s + (i.debt || 0), 0);
  const balance = totalIncome - totalExpenses - totalDebt;

  const fmt = (n) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Остаток</h1>

      <div className="max-w-lg mx-auto">
        {/* Main balance card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-white text-center mb-6 shadow-lg">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <p className="text-emerald-100 text-sm font-medium mb-1">Актуальный остаток</p>
          <p className="text-4xl font-heading font-bold">{fmt(balance)} ₽</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-emerald-200 text-sm">
            <Clock className="w-4 h-4" />
            <span>{moment(now).format("DD.MM.YYYY HH:mm:ss")}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Доходы</span>
            </div>
            <span className="text-lg font-bold text-emerald-600">+{fmt(totalIncome)} ₽</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Расходы</span>
            </div>
            <span className="text-lg font-bold text-red-500">−{fmt(totalExpenses)} ₽</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Долг</span>
            </div>
            <span className="text-lg font-bold text-amber-600">−{fmt(totalDebt)} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}