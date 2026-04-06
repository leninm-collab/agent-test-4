import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CartItem } from "@/entities/CartItem";
import { Order } from "@/entities/Order";
import { Plant } from "@/entities/Plant";
import { Transaction } from "@/entities/Transaction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

const getSessionId = () => localStorage.getItem("cart_session") || "";

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: () => CartItem.filter({ session_id: sessionId }, "-createdAt", 50),
  });
  const { data: plants = [] } = useQuery({ queryKey: ["plants-stock"], queryFn: () => Plant.list("sku", 500) });

  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", shipping_city: "", shipping_state: "", shipping_zip: "",
    payment_method: "transfer", notes: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = subtotal + shipping;

  const orderMutation = useMutation({
    mutationFn: async () => {
      const orderNumber = "ORD-" + Date.now().toString().slice(-8);
      const orderItems = items.map((i) => ({ plant_id: i.plant_id, plant_name: i.plant_name, sku: i.plant_sku, quantity: i.quantity, unit_price: i.unit_price, subtotal: i.quantity * i.unit_price }));
      await Order.create({ ...form, order_number: orderNumber, items: orderItems, subtotal, shipping_cost: shipping, total, status: "pending" });
      for (const item of items) {
        await Transaction.create({ transaction_type: "sale", plant_id: item.plant_id, plant_name: item.plant_name, quantity: item.quantity, unit_price: item.unit_price, total_amount: item.quantity * item.unit_price, customer_name: form.customer_name, customer_phone: form.customer_phone, transaction_date: new Date().toISOString().split("T")[0], payment_method: form.payment_method, status: "pending" });
        const plant = plants.find((p) => p.id === item.plant_id);
        if (plant) await Plant.update(plant.id, { stock_quantity: Math.max(0, plant.stock_quantity - item.quantity) });
        await CartItem.delete(item.id);
      }
      return orderNumber;
    },
    onSuccess: (num) => { setOrderNum(num); setSuccess(true); queryClient.invalidateQueries(["cart"]); },
  });

  const valid = form.customer_name && form.customer_phone && form.shipping_address && form.shipping_city;

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pedido Confirmado</h1>
        <p className="text-muted-foreground mb-4">Tu numero de orden es:</p>
        <p className="text-2xl font-mono font-bold mb-6">{orderNum}</p>
        <p className="text-sm text-muted-foreground mb-6">Te contactaremos pronto para confirmar el pago y envio.</p>
        <Button onClick={() => navigate(createPageUrl("Shop"))}>Volver a la Tienda</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Finalizar Compra</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Datos de Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Nombre Completo *</Label><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></div>
            <div><Label>Telefono *</Label><Input value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Direccion de Envio</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Direccion *</Label><Input value={form.shipping_address} onChange={(e) => set("shipping_address", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ciudad *</Label><Input value={form.shipping_city} onChange={(e) => set("shipping_city", e.target.value)} /></div>
              <div><Label>Estado</Label><Input value={form.shipping_state} onChange={(e) => set("shipping_state", e.target.value)} /></div>
            </div>
            <div><Label>Codigo Postal</Label><Input value={form.shipping_zip} onChange={(e) => set("shipping_zip", e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Metodo de Pago</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={form.payment_method} onValueChange={(v) => set("payment_method", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="transfer">Transferencia Bancaria</SelectItem><SelectItem value="cash">Efectivo (contra entrega)</SelectItem><SelectItem value="card">Tarjeta</SelectItem></SelectContent>
          </Select>
          <div><Label>Notas</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Instrucciones especiales de entrega..." /></div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Envio</span><span>{shipping === 0 ? "Gratis" : `$${shipping}`}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)} MXN</span></div>
          <Button className="w-full mt-4" size="lg" disabled={!valid || items.length === 0} onClick={() => orderMutation.mutate()}>
            {orderMutation.isPending ? "Procesando..." : "Confirmar Pedido"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
