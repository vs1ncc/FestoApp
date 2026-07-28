import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DateQuickSelect from "@/components/DateQuickSelect";

export default function ExpenseForm({ open, onClose, onSave, editItem }) {
  const [form, setForm] = useState({ operation_type: "", operation_name: "", amount: "", category: "", date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        operation_type: editItem.operation_type || "",
        operation_name: editItem.operation_name || "",
        amount: editItem.amount?.toString() || "",
        category: editItem.category || "",
        date: editItem.date || "",
      });
    } else {
      setForm({ operation_type: "", operation_name: "", amount: "", category: "", date: "" });
    }
  }, [editItem, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      operation_type: form.operation_type,
      operation_name: form.operation_name,
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      date: form.date,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Редактировать расход" : "Новый расход"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Тип операции</Label>
            <Input value={form.operation_type} onChange={(e) => setForm({ ...form, operation_type: e.target.value })} required />
          </div>
          <div>
            <Label>Наименование операции</Label>
            <Input value={form.operation_name} onChange={(e) => setForm({ ...form, operation_name: e.target.value })} required />
          </div>
          <div>
            <Label>Сумма</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <Label>Категория</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Например: Аренда, Реклама" />
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