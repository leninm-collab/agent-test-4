import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

export default function SupplierForm({ supplier, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: supplier?.name || "",
    contact_name: supplier?.contact_name || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    city: supplier?.city || "",
    state: supplier?.state || "",
    specialization: supplier?.specialization || "both",
    rating: supplier?.rating || 3,
    notes: supplier?.notes || "",
    is_active: supplier?.is_active !== false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-3">
      <div><Label>Nombre del Proveedor *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contacto</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></div>
        <div><Label>Telefono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
      <div><Label>Direccion</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Ciudad</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
        <div><Label>Estado</Label><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
      </div>
      <div>
        <Label>Especializacion</Label>
        <Select value={form.specialization} onValueChange={(v) => set("specialization", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="succulents">Suculentas</SelectItem>
            <SelectItem value="cacti">Cactus</SelectItem>
            <SelectItem value="both">Ambos</SelectItem>
            <SelectItem value="exotic">Exoticos</SelectItem>
            <SelectItem value="wholesale">Mayoreo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Calificacion</Label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => set("rating", n)}>
              <Star className={`h-6 w-6 ${n <= form.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
            </button>
          ))}
        </div>
      </div>
      <div><Label>Notas</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><Label>Activo</Label></div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSubmit(form)} disabled={!form.name}>{supplier ? "Actualizar" : "Crear"}</Button>
      </div>
    </div>
  );
}
