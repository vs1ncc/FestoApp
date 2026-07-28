import React from "react";

const STATUS_COLORS = {
  "запланирована доставка": "bg-blue-50 text-blue-700 border-blue-200",
  "отправлено в производство": "bg-amber-50 text-amber-700 border-amber-200",
  "готово": "bg-violet-50 text-violet-700 border-violet-200",
  "отправлено в доставку": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "доставлено": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function DeliveryList({ orders, onEdit }) {
  const fmt = (n) => (n || 0).toLocaleString("ru-RU");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">№</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Заказ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Клиент</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Доставка</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Статус</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Цена</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => onEdit(o)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{o.order_number || "—"}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{o.order_name || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{o.client_name || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{o.delivery_date || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[o.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {o.status || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right whitespace-nowrap">
                  {fmt(o.price)} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}