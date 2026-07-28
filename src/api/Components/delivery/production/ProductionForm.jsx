import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY = { name: "", phone: "", foreman_name: "" };

export default function ProductionForm({ open, onClose, onSave, editItem }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name || "",
        phone: editItem.phone || "",
        foreman_name: editItem.foreman_name || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editItem, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form });
    setSaving(false);
    setForm(EMPTY);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Редактировать производство" : "Новое производство"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название производства</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Напр. Производство №2" />
          </div>
          <div>
            <Label>Номер телефона</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7..." />
          </div>
          <div>
            <Label>Имя бригадира</Label>
            <Input value={form.foreman_name} onChange={(e) => setForm({ ...form, foreman_name: e.target.value })} placeholder="ФИО бригадира" />
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