import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DateQuickSelect from "@/components/DateQuickSelect";
import FileUpload from "@/components/FileUpload";
import { Upload, X } from "lucide-react";

const STATUS_OPTIONS = [
  "запланирована доставка",
  "отправлено в производство",
  "готово",
  "отправлено в доставку",
  "доставлено",
];

const EMPTY = {
  order_number: "", order_name: "", characteristics: "", price: "", size: "",
  date: "", client_name: "", client_phone: "", delivery_date: "", client_address: "",
  photo_url: "", status: "запланирована доставка", production_id: "",
  contract_url: "", order_file_url: "",
};

export default function OrderForm({ open, onClose, onSave, editItem, defaultProductionId }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    base44.entities.Production.list().then(setProductions).catch(() => {});
  }, []);

  useEffect(() => {
    if (editItem) {
      setForm({
        order_number: editItem.order_number || "",
        order_name: editItem.order_name || "",
        characteristics: editItem.characteristics || "",
        price: editItem.price?.toString() || "",
        size: editItem.size || "",
        date: editItem.date || "",
        client_name: editItem.client_name || "",
        client_phone: editItem.client_phone || "",
        delivery_date: editItem.delivery_date || "",
        client_address: editItem.client_address || "",
        photo_url: editItem.photo_url || "",
        status: editItem.status || "запланирована доставка",
        production_id: editItem.production_id || "",
        contract_url: editItem.contract_url || "",
        order_file_url: editItem.order_file_url || "",
      });
    } else {
      setForm({ ...EMPTY, production_id: defaultProductionId || "" });
    }
  }, [editItem, open]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, photo_url: file_url }));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      order_number: form.order_number,
      order_name: form.order_name,
      characteristics: form.characteristics,
      price: parseFloat(form.price) || 0,
      size: form.size,
      date: form.date,
      client_name: form.client_name,
      client_phone: form.client_phone,
      delivery_date: form.delivery_date,
      client_address: form.client_address,
      photo_url: form.photo_url,
      status: form.status,
      production_id: form.production_id,
      contract_url: form.contract_url,
      order_file_url: form.order_file_url,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Редактировать заказ" : "Новый заказ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Производство</Label>
            <select
              value={form.production_id}
              onChange={(e) => setForm({ ...form, production_id: e.target.value })}
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— выберите —</option>
              {productions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Номер заказа</Label>
            <Input value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} required placeholder="Введите номер заказа" />
          </div>
          <div>
            <Label>Наименование заказа</Label>
            <Input value={form.order_name} onChange={(e) => setForm({ ...form, order_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Цена</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <Label>Размер</Label>
              <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="S, M, L, XL" />
            </div>
          </div>
          <div>
            <Label>Статус заказа</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>ФИО клиента</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <Label>Номер телефона клиента</Label>
            <Input type="tel" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} placeholder="+7..." />
          </div>
          <div>
            <Label>Адрес клиента</Label>
            <Input value={form.client_address} onChange={(e) => setForm({ ...form, client_address: e.target.value })} />
          </div>
          <div>
            <Label>Дата доставки</Label>
            <DateQuickSelect value={form.delivery_date} onChange={(v) => setForm({ ...form, delivery_date: v })} />
          </div>
          <div>
            <Label>Характеристики ({form.characteristics.length}/1500)</Label>
            <Textarea value={form.characteristics} onChange={(e) => setForm({ ...form, characteristics: e.target.value.slice(0, 1500) })} rows={4} maxLength={1500} />
          </div>
          <div>
            <Label>Фотография</Label>
            {form.photo_url ? (
              <div className="relative">
                <img src={form.photo_url} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                <button type="button" onClick={() => setForm({ ...form, photo_url: "" })} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-400">Загрузить фото</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <div>
            <Label>Договор</Label>
            <FileUpload
              value={form.contract_url}
              onChange={(v) => setForm({ ...form, contract_url: v })}
              accept=".pdf"
              placeholder="Загрузить договор (PDF)"
            />
          </div>
          <div>
            <Label>Заказ</Label>
            <FileUpload
              value={form.order_file_url}
              onChange={(v) => setForm({ ...form, order_file_url: v })}
              accept=".doc,.docx"
              placeholder="Загрузить заказ (Word)"
            />
          </div>
          <div>
            <Label>Дата заказа</Label>
            <DateQuickSelect value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={saving || uploading}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}