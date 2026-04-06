import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CartItem } from "@/entities/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Leaf } from "lucide-react";

const getSessionId = () => localStorage.getItem("cart_session") || "";

export default function Cart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: () => CartItem.filter({ session_id: sessionId }, "-createdAt", 50),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => quantity > 0 ? CartItem.update(id, { quantity }) : CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  });

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = subtotal + shipping;

  if (isLoading) return <p className="p-6 text-center">Cargando carrito...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Shop")}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Seguir comprando</Button></Link>
        <h1 className="text-2xl font-bold">Mi Carrito</h1>
      </div>
      {items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Tu carrito esta vacio</p>
            <p className="text-muted-foreground mb-4">Agrega algunas plantas para comenzar</p>
            <Link to={createPageUrl("Shop")}><Button>Ver Tienda</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? <img src={item.image_url} alt={item.plant_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Leaf className="h-8 w-8 text-green-300" /></div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.plant_name}</h3>
                    <p className="text-sm text-muted-foreground">{item.plant_sku}</p>
                    <p className="text-green-600 font-medium">${item.unit_price} c/u</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <p className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envio</span><span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : `$${shipping}`}</span></div>
              {subtotal < 500 && <p className="text-xs text-muted-foreground">Envio gratis en compras mayores a $500</p>}
              <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)} MXN</span></div>
            </CardContent>
            <CardFooter>
              <Link to={createPageUrl("Checkout")} className="w-full"><Button className="w-full" size="lg">Proceder al Pago</Button></Link>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
