import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plant } from "@/entities/Plant";
import { CartItem } from "@/entities/CartItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingCart, Leaf, Plus, Check } from "lucide-react";

const getSessionId = () => {
  let id = localStorage.getItem("cart_session");
  if (!id) { id = "sess_" + Date.now(); localStorage.setItem("cart_session", id); }
  return id;
};

export default function Shop() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const sessionId = getSessionId();

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ["shop-plants"],
    queryFn: () => Plant.filter({ is_available: true, stock_quantity: { $gt: 0 } }, "-createdAt", 200),
  });
  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: () => CartItem.filter({ session_id: sessionId }, "-createdAt", 50),
  });

  const addMutation = useMutation({
    mutationFn: async (plant) => {
      const existing = cartItems.find((c) => c.plant_id === plant.id);
      if (existing) {
        return CartItem.update(existing.id, { quantity: existing.quantity + 1 });
      }
      return CartItem.create({ session_id: sessionId, plant_id: plant.id, plant_name: plant.common_name, plant_sku: plant.sku, unit_price: plant.sale_price, quantity: 1, image_url: plant.image_url });
    },
    onSuccess: (_, plant) => {
      queryClient.invalidateQueries(["cart"]);
      setAddedIds((p) => ({ ...p, [plant.id]: true }));
      setTimeout(() => setAddedIds((p) => ({ ...p, [plant.id]: false })), 1500);
    },
  });

  const filtered = plants.filter((p) => {
    const matchSearch = !search || p.common_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.plant_type === typeFilter;
    return matchSearch && matchType;
  });

  const cartCount = cartItems.reduce((s, c) => s + c.quantity, 0);

  if (isLoading) return <p className="p-6 text-center">Cargando tienda...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tienda</h1>
        <Link to={createPageUrl("Cart")}>
          <Button variant="outline" className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />Carrito
            {cartCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">{cartCount}</Badge>}
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar plantas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["", "succulent", "cactus"].map((t) => (
            <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)}>
              {t === "" ? "Todas" : t === "succulent" ? "Suculentas" : "Cactus"}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((plant) => (
          <Card key={plant.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {plant.image_url ? <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Leaf className="h-12 w-12 text-green-300" /></div>}
              <Badge className="absolute top-2 right-2">{plant.plant_type === "cactus" ? "Cactus" : "Suculenta"}</Badge>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold">{plant.common_name}</h3>
              {plant.scientific_name && <p className="text-xs italic text-muted-foreground">{plant.scientific_name}</p>}
              <p className="text-xs text-muted-foreground mt-1">{plant.stock_quantity} disponibles</p>
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">${plant.sale_price}</span>
              <Button size="sm" onClick={() => addMutation.mutate(plant)} disabled={addedIds[plant.id]}>
                {addedIds[plant.id] ? <><Check className="h-4 w-4 mr-1" />Agregado</> : <><Plus className="h-4 w-4 mr-1" />Agregar</>}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No se encontraron plantas</p>}
    </div>
  );
}
