import { useQuery } from "@tanstack/react-query";
import { Plant } from "@/entities/Plant";
import { Transaction } from "@/entities/Transaction";
import StatCard from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, DollarSign, ShoppingCart, AlertTriangle, TrendingUp, Package } from "lucide-react";

export default function Dashboard() {
  const { data: plants = [] } = useQuery({ queryKey: ["plants"], queryFn: () => Plant.list("-createdAt", 500) });
  const { data: transactions = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => Transaction.list("-transaction_date", 100) });

  const totalPlants = plants.length;
  const totalStock = plants.reduce((s, p) => s + (p.stock_quantity || 0), 0);
  const lowStockPlants = plants.filter((p) => p.stock_quantity <= (p.low_stock_alert || 5));
  const inventoryValue = plants.reduce((s, p) => s + (p.purchase_cost || 0) * (p.stock_quantity || 0), 0);

  const sales = transactions.filter((t) => t.transaction_type === "sale" && t.status === "completed");
  const totalSales = sales.reduce((s, t) => s + (t.total_amount || 0), 0);
  const recentTx = transactions.slice(0, 5);

  const succulents = plants.filter((p) => p.plant_type === "succulent").length;
  const cacti = plants.filter((p) => p.plant_type === "cactus").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Control</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tipos de Plantas" value={totalPlants} icon={<Leaf className="h-5 w-5" />} subtitle={`${succulents} suculentas, ${cacti} cactus`} />
        <StatCard title="Stock Total" value={totalStock} icon={<Package className="h-5 w-5" />} subtitle="unidades en inventario" />
        <StatCard title="Ventas Totales" value={`$${totalSales.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} subtitle={`${sales.length} ventas`} color="green" />
        <StatCard title="Valor Inventario" value={`$${inventoryValue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} subtitle="costo de adquisicion" color="blue" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Stock Bajo ({lowStockPlants.length})</CardTitle></CardHeader>
          <CardContent>
            {lowStockPlants.length === 0 ? <p className="text-muted-foreground">Todo el inventario tiene stock suficiente</p> : (
              <div className="space-y-2">
                {lowStockPlants.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                    <span>{p.common_name}</span>
                    <Badge variant="destructive">{p.stock_quantity} unidades</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Transacciones Recientes</CardTitle></CardHeader>
          <CardContent>
            {recentTx.length === 0 ? <p className="text-muted-foreground">No hay transacciones registradas</p> : (
              <div className="space-y-2">
                {recentTx.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-2 border rounded">
                    <div><p className="font-medium text-sm">{t.plant_name}</p><p className="text-xs text-muted-foreground">{t.transaction_date}</p></div>
                    <Badge variant={t.transaction_type === "sale" ? "default" : "secondary"}>{t.transaction_type === "sale" ? `+$${t.total_amount}` : `-$${t.total_amount}`}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
