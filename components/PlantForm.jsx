import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function PlantForm({ plant, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    sku: plant?.sku || "",
    common_name: plant?.common_name || "",
    scientific_name: plant?.scientific_name || "",
    plant_type: plant?.plant_type || "succulent",
    family: plant?.family || "",
    genus: plant?.genus || "",
    size: plant?.size || "small",
    pot_size_cm: plant?.pot_size_cm || "",
    care_level: plant?.care_level || "easy",
    light_needs: plant?.light_needs || "high",
    water_frequency: plant?.water_frequency || "biweekly",
    purchase_cost: plant?.purchase_cost || "",
    sale_price: plant?.sale_price || "",
    currency: plant?.currency || "MXN",
    stock_quantity: plant?.stock_quantity || 0,
    low_stock_alert: plant?.low_stock_alert || 5,
    image_url: plant?.image_url || "",
    notes: plant?.notes || "",
    is_available: plant?.is_available !== false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    onSubmit({
      ...form,
      pot_size_cm: form.pot_size_cm ? Number(form.pot_size_cm) : null,
      purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : null,
      sale_price: Number(form.sale_price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_alert: Number(form.low_stock_alert),
    });
  };

  return (
    <div className="grid gap-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>SKU *</Label><Input value={form.sku} onChange={(e) => set("sku", e.target.value)} /></div>
        <div><Label>Nombre Comun *</Label><Input value={form.common_name} onChange={(e) => set("common_name", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nombre Cientifico</Label><Input value={form.scientific_name} onChange={(e) => set("scientific_name", e.target.value)} /></div>
        <div><Label>Tipo *</Label>
          <Select value={form.plant_type} onValueChange={(v) => set("plant_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="succulent">Suculenta</SelectItem><SelectItem value="cactus">Cactus</SelectItem><SelectItem value="hybrid">Hibrido</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Familia</Label><Input value={form.family} onChange={(e) => set("family", e.target.value)} placeholder="Ej: Crassulaceae" /></div>
        <div><Label>Genero</Label><Input value={form.genus} onChange={(e) => set("genus", e.target.value)} placeholder="Ej: Echeveria" /></div>
        <div><Label>Maceta (cm)</Label><Input type="number" min={0} value={form.pot_size_cm} onChange={(e) => set("pot_size_cm", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Tamano</Label><Select value={form.size} onValueChange={(v) => set("size", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mini">Mini</SelectItem><SelectItem value="small">Chica</SelectItem><SelectItem value="medium">Mediana</SelectItem><SelectItem value="large">Grande</SelectItem><SelectItem value="extra_large">Extra Grande</SelectItem></SelectContent></Select></div>
        <div><Label>Cuidado</Label><Select value={form.care_level} onValueChange={(v) => set("care_level", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Facil</SelectItem><SelectItem value="moderate">Moderado</SelectItem><SelectItem value="difficult">Dificil</SelectItem></SelectContent></Select></div>
        <div><Label>Luz</Label><Select value={form.light_needs} onValueChange={(v) => set("light_needs", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baja</SelectItem><SelectItem value="medium">Media</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="full_sun">Sol Directo</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>Costo Compra</Label><Input type="number" min={0} step={0.01} value={form.purchase_cost} onChange={(e) => set("purchase_cost", e.target.value)} /></div>
        <div><Label>Precio Venta *</Label><Input type="number" min={0} step={0.01} value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} /></div>
        <div><Label>Stock</Label><Input type="number" min={0} value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} /></div>
        <div><Label>Alerta Stock</Label><Input type="number" min={0} value={form.low_stock_alert} onChange={(e) => set("low_stock_alert", e.target.value)} /></div>
      </div>
      <div><Label>URL Imagen</Label><Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} /></div>
      <div><Label>Notas</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex items-center gap-2"><Switch checked={form.is_available} onCheckedChange={(v) => set("is_available", v)} /><Label>Disponible para venta</Label></div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!form.sku || !form.common_name || !form.sale_price}>{plant ? "Actualizar" : "Crear"}</Button>
      </div>
    </div>
  );
}
