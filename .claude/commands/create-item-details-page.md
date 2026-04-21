# Create Item Details Page

Generate a full-featured details page for a Prisma model following the medical-tracker architecture.

## Usage
```
/create-item-details-page <ModelName>
```

**Examples:**
```
/create-item-details-page Therapy
/create-item-details-page Appointment
```

---

## Your task

The user has invoked this command with the following arguments:

> $ARGUMENTS

Parse the arguments to extract:
- **modelName**: PascalCase Prisma model name (first word/token)

Then execute the steps below.

---

## Step 1 — Read the Prisma schema

Read `/Users/ipostrygan/education/medical-tracker/prisma/schema.prisma` and locate the model matching `modelName`. Extract:
- All fields with their types (String, Float, DateTime, Boolean, enum type, relation, etc.)
- Which fields are optional (`?`)
- Which fields are enums (find the enum definition to get all values)
- Which fields are scalar FK fields (fields ending in `Id`, e.g. `userId`, `therapyId`)
- Which fields are relations — FK side (e.g. `therapy Therapy?`) → the parent/owner being referenced
- Which fields are relations — has-many side (e.g. `appointments Appointment[]`) → child collections

For each **scalar FK field** (e.g. `therapyId String?`), find its corresponding relation field (e.g. `therapy Therapy?`), identify the related model, and determine:
- The related model's "display name" field (prefer `title`, then `name`, then `firstName`/`lastName`, then `id`)
- The URL path to the related model's detail page (e.g. `therapyId` → `/therapies/${item.therapyId}`)

For each **has-many relation** (e.g. `appointments Appointment[]`), note:
- The child model name
- The FK field in the child model that points back to this model (e.g. `Appointment.therapyId`)

---

## Step 2 — Check for existing infrastructure

For `modelName`, check:
1. Does `app/api/{model-names}/[id]/route.ts` already have a `GET` handler?
2. Does `lib/api/{model-names}.ts` already have a `get{ModelName}(id)` function?
3. Does `app/(app)/{model-names}/hooks/use-{model-name}.ts` already exist?
4. Does `app/actions/{model-names}.ts` already have a `get{ModelName}ById` function?

For each has-many child model, check:
1. Does `app/(app)/{child-model-names}/hooks/use-{child-model-names}.ts` exist and accept a filter param for the parent FK (e.g. `therapyId`)?
2. Does `app/actions/{child-model-names}.ts` accept a `{parentModel}Id` filter?
3. Does `app/api/{child-model-names}/route.ts` accept a `{parentModel}Id` query param?

Note which pieces already exist vs need to be created.

> **Note on naming convention:** model `MedicalExpense` → folder `medical-expenses`, model `Therapy` → folder `therapies`. Use plural kebab-case for the folder name.

---

## Step 3 — Determine detail fields

Build the list of fields to show in the details card. Rules:

**Exclude from details:**
- `id`
- `userId` and the `user` relation (current user is implicit context)
- Any field ending in `Id` that is a FK — but DO show the related item's name (see FK display rule below)
- Array/has-many relation fields (rendered as tables instead)
- `imageKey` or similar storage key fields
- Fields that exist solely as link targets for another field (e.g. `therapistInfoLink` when `therapistName` is also present — the link wraps the name, it is not shown as its own row)

**Include in details:**
- All remaining scalar fields
- Related item names for FK fields (see FK display rule below)

**Field formatting:**
- `DateTime` fields → `new Date(item.fieldName).toLocaleDateString()`
- Optional fields → `value ?? "—"` (render `"—"` when null/undefined)
- Boolean fields → render as a badge/pill, e.g. active/inactive or yes/no, styled with green for true and neutral for false
- Enum fields → map through a `LABELS` constant imported from the model's `constants.ts`
- Numeric fields named `amount`, `price`, `cost`, `fee` → format as EUR currency: `new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value)`
- String/text fields → display as-is (optional → `?? "—"`)

**FK display rule:**
For each scalar FK field (e.g. `therapyId`), show a detail row labeled after the relation (e.g. "Therapy") displaying the related item's display name field. Wrap it in a Next.js `<Link>` pointing to the related item's detail page:
```tsx
import Link from "next/link"
// ...
<Link href={`/{related-model-names}/${item.{fkField}}`} className="underline hover:no-underline">
  {relatedItem?.title ?? item.{fkField}}
</Link>
```
If the related item data is not available directly on the fetched object, show the FK value as a fallback (e.g. render the ID). If the FK is optional and null, render `"—"`.

**Link wrapping rule:**
For each displayed field, check if a corresponding link field exists in the model. The naming patterns:
- field `therapistName` → look for `therapistInfoLink`, `therapistLink`, `therapistUrl`
- field `X` → look for `XLink`, `XUrl`, `XInfoLink`

If such a link field exists, wrap the cell value in:
```tsx
value && linkUrl ? (
  <a
    href={linkUrl}
    target={linkUrl.startsWith("http") ? "_blank" : undefined}
    rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
    className="underline hover:no-underline"
  >
    {value}
  </a>
) : (value ?? "—")
```

---

## Step 4 — Determine has-many relation tables

For each has-many relation on the model (e.g. `appointments Appointment[]`), build a table section showing child records filtered by the parent ID. Rules:

- Reuse the existing `use{ChildModelNames}` hook (from the child model's hooks folder), passing `{ {parentModelCamelCase}Id: id }` as a filter param
- Reuse the existing `useDelete{ChildModelName}` hook for row deletion
- Apply the same column rules as the `create-datatable-page` skill:
  - Exclude `id`, `description`, FK Id fields, relation fields, array fields, storage key fields
  - Format DateTime, Boolean, enum, numeric, optional fields as described in Step 3
  - Include sortable `SortButton` headers for string/number/date columns
  - Include a `RowActions` column at the end with a delete handler (and edit if a form component exists for that model)
- Include pagination state using `useQueryStates` (separate state per table if there are multiple child tables)
- Default sort: prefer `date`, `startDate`, `createdAt`, fallback to `id`

---

## Step 5 — Check for related model constants

For each has-many child model that has enum fields shown in the table, check if `app/(app)/{child-model-names}/constants.ts` exists and import `LABELS` constants from it.

---

## Step 6 — Generate missing infrastructure files

Only generate files that do NOT already exist (from Step 2). Generate ALL of the following as needed:

### File A: Server action `get{ModelName}ById`
**Path:** `app/actions/{model-names}.ts` (add to existing file or create)

```typescript
export const get{ModelName}ById = async (id: string): Promise<{ModelName} | null> => {
  return prisma.{modelName}.findUnique({ where: { id } });
};
```

### File B: API `GET /{model-names}/[id]` handler
**Path:** `app/api/{model-names}/[id]/route.ts` (add GET handler to existing file or create)

```typescript
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await get{ModelName}ById(id);
  if (!item) return new NextResponse(null, { status: 404 });
  return NextResponse.json(item);
}
```

### File C: API client `get{ModelName}` function
**Path:** `lib/api/{model-names}.ts` (add to existing file or create)

```typescript
export async function get{ModelName}(id: string): Promise<{ModelName}> {
  const res = await fetch(`/api/{model-names}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch {modelName}");
  return res.json();
}
```

### File D: Single-item query hook
**Path:** `app/(app)/{model-names}/hooks/use-{model-name}.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { {ModelName} } from "@/lib/generated/prisma/client";
import { get{ModelName} } from "@/lib/api/{model-names}";

export const use{ModelName} = (id: string) => {
  return useQuery<{ModelName}>({
    queryKey: ["{model-names}", id],
    queryFn: () => get{ModelName}(id),
    enabled: !!id,
  });
};
```

### File E (if child model hooks/actions need `{parentModelId}` filter support): Update child model infrastructure
If the child model's `use{ChildModelNames}` hook or action does not yet accept `{parentModelId}` as a filter, add it:
- Add `{parentModelId}?: string` to the query params type
- Pass it through the API client and server action
- Include `...(parentModelId ? { {parentModelCamelCase}Id: parentModelId } : {})` in the `where` clause
- Add `{parentModelId}: parseAsString` to the API route's `searchParamsCache`

---

## Step 7 — Generate the details view

**Decision:** After completing Step 4, determine which output to generate:

- **If the model has one or more has-many relations** → generate a full details **page** (Step 7A)
- **If the model has NO has-many relations** → generate a **Sheet component** that slides in from the right (Step 7B)

---

### Step 7A — Full details page (has-many relations exist)

**Path:** `app/(app)/{model-names}/[id]/page.tsx`

Follow the therapy details page pattern exactly:

```typescript
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { use{ModelName} } from "../hooks/use-{model-name}"
import { Separator } from "@/components/ui/separator"
import { TableTemplate } from "@/components/table-template"
// Import child model hooks (one per has-many relation):
// import { use{ChildModelNames} } from "../../{child-model-names}/hooks/use-{child-model-names}"
// import { useDelete{ChildModelName} } from "../../{child-model-names}/hooks/use-delete-{child-model-name}"
import { ColumnDef } from "@tanstack/react-table"
// Import child model types:
// import type { {ChildModelName} } from "@/lib/generated/prisma/client"
import { DetailRow } from "@/components/ui/detail-row"
// Import constants for enum columns:
// import { ENUM_LABELS } from "../../{child-model-names}/constants"
import { RowActions } from "@/components/row-actions"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

const {ModelName}DetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: {modelName}, isLoading } = use{ModelName}(id)

  // One useQueryStates block per has-many relation:
  const [filtersFor{ChildModelNames}, setFiltersFor{ChildModelNames}] = useQueryStates({
    // prefix each key to avoid collisions if multiple child tables exist
    {childModel}Page:          parseAsInteger.withDefault(1),
    {childModel}PageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    {childModel}SortField:     parseAsString.withDefault("{childDefaultSortField}"),
    {childModel}SortDirection: parseAsString.withDefault("desc"),
  })

  // One data hook per has-many relation:
  const { data: {childModelNames}Data, isLoading: is{ChildModelNames}Loading } = use{ChildModelNames}({
    {parentModelCamelCase}Id: id,
    page: filtersFor{ChildModelNames}.{childModel}Page,
    pageSize: filtersFor{ChildModelNames}.{childModel}PageSize,
    sortField: filtersFor{ChildModelNames}.{childModel}SortField,
    sortDirection: filtersFor{ChildModelNames}.{childModel}SortDirection,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: delete{ChildModelName}, isPending: isDeleting } = useDelete{ChildModelName}()

  if (isLoading) return null
  if (!{modelName}) return null

  const onSortChange = (table: string) => (field: string) => {
    // update the relevant filter state for the table
  }

  // Columns for each has-many child table:
  const {childModelNames}Columns: ColumnDef<{ChildModelName}>[] = [
    // ... columns per Step 4 rules
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          onDelete={() => setDeletingId(row.original.id)}
        />
      ),
    },
  ]

  return (
    <div className="px-6 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{{modelName}.{primaryDisplayField}}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Details</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* One DetailRow + Separator per field, in logical order */}
          {/* Between each pair of rows, add <Separator /> */}
          {/* Last row has no trailing Separator */}
        </div>
      </div>

      {/* One TableTemplate per has-many relation */}
      <TableTemplate
        title="{Human Readable Child Model Names}"
        columns={{childModelNames}Columns}
        data={{childModelNames}Data}
        isLoading={is{ChildModelNames}Loading}
        pageSize={filtersFor{ChildModelNames}.{childModel}PageSize}
        onPageChange={(page) => setFiltersFor{ChildModelNames}((prev) => ({ ...prev, {childModel}Page: page }))}
        onPageSizeChange={(pageSize) => setFiltersFor{ChildModelNames}((prev) => ({ ...prev, {childModel}Page: 1, {childModel}PageSize: pageSize }))}
        deleteConfig={{
          deletingId,
          onCancel: () => setDeletingId(null),
          onConfirm: () => {
            if (deletingId === null) return
            delete{ChildModelName}(deletingId, { onSuccess: () => setDeletingId(null) })
          },
          isPending: isDeleting,
        }}
      />
    </div>
  )
}

export default {ModelName}DetailPage
```

**Important structural rules for the page:**
- Import `DetailRow` from `@/components/ui/detail-row` — do NOT define it locally
- The `<h1>` always shows the primary display field of the model (prefer `title`, then `name`, then `id`)
- Detail rows are shown in this order: most important identifying/status fields first, then dates, then optional descriptive fields last
- If there are multiple child tables with delete functionality, use separate `deletingId` state variables per table (e.g. `deletingExpenseId`, `deletingAppointmentId`) to avoid conflicts
- If there is only one child table, a single `deletingId` state is fine
- The `onSortChange` helper should directly call `setFilters` for that table's state — inline it or make a dedicated function per table

---

### Step 7B — Sheet component (no has-many relations)

When the model has no has-many relations, generate a Sheet component instead of a page. **Do NOT generate an `[id]/page.tsx`.**

**Path:** `app/(app)/{model-names}/components/{model-name}-details-sheet.tsx`

Follow the `MedicalExpenseDetailsSheet` pattern exactly:

```typescript
"use client"

import Link from "next/link"
import type { {ModelName} } from "@/lib/generated/prisma/client"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { DetailRow } from "@/components/ui/detail-row"
// Import enum label constants if needed:
// import { ENUM_LABELS } from "../constants"
// Import hooks for FK-referenced models (to resolve display names):
// import { use{RelatedModel} } from "../../{related-model-names}/hooks/use-{related-model}"

type Props = {
  {modelName}: {ModelName} | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function {ModelName}DetailsSheet({ {modelName}, open, onOpenChange }: Props) {
  // Fetch related model display names for each FK field (only when FK is present):
  // const { data: {relatedModel} } = use{RelatedModel}({modelName}?.{fkField} ?? "")

  if (!{modelName}) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{{modelName}.{primaryDisplayField}}</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-4">
          {/* One DetailRow + Separator per field, in logical order */}
          {/* Between each pair of rows, add <Separator /> */}
          {/* Last row has no trailing Separator */}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

**Important structural rules for the sheet:**
- The sheet accepts the full item object (not just an ID) — the parent list page passes the selected row
- Import `DetailRow` from `@/components/ui/detail-row` — do NOT define it locally
- For FK fields, call the related model's single-item hook at the top of the component (using the FK value), then use the result's display name in the row. All FK hooks run unconditionally — pass `""` when the value is null/undefined (the hook should have `enabled: !!id` to skip the request)
- Detail rows follow the same field ordering and formatting rules as Step 3

**After generating the sheet, also update the list page** (`app/(app)/{model-names}/page.tsx`) to integrate the sheet:
1. Add `useState<{ModelName} | null>(null)` for `viewing{ModelName}` state
2. In the first column (primary display field), render a `<button>` that calls `setViewing{ModelName}(row.original)` on click, styled with `className="text-primary font-medium hover:text-primary/80 transition-colors text-left"`
3. Render the `<{ModelName}DetailsSheet>` in the `modals` prop of `TableTemplate`:
   ```tsx
   <{ModelName}DetailsSheet
     {modelName}={viewing{ModelName}}
     open={viewing{ModelName} !== null}
     onOpenChange={(open) => { if (!open) setViewing{ModelName}(null) }}
   />
   ```
4. If the list page does not yet use a `modals` prop, add it

---

## Step 8 — Final checks

After generating all files:
1. Remove all template comments and placeholder pseudo-code — replace with actual field names and logic
2. Ensure all imports are correct and match actual file paths
3. If a page already exists at `app/(app)/{model-names}/[id]/page.tsx` and the Sheet path was chosen, do NOT create a page — only create the sheet component and update the list page
4. If a page already exists at the path and the page path was chosen, replace its contents
5. Do NOT generate a form component — that is out of scope for this skill
6. Report:
   - Whether a full page (Step 7A) or Sheet component (Step 7B) was generated, and why
   - Which infrastructure files were created vs already existed
   - Which fields were shown in the details view and why any were excluded
   - Which has-many tables were added (page path only)
   - Whether any child model infrastructure needed updating to accept the parent FK filter
