import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plant } from "@/entities/Plant";
import PlantCard from "../components/PlantCard";
import FilterBar from "../components/FilterBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ plant_type: "", size: "", care_level: "" });
  const [page, setPage] = useState(1);

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ["plants"],
    queryFn: () => Plant.filter({ is_available: true }, "-createdAt", 500),
  });

  const filtered = plants.filter((p) => {
    const matchSearch = !search ||
      p.common_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filters.plant_type || p.plant_type === filters.plant_type;
    const matchSize = !filters.size || p.size === filters.size;
    const matchCare = !filters.care_level || p.care_level === filters.care_level;
    return matchSearch && matchType && matchSize && matchCare;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages || 1);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) return <p className="p-6">Cargando catalogo...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Catalogo de Plantas</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o codigo..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} plantas encontradas</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((plant) => <PlantCard key={plant.id} plant={plant} />)}
      </div>
      {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No se encontraron plantas</p>}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Pagina {currentPage} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
