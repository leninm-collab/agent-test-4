import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FilterBar({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value === "all" ? "" : value });
  const clear = () => onChange({ plant_type: "", size: "", care_level: "" });
  const hasFilters = filters.plant_type || filters.size || filters.care_level;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.plant_type || "all"} onValueChange={(v) => set("plant_type", v)}>
        <SelectTrigger className="w-32"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="succulent">Suculenta</SelectItem>
          <SelectItem value="cactus">Cactus</SelectItem>
          <SelectItem value="hybrid">Hibrido</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.size || "all"} onValueChange={(v) => set("size", v)}>
        <SelectTrigger className="w-32"><SelectValue placeholder="Tamano" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="mini">Mini</SelectItem>
          <SelectItem value="small">Chica</SelectItem>
          <SelectItem value="medium">Mediana</SelectItem>
          <SelectItem value="large">Grande</SelectItem>
          <SelectItem value="extra_large">Extra Grande</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.care_level || "all"} onValueChange={(v) => set("care_level", v)}>
        <SelectTrigger className="w-32"><SelectValue placeholder="Cuidado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="easy">Facil</SelectItem>
          <SelectItem value="moderate">Moderado</SelectItem>
          <SelectItem value="difficult">Dificil</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear}>
          <X className="h-4 w-4 mr-1" />Limpiar
        </Button>
      )}
    </div>
  );
}
