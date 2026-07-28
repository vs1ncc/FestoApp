import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, parseISO,
  addMonths, subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_COLORS = {
  "запланирована доставка": "bg-blue-100 text-blue-700 border-blue-200",
  "отправлено в производство": "bg-amber-100 text-amber-700 border-amber-200",
  "готово": "bg-violet-100 text-violet-700 border-violet-200",
  "отправлено в доставку": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "доставлено": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function DeliveryCalendar({ orders, onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const ordersByDate = {};
  orders.forEach((o) => {
    if (!o.delivery_date) return;
    const key = format(parseISO(o.delivery_date), "yyyy-MM-dd");
    if (!ordersByDate[key]) ordersByDate[key] = [];
    ordersByDate[key].push(o);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-heading font-bold text-lg text-gray-900 capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors">
            Сегодня
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-gray-400 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px]">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayOrders = ordersByDate[key] || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={key}
                className={`min-h-[110px] border-b border-r border-gray-50 p-1.5 ${inMonth ? "bg-white" : "bg-gray-50/30"}`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${today ? "bg-emerald-500 text-white" : inMonth ? "text-gray-700" : "text-gray-300"}`}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayOrders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      onClick={() => onEdit(o)}
                      className={`text-xs px-1.5 py-1 rounded border cursor-pointer truncate hover:scale-[1.02] transition-transform ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                      title={o.order_name}
                    >
                      {o.order_name}
                    </div>
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="text-xs text-gray-400 px-1.5 font-medium">
                      +{dayOrders.length - 3} ещё
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}