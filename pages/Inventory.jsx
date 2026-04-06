import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plant } from "@/entities/Plant";
import PlantForm from "../components/PlantForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ["plants-all"],
    queryFn: () => Plant.list("-createdAt", 500),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? Plant.update(editing.id, data) : Plant.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["plants-all"]); setOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => Plant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["plants-all"]),
  });

  const filtered = plants.filter((p) =>
    !search || p.common_name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <p className="p-6">Cargando inventario...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Agregar Planta</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Margen</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const margin = p.sale_price && p.purchase_cost ? ((p.sale_price - p.purchase_cost) / p.sale_price * 100).toFixed(0) : "-";
              const lowStock = p.stock_quantity <= (p.low_stock_alert || 5);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell>{p.common_name}</TableCell>
                  <TableCell><Badge variant="outline">{p.plant_type}</Badge></TableCell>
                  <TableCell>
                    <span className={lowStock ? "text-red-600 font-medium" : ""}>{p.stock_quantity}</span>
                    {lowStock && <AlertTriangle className="inline h-4 w-4 ml-1 text-red-500" />}
                  </TableCell>
                  <TableCell>${p.purchase_cost || 0}</TableCell>
                  <TableCell>${p.sale_price}</TableCell>
                  <TableCell>{margin}%</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Planta" : "Nueva Planta"}</DialogTitle></DialogHeader>
          <PlantForm plant={editing} onSubmit={(d) => saveMutation.mutate(d)} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
