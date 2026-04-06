import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Droplets, Ruler, Leaf, DollarSign } from "lucide-react";

const typeLabels = { succulent: "Suculenta", cactus: "Cactus", hybrid: "Hibrido" };
const sizeLabels = { mini: "Mini", small: "Chica", medium: "Mediana", large: "Grande", extra_large: "Extra Grande" };
const careLabels = { easy: "Facil", moderate: "Moderado", difficult: "Dificil" };
const lightLabels = { low: "Baja", medium: "Media", high: "Alta", full_sun: "Sol Directo" };
const waterLabels = { weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual", rarely: "Rara vez" };

export default function PlantDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get("id");

  const { data: plant, isLoading } = useQuery({
    queryKey: ["plant", plantId],
    queryFn: () => Plant.get(plantId),
    enabled: !!plantId,
  });

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (!plant) return <p className="p-6">Planta no encontrada</p>;

  const margin = plant.sale_price && plant.purchase_cost
    ? ((plant.sale_price - plant.purchase_cost) / plant.sale_price * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {plant.image_url ? (
            <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Leaf className="h-24 w-24 text-green-300" /></div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground font-mono">{plant.sku}</p>
            <h1 className="text-3xl font-bold">{plant.common_name}</h1>
            {plant.scientific_name && <p className="text-lg italic text-muted-foreground">{plant.scientific_name}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={plant.plant_type === "cactus" ? "secondary" : "default"}>{typeLabels[plant.plant_type]}</Badge>
            <Badge variant="outline">{sizeLabels[plant.size]}</Badge>
            <Badge variant="outline">{careLabels[plant.care_level]}</Badge>
            {!plant.is_available && <Badge variant="destructive">No Disponible</Badge>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-600">${plant.sale_price}</span>
            <span className="text-lg text-muted-foreground">{plant.currency}</span>
          </div>
          <p className="text-muted-foreground">{plant.stock_quantity} unidades disponibles</p>
          {plant.notes && <p className="text-sm">{plant.notes}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sun className="h-4 w-4" />Luz</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{lightLabels[plant.light_needs]}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Droplets className="h-4 w-4" />Riego</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{waterLabels[plant.water_frequency]}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ruler className="h-4 w-4" />Maceta</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{plant.pot_size_cm ? `${plant.pot_size_cm} cm` : "-"}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Margen</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{margin ? `${margin}%` : "-"}</p></CardContent></Card>
      </div>
      {(plant.family || plant.genus) && (
        <Card><CardHeader><CardTitle>Clasificacion Botanica</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {plant.family && <div><p className="text-sm text-muted-foreground">Familia</p><p className="font-medium">{plant.family}</p></div>}
            {plant.genus && <div><p className="text-sm text-muted-foreground">Genero</p><p className="font-medium">{plant.genus}</p></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
