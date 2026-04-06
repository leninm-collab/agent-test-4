import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@/entities/Transaction";
import { Plant } from "@/entities/Plant";
import TransactionForm from "../components/TransactionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

export default function Transactions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState("sale");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => Transaction.list("-transaction_date", 200),
  });
  const { data: plants = [] } = useQuery({
    queryKey: ["plants-list"],
    queryFn: () => Plant.list("common_name", 500),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const tx = await Transaction.create(data);
      if (data.transaction_type === "sale" && data.plant_id) {
        const plant = plants.find((p) => p.id === data.plant_id);
        if (plant) await Plant.update(plant.id, { stock_quantity: Math.max(0, plant.stock_quantity - data.quantity) });
      } else if (data.transaction_type === "purchase" && data.plant_id) {
        const plant = plants.find((p) => p.id === data.plant_id);
        if (plant) await Plant.update(plant.id, { stock_quantity: plant.stock_quantity + data.quantity });
      }
      return tx;
    },
    onSuccess: () => { queryClient.invalidateQueries(["transactions"]); queryClient.invalidateQueries(["plants-list"]); setOpen(false); },
  });

  const sales = transactions.filter((t) => t.transaction_type === "sale" && t.status === "completed");
  const purchases = transactions.filter((t) => t.transaction_type === "purchase" && t.status === "completed");
  const totalSales = sales.reduce((s, t) => s + (t.total_amount || 0), 0);
  const totalPurchases = purchases.reduce((s, t) => s + (t.total_amount || 0), 0);

  if (isLoading) return <p className="p-6">Cargando transacciones...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nueva Transaccion</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Ventas Totales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">${totalSales.toLocaleString()}</p><p className="text-xs text-muted-foreground">{sales.length} ventas</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Compras Totales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">${totalPurchases.toLocaleString()}</p><p className="text-xs text-muted-foreground">{purchases.length} compras</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Ganancia Bruta</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${(totalSales - totalPurchases).toLocaleString()}</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Transacciones</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{transactions.length}</p></CardContent>
        </Card>
      </div>
      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">Todas</TabsTrigger><TabsTrigger value="sales">Ventas</TabsTrigger><TabsTrigger value="purchases">Compras</TabsTrigger></TabsList>
        <TabsContent value="all" className="space-y-2 pt-2">{transactions.map((t) => <TxRow key={t.id} tx={t} />)}</TabsContent>
        <TabsContent value="sales" className="space-y-2 pt-2">{sales.map((t) => <TxRow key={t.id} tx={t} />)}</TabsContent>
        <TabsContent value="purchases" className="space-y-2 pt-2">{purchases.map((t) => <TxRow key={t.id} tx={t} />)}</TabsContent>
      </Tabs>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>Nueva Transaccion</DialogTitle></DialogHeader>
          <TransactionForm plants={plants} onSubmit={(d) => saveMutation.mutate(d)} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TxRow({ tx }) {
  const isSale = tx.transaction_type === "sale";
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {isSale ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-blue-500" />}
        <div><p className="font-medium">{tx.plant_name}</p><p className="text-sm text-muted-foreground">{tx.transaction_date} - {tx.customer_name || "Proveedor"}</p></div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isSale ? "text-green-600" : "text-blue-600"}`}>{isSale ? "+" : "-"}${tx.total_amount}</p>
        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
      </div>
    </div>
  );
}
