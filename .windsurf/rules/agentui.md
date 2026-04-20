---
trigger: always_on
description: "AgentUI app platform rules — entity SDK, component structure, and available libraries"
---

# AgentUI App — AI Instructions

This repository is an **agentUI app** — a React-based application built on the agentUI platform.
Follow these rules when reading or modifying code.

## Architecture

- **pages/** — Full page components (max 100 lines each). These are the app's routes.
- **components/** — Reusable UI pieces (aim for <50 lines). Accept callbacks as props.
- **entities/** — JSON Schema files defining data models. The platform auto-generates CRUD APIs.
- **Layout.jsx** — Wraps all pages. Receives `children` and `currentPageName` props.

- **utils/** — Helper functions (optional).

## Current App Structure

- **Entities:** Order, Plant, CartItem, Supplier, Transaction, Category
- **Pages:** Cart, Catalog, Checkout, Inventory, Orders, PlantDetail, Shop, Transactions, Dashboard, Suppliers
- **Components:** TransactionForm, SupplierForm, FilterBar, PlantForm, StatCard, PlantCard

## Entity SDK

Entities are NOT plain JSON — they have a runtime SDK. Import and use like this:

```jsx
import { Task } from "@/entities/Task";

// List & filter
Task.list("-updatedAt", 20);                        // sorted, limited
Task.filter({ status: "pending" }, "-createdAt");   // MongoDB-style query
Task.filter({ amount: { $gte: 100 } });
Task.filter({ $or: [{ status: "a" }, { status: "b" }] });

// Supported filter operators:
// $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin,
// $contains, $like, $startsWith, $endsWith, $regex, $or, $and, $exists

// CRUD
Task.create({ title: "New" });
Task.bulkCreate([{ title: "A" }, { title: "B" }]);
Task.update(id, { status: "done" });
Task.delete(id);
Task.get(id);
Task.schema();
```

**Built-in fields (auto-generated, never define these):** `id`, `createdAt`, `updatedAt`, `createdBy`

**User entity (built-in):**
```jsx
import User from "@/entities/User.js";
User.me();      // { id, email, firstName, lastName, roles, fullName, isAuthenticated }
User.update({ firstName: "John" });
User.logout();
User.login("email", "password");
User.signup({ email, password, firstName, lastName });
User.list("-createdAt", 50);   // admin/service only
```

## Data Fetching Pattern

Always use React Query — never raw useEffect for data:

```jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/entities/Task";

export default function Tasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => Task.list("-createdAt", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => Task.create(data),
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  // ... render
}
```

## Import Paths

| Path | Resolves to |
|------|-------------|
| `@/entities/EntityName` | Entity SDK (auto-generated CRUD) |
| `@/components/ui/*` | Shadcn UI components |
| `@/utils` | Platform utilities (`createPageUrl`, config) |
| `../components/*` | Your components (relative) |
| `../context/*` | Your context providers (relative) |

**CRITICAL:** `createPageUrl` comes from `@/utils`, NOT from your own utils folder.

## Available Libraries

| Library | Import |
|---------|--------|
| React, React Query | `react`, `@tanstack/react-query` |
| Tailwind CSS | Class names in JSX |
| Shadcn UI | `@/components/ui/button`, `@/components/ui/card`, etc. |
| Lucide icons | `lucide-react` |
| Recharts | `recharts` |
| react-router-dom | `Link`, `useNavigate` |
| moment, date-fns | Date utilities |
| lodash | Utility functions |
| react-hook-form | Form handling |
| jsPDF + autoTable | PDF generation |
| PapaParse | CSV parsing |
| react-quill | Rich text editor |
| react-markdown | Markdown rendering |
| react-leaflet | Maps |
| @hello-pangea/dnd | Drag and drop |

**NOT available:** Framer Motion — use Tailwind CSS transitions instead.

## Rules

1. **Max 100 lines per page file.** Extract sub-components if longer.
2. **Max 50 lines per component.** Keep them focused and reusable.
3. **No dynamic imports.** Use static imports only.
4. **No console.log in production code.** Remove all debugging statements.
5. **Invalidate queries after mutations.** Always call `queryClient.invalidateQueries()`.
6. **Parse numbers from inputs.** HTML inputs return strings — use `parseFloat()`/`parseInt()`.
7. **All strings should support translation.** Use a `t()` function if a LanguageContext exists.
8. **Entity name collisions.** If a page name matches an entity name, alias the import:
   ```jsx
   import { Invoice as InvoiceEntity } from "@/entities/Invoice";
   ```
9. **Nested/complex data.** Use `_json` suffix fields stored as strings:
   ```jsx
   // In entity schema: "history_json": { "type": "string", "default": "[]" }
   const history = JSON.parse(item.history_json || "[]");
   ```


## Entity Schema Format

Entities use JSON Schema. Example:

```json
{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "status": { "type": "string", "enum": ["pending", "in_progress", "done"], "default": "pending" },
    "priority": { "type": "string", "enum": ["low", "medium", "high"], "default": "medium" },
    "due_date": { "type": "string", "format": "date" },
    "amount": { "type": "number" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["title"]
}
```

**Supported types:** string, number, integer, boolean, array
**String formats:** email, date, date-time, uri
**Enums:** string with `enum` array and `default`

## Seed Data Format

`seed.json` provides sample data. Match field names to entity schemas (snake_case).
Do NOT include `id`, `createdAt`, `updatedAt`, `createdBy` — they're auto-generated.

---
*Generated by AgentUI — https://agentui.ai*
