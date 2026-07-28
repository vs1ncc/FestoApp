import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";
import OrderForm from "@/components/order/OrderForm";
import OrderCard from "@/components/order/OrderCard";
import { exportToCsv } from "@/lib/exportCsv";
import { groupByDate } from "@/lib/groupByDate";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => base44.entities.Order.list("-date").then((data) => { setOrders(data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const syncToSheets = async () => {
    try { await base44.functions.invoke('syncOrdersToSheets', {}); } catch (err) { console.error('Sheets sync failed:', err); }
  };

  const notifyTelegram = async (orderId) => {
    try { await base44.functions.invoke('sendTelegramNotification', { orderId }); } catch (err) { console.error('Telegram notify failed:', err); }
  };

  const handleSave = async (data) => {
    let createdId = null;
    if (editItem) {
      await base44.entities.Order.update(editItem.id, data);
    } else {
      const created = await base44.entities.Order.create(data);
      createdId = created?.id;
    }
    load();
    syncToSheets();
    if (createdId) notifyTelegram(createdId);
  };

  const handleDelete = async (id) => {
    await base44.entities.Order.delete(id);
    load();
    syncToSheets();
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    load();
    syncToSheets();
  };

  const handleExport = () => {
    exportToCsv("заказы.csv",
      ["Номер", "Наименование", "Цена", "Размер", "Дата", "Статус", "ФИО клиента", "Телефон", "Адрес", "Дата доставки", "Характеристики"],
      filtered.map((o) => [o.order_number, o.order_name, o.price, o.size, o.date, o.status, o.client_name, o.client_phone, o.client_address, o.delivery_date, o.characteristics]));
  };

  const filtered = orders.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.order_number?.toLowerCase().includes(q) ||
      item.order_name?.toLowerCase().includes(q) ||
      item.size?.toLowerCase().includes(q) ||
      item.client_name?.toLowerCase().includes(q) ||
      item.client_phone?.toLowerCase().includes(q) ||
      item.client_address?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
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
        <h1 className="text-2xl font-heading font-bold text-gray-900">Заказы</h1>
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
          placeholder="Поиск по номеру, имени, телефону, адресу, статусу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {search ? "Ничего не найдено" : "Нет заказов"}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm py-2 px-1">
                <h2 className="font-semibold text-gray-700 text-sm">{group.label}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
                {group.items.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    onEdit={(it) => { setEditItem(it); setFormOpen(true); }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editItem={editItem} />
    </div>
  );
}