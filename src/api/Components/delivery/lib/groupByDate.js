import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function groupByDate(items, dateKey = "date", order = "asc") {
  const groups = {};
  items.forEach((item) => {
    const key = item[dateKey] || "Без даты";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Без даты") return 1;
    if (b === "Без даты") return -1;
    return order === "desc" ? b.localeCompare(a) : a.localeCompare(b);
  });
  return sortedKeys.map((key) => ({
    key,
    label: key === "Без даты" ? "Без даты" : format(parseISO(key), "d MMMM yyyy", { locale: ru }),
    items: groups[key],
  }));
}