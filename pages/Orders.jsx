import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/entities/Order";
import { Transaction } from "@/entities/Transaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Eye, Truck, CheckCircle, XCircle } from "lucide-react";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Package },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => Order.list("-createdAt", 200),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await Order.update(id, { status });
      if (status === "confirmed" || status === "delivered") {
        const order = orders.find((o) => o.id === id);
        if (order?.items) {
          for (const item of order.items) {
            const txs = await Transaction.filter({ plant_id: item.plant_id, customer_name: order.customer_name, status: "pending" }, "-createdAt", 1);
            if (txs.length > 0) await Transaction.update(txs[0].id, { status: "completed" });
          }
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["orders"]),
  });

  if (isLoading) return <p className="p-6">Cargando ordenes...</p>;

  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ordenes</h1>
      <div className="grid sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-yellow-600">Pendientes</p><p className="text-2xl font-bold">{pending}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-blue-600">Confirmadas</p><p className="text-2xl font-bold">{confirmed}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-purple-600">Enviadas</p><p className="text-2xl font-bold">{shipped}</p></CardContent></Card>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const cfg = statusConfig[o.status] || statusConfig.pending;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell><p className="font-medium">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_phone}</p></TableCell>
                  <TableCell>{o.items?.length || 0} items</TableCell>
                  <TableCell className="font-semibold">${o.total}</TableCell>
                  <TableCell><Badge className={cfg.color}>{cfg.label}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setSelected(o)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Orden {selected?.order_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Cliente</p><p className="font-medium">{selected.customer_name}</p></div>
                <div><p className="text-muted-foreground">Telefono</p><p>{selected.customer_phone}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Direccion</p><p>{selected.shipping_address}, {selected.shipping_city} {selected.shipping_state}</p></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Productos</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{item.plant_name} x{item.quantity}</span><span>${item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>${selected.total}</span></div>
              <div>
                <p className="text-sm font-medium mb-2">Cambiar Estado</p>
                <Select value={selected.status} onValueChange={(v) => updateMutation.mutate({ id: selected.id, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
