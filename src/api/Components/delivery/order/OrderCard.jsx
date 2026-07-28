import React from "react";
import { Pencil, Trash2, Phone, MapPin, User, Calendar } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "запланирована доставка", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "отправлено в производство", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "готово", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "отправлено в доставку", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { value: "доставлено", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export default function OrderCard({ item, onEdit, onDelete, onStatusChange }) {
  const status = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
  const fmt = (n) => (n || 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs text-gray-400">№ {item.order_number}</span>
          <h3 className="font-semibold text-gray-900 truncate">{item.order_name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${status.color}`}>
          {item.status || "запланирована доставка"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-emerald-600 font-bold">{fmt(item.price)} ₽</span>
        {item.size && <span className="text-sm text-gray-500">Размер: {item.size}</span>}
      </div>

      {(item.client_name || item.client_phone || item.client_address || item.delivery_date) && (
        <div className="space-y-1 text-sm text-gray-600">
          {item.client_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{item.client_name}</span>
            </div>
          )}
          {item.client_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`tel:${item.client_phone}`} className="hover:text-gray-900">{item.client_phone}</a>
            </div>
          )}
          {item.client_address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{item.client_address}</span>
            </div>
          )}
          {item.delivery_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Доставка: {item.delivery_date}</span>
            </div>
          )}
        </div>
      )}

      {item.characteristics && (
        <p className="text-sm text-gray-500 line-clamp-2">{item.characteristics}</p>
      )}

      {item.photo_url && (
        <Image src={item.photo_url} alt={item.order_name} className="w-full h-40 rounded-lg" fittingType="fill" />
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <Select value={item.status || "запланирована доставка"} onValueChange={(v) => onStatusChange(item.id, v)}>
          <SelectTrigger className="h-8 text-xs w-auto min-w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}