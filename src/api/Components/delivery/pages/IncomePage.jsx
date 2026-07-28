import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import IncomeForm from "@/components/income/IncomeForm";
import { exportToCsv } from "@/lib/exportCsv";
import { groupByDate } from "@/lib/groupByDate";

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => base44.entities.Income.list("-date").then((data) => { setIncomes(data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editItem) {
      await base44.entities.Income.update(editItem.id, data);
    } else {
      await base44.entities.Income.create(data);
    }
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Income.delete(id);
    load();
  };

  const handleExport = () => {
    exportToCsv("доходы.csv", ["ФИО заказчика", "Сумма", "Наименование заказа", "Операция", "Категория", "Долг", "Дата"],
      filtered.map((i) => [i.client_name, i.amount, i.order_name, i.operation_name, i.category, i.debt, i.date]));
  };

  const fmt = (n) => (n || 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filtered = incomes.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.client_name?.toLowerCase().includes(q) ||
      item.order_name?.toLowerCase().includes(q) ||
      item.operation_name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const grouped = groupByDate(filtered, "date", "desc");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Доходы</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Экспорт
          </Button>
          <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Добавить
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Поиск по заказу, операции, клиенту, категории..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {search ? "Ничего не найдено" : "Нет записей о доходах"}
        </div>
      ) : (
        <>
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ФИО заказчика</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Наименование заказа</th>
                <th className="px-4 py-3 font-medium">Операция</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Долг</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((group) => (
                <React.Fragment key={group.key}>
                  <tr className="bg-gray-50/80">
                    <td colSpan={7} className="px-4 py-2 font-semibold text-gray-700 text-sm">
                      {group.label}
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.client_name}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">{fmt(item.amount)} ₽</td>
                      <td className="px-4 py-3 text-gray-700">{item.order_name}</td>
                      <td className="px-4 py-3 text-gray-700">{item.operation_name}</td>
                      <td className="px-4 py-3 text-gray-700">{item.category || "—"}</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold">{fmt(item.debt)} ₽</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4">
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="text-sm font-semibold text-gray-700 mb-2 px-1">{group.label}</div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-gray-900">{item.client_name}</span>
                      <span className="text-emerald-600 font-semibold whitespace-nowrap">{fmt(item.amount)} ₽</span>
                    </div>
                    {item.order_name && <div className="text-sm text-gray-600">{item.order_name}</div>}
                    {item.operation_name && <div className="text-sm text-gray-500">{item.operation_name}</div>}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.category || "—"}</span>
                      {item.debt > 0 && <span className="text-sm text-amber-600 font-semibold">Долг: {fmt(item.debt)} ₽</span>}
                    </div>
                    <div className="flex gap-1 justify-end pt-2 border-t border-gray-100">
                      <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      <IncomeForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editItem={editItem} />
    </div>
  );
}