import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransactionForm({ plants, onSubmit, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    transaction_type: "sale",
    plant_id: "",
    plant_name: "",
    quantity: 1,
    unit_price: "",
    customer_name: "",
    customer_phone: "",
    transaction_date: today,
    payment_method: "cash",
    notes: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (form.plant_id) {
      const plant = plants.find((p) => p.id === form.plant_id);
      if (plant) {
        set("plant_name", plant.common_name);
        set("unit_price", form.transaction_type === "sale" ? plant.sale_price : plant.purchase_cost || 0);
      }
    }
  }, [form.plant_id, form.transaction_type, plants]);

  const total = Number(form.quantity) * Number(form.unit_price);

  const handleSubmit = () => {
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      unit_price: Number(form.unit_price),
      total_amount: total,
      status: "completed",
    });
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo de Transaccion</Label>
          <Select value={form.transaction_type} onValueChange={(v) => set("transaction_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="sale">Venta</SelectItem><SelectItem value="purchase">Compra</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={form.transaction_date} onChange={(e) => set("transaction_date", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Planta</Label>
        <Select value={form.plant_id} onValueChange={(v) => set("plant_id", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar planta..." /></SelectTrigger>
          <SelectContent>
            {plants.map((p) => <SelectItem key={p.id} value={p.id}>{p.common_name} ({p.sku})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Cantidad</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></div>
        <div><Label>Precio Unitario</Label><Input type="number" min={0} step={0.01} value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} /></div>
        <div><Label>Total</Label><Input value={`$${total.toFixed(2)}`} disabled /></div>
      </div>
      {form.transaction_type === "sale" && (
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre Cliente</Label><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></div>
          <div><Label>Telefono</Label><Input value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} /></div>
        </div>
      )}
      <div>
        <Label>Metodo de Pago</Label>
        <Select value={form.payment_method} onValueChange={(v) => set("payment_method", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="cash">Efectivo</SelectItem><SelectItem value="card">Tarjeta</SelectItem><SelectItem value="transfer">Transferencia</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>Notas</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!form.plant_name || !form.unit_price}>Registrar</Button>
      </div>
    </div>
  );
}
