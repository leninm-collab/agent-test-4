import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf, Package, ShoppingCart, Users, LayoutDashboard, Store, ClipboardList } from "lucide-react";

const clientNav = [
  { name: "Tienda", page: "Shop", icon: Store },
  { name: "Carrito", page: "Cart", icon: ShoppingCart },
];

const adminNav = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Catalogo", page: "Catalog", icon: Leaf },
  { name: "Inventario", page: "Inventory", icon: Package },
  { name: "Ordenes", page: "Orders", icon: ClipboardList },
  { name: "Transacciones", page: "Transactions", icon: ShoppingCart },
  { name: "Proveedores", page: "Suppliers lenin", icon: Users },
];

export default function Layout({ children, currentPageName }) {
  const isClientPage = ["Shop", "Cart", "Checkout", "PlantDetail"].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Shop")} className="flex items-center gap-2">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-green-800">Suculentas & Cactus</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              {clientNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-100"}`}>
                    <Icon className="h-4 w-4" />{item.name}
                  </Link>
                );
              })}
              <div className="w-px bg-gray-200 mx-2" />
              {adminNav.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-100"}`}>
                    <Icon className="h-4 w-4" />{item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <nav className="md:hidden bg-white border-b overflow-x-auto">
        <div className="flex px-4 py-2 gap-2">
          {[...clientNav, ...adminNav].map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link key={item.page} to={createPageUrl(item.page)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${isActive ? "bg-green-100 text-green-800" : "text-gray-600 bg-gray-100"}`}>
                <Icon className="h-3 w-3" />{item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Suculentas & Cactus Marketplace</p>
          <p className="mt-1">Compra y venta de plantas suculentas y cactaceas</p>
        </div>
      </footer>
    </div>
  );
}
