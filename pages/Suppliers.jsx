import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Supplier } from "@/entities/Supplier";
import SupplierForm from "../components/SupplierForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Star, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react";

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => Supplier.list("name", 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? Supplier.update(editing.id, data) : Supplier.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["suppliers"]); setOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => Supplier.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
  });

  if (isLoading) return <p className="p-6">Cargando proveedores...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Agregar Proveedor</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Activo" : "Inactivo"}</Badge>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${n <= (s.rating || 3) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">{s.specialization}</Badge>
              {s.contact_name && <p className="text-sm">{s.contact_name}</p>}
              {s.phone && <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</p>}
              {s.email && <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>}
              {s.city && <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}, {s.state}</p>}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="h-3 w-3 mr-1" />Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {suppliers.length === 0 && <p className="text-center py-8 text-muted-foreground">No hay proveedores registrados</p>}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle></DialogHeader>
          <SupplierForm supplier={editing} onSubmit={(d) => saveMutation.mutate(d)} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
