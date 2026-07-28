import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, LayoutGrid, List, Plus, Phone, User, Pencil } from "lucide-react";
import OrderForm from "@/components/order/OrderForm";
import OrderCard from "@/components/order/OrderCard";
import DeliveryCalendar from "@/components/delivery/DeliveryCalendar";
import DeliveryList from "@/components/delivery/DeliveryList";
import ProductionForm from "@/components/production/ProductionForm";

const VIEW_BUTTONS = [
  { value: "calendar", label: "Календарь", icon: CalendarIcon },
  { value: "grid", label: "Сетка", icon: LayoutGrid },
  { value: "list", label: "Список", icon: List },
];

const SORT_OPTIONS = [
  { value: "new", label: "Сначала новые" },
  { value: "old", label: "Сначала старые" },
  { value: "price", label: "По цене (дорогие)" },
];

export default function ProductionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [production, setProduction] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [prodFormOpen, setProdFormOpen] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("calendar");
  const [sort, setSort] = useState("new");

  const load = async () => {
    setLoading(true);
    try {
      const prod = await base44.entities.Production.get(id);
      setProduction(prod);
    } catch {
      setProduction(null);
    }
    const data = await base44.entities.Order.filter({ production_id: id }, "-created_date");
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

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

  const handleDelete = async (orderId) => {
    await base44.entities.Order.delete(orderId);
    load();
    syncToSheets();
  };

  const handleStatusChange = async (orderId, status) => {
    await base44.entities.Order.update(orderId, { status });
    load();
    syncToSheets();
  };

  const handleProductionSave = async (data) => {
    if (editProd) {
      await base44.entities.Production.update(editProd.id, data);
      setEditProd(null);
      setProdFormOpen(false);
      load();
    } else {
      const created = await base44.entities.Production.create(data);
      setProdFormOpen(false);
      navigate(`/production/${created.id}`);
    }
  };

  const filtered = orders.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.order_number?.toLowerCase().includes(q) ||
      item.order_name?.toLowerCase().includes(q) ||
      item.client_name?.toLowerCase().includes(q) ||
      item.client_phone?.toLowerCase().includes(q) ||
      item.client_address?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "new") return new Date(b.created_date) - new Date(a.created_date);
    if (sort === "old") return new Date(a.created_date) - new Date(b.created_date);
    if (sort === "price") return (b.price || 0) - (a.price || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!production) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Производство не найдено
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">{production.name}</h1>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
            {production.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" /> {production.phone}
              </span>
            )}
            {production.foreman_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" /> {production.foreman_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={() => { setEditProd(production); setProdFormOpen(true); }} title="Редактировать производство">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button onClick={() => { setEditProd(null); setProdFormOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Добавить произв.</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по номеру, имени, телефону, статусу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {VIEW_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setView(btn.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === btn.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <btn.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {search ? "Ничего не найдено" : "Нет заказов на этом производстве"}
        </div>
      ) : view === "calendar" ? (
        <DeliveryCalendar orders={sorted} onEdit={(it) => { setEditItem(it); setFormOpen(true); }} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((item) => (
            <OrderCard
              key={item.id}
              item={item}
              onEdit={(it) => { setEditItem(it); setFormOpen(true); }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <DeliveryList orders={sorted} onEdit={(it) => { setEditItem(it); setFormOpen(true); }} />
      )}

      <OrderForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editItem={editItem} defaultProductionId={id} />
      <ProductionForm open={prodFormOpen} onClose={() => { setProdFormOpen(false); setEditProd(null); }} onSave={handleProductionSave} editItem={editProd} />
    </div>
  );
}