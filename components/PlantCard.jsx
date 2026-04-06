import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Droplets, Leaf } from "lucide-react";

const typeLabels = { succulent: "Suculenta", cactus: "Cactus", hybrid: "Hibrido" };
const sizeLabels = { mini: "Mini", small: "Chica", medium: "Mediana", large: "Grande", extra_large: "Extra Grande" };
const careLabels = { easy: "Facil", moderate: "Moderado", difficult: "Dificil" };

export default function PlantCard({ plant }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {plant.image_url ? (
          <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Leaf className="h-16 w-16 text-green-300" /></div>
        )}
        <Badge className="absolute top-2 right-2" variant={plant.plant_type === "cactus" ? "secondary" : "default"}>
          {typeLabels[plant.plant_type]}
        </Badge>
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-mono">{plant.sku}</p>
        <h3 className="font-semibold text-lg">{plant.common_name}</h3>
        {plant.scientific_name && <p className="text-sm italic text-muted-foreground">{plant.scientific_name}</p>}
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{sizeLabels[plant.size]}</Badge>
          <Badge variant="outline">{careLabels[plant.care_level]}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Sun className="h-3 w-3" />{plant.light_needs}</span>
          <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{plant.water_frequency}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-green-600">${plant.sale_price} <span className="text-sm font-normal">{plant.currency}</span></p>
          <p className="text-xs text-muted-foreground">{plant.stock_quantity} disponibles</p>
        </div>
        <Link to={createPageUrl("PlantDetail") + "?id=" + plant.id}>
          <Button size="sm">Ver mas</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
