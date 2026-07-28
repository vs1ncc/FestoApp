import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateQuickSelect from "@/components/DateQuickSelect";

export default function IncomeForm({ open, onClose, onSave, editItem }) {
  const [form, setForm] = useState({ client_name: "", amount: "", order_name: "", operation_name: "", debt: "0", debt_return_date: "", category: "", date: "" });
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    base44.entities.OrderTemplate.list().then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (editItem) {
      setForm({
        client_name: editItem.client_name || "",
        amount: editItem.amount?.toString() || "",
        order_name: editItem.order_name || "",
        operation_name: editItem.operation_name || "",
        debt: editItem.debt?.toString() || "0",
        debt_return_date: editItem.debt_return_date || "",
        category: editItem.category || "",
        date: editItem.date || "",
        });
    } else {
      setForm({ client_name: "", amount: "", order_name: "", operation_name: "", debt: "0", debt_return_date: "", category: "", date: "" });
    }
  }, [editItem, open]);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setForm((prev) => ({
        ...prev,
        order_name: template.name,
        amount: template.price?.toString() || prev.amount,
        category: template.category || prev.category,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      client_name: form.client_name,
      amount: parseFloat(form.amount) || 0,
      order_name: form.order_name,
      operation_name: form.operation_name,
      debt: parseFloat(form.debt) || 0,
      debt_return_date: form.debt_return_date,
      category: form.category,
      date: form.date,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Редактировать доход" : "Новый доход"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {templates.length > 0 && !editItem && (
            <div>
              <Label>Шаблон заказа</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger><SelectValue placeholder="Выберите шаблон (опционально)" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.price} ₽</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>ФИО заказчика</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
          </div>
          <div>
            <Label>Сумма</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <Label>Наименование заказа</Label>
            <Input value={form.order_name} onChange={(e) => setForm({ ...form, order_name: e.target.value })} required />
          </div>
          <div>
            <Label>Наименование операции</Label>
            <Input value={form.operation_name} onChange={(e) => setForm({ ...form, operation_name: e.target.value })} required />
          </div>
          <div>
            <Label>Категория</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Например: Услуги, Товары" />
          </div>
          <div>
            <Label>Долг по операции</Label>
            <Input type="number" step="0.01" value={form.debt} onChange={(e) => setForm({ ...form, debt: e.target.value })} />
          </div>
          <div>
            <Label>Дата возврата долга</Label>
            <DateQuickSelect value={form.debt_return_date} onChange={(v) => setForm({ ...form, debt_return_date: v })} />
          </div>
          <div>
            <Label>Дата</Label>
            <DateQuickSelect value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}