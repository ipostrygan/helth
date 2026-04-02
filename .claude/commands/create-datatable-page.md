# Create Datatable Page

Generate a full-featured datatable page for a Prisma model following the medical-tracker architecture.

## Usage
```
/create-datatable-page <ModelName> [description="..."] [filter:<fieldName> ...]
```

**Examples:**
```
/create-datatable-page Therapy
/create-datatable-page Therapy description="Track your therapy sessions and progress"
/create-datatable-page Therapy description="Track your therapy sessions" filter:isActive
```

---

## Your task

The user has invoked this command with the following arguments:

> $ARGUMENTS

Parse the arguments to extract:
- **modelName**: PascalCase Prisma model name (first word/token)
- **description**: optional page description (from `description="..."` or quoted string after model name)
- **extraFilters**: optional list of fields to filter by (from `filter:fieldName` tokens)

Then execute the steps below.

---

## Step 1 — Read the Prisma schema

Read `/Users/ipostrygan/education/medical-tracker/prisma/schema.prisma` and locate the model matching `modelName`. Extract:
- All fields with their types (String, Float, DateTime, Boolean, enum type, relation, etc.)
- Which fields are optional (`?`)
- Which fields are enums (find the enum definition to get all values)
- Which fields are relations (have a `@relation` directive or are a model type / array type)
- Foreign key fields (fields ending in `Id`, e.g. `userId`, `therapyId`)

---

## Step 2 — Check for existing form component

Check if a form component exists at:
```
app/(app)/{model-names}/{model-name}-form.tsx
```
For example, for model `Therapy` → check `app/(app)/therapies/therapy-form.tsx`.

- If the file **exists**: add/edit functionality will be included
- If the file **does not exist**: only delete functionality will be implemented

> **Note on naming convention:** model `MedicalExpense` → folder `medical-expenses`, model `Therapy` → folder `therapies`. Use plural kebab-case for the folder name.

---

## Step 3 — Determine columns

Build the table column list from the model fields. Rules:

**Exclude from columns:**
- `id`, `description` fields
- Any field ending in `Id` (foreign keys like `userId`, `therapyId`)
- Array/relation fields (one-to-many, many-to-many)
- Fields of a related model type (relations)
- `imageKey` or similar storage key fields
- Fields that exist solely as link targets for another field (e.g. `therapistInfoLink` when `therapistName` is also present — the link field is used for wrapping, not as its own column)

**Include in columns:**
- All remaining scalar fields (String, Float, Int, DateTime, Boolean, enum)
- Use human-readable header names (camelCase → "Title Case")

**Column formatting:**
- `DateTime` fields → `new Date(row.getValue("fieldName")).toLocaleDateString()`
- Optional fields → `row.getValue("fieldName") ?? "—"`
- Boolean fields → `row.getValue("fieldName") ? "Yes" : "No"`
- Enum fields → use a `LABELS` constant (see constants file generation below)
- Numeric fields named `amount`, `price`, `cost`, `fee` → format as EUR currency: `new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(...)`
- String/text fields → display as-is (optional → `?? "—"`)

**Link wrapping rule:**
For each displayed field, check if a corresponding link field exists in the model. The naming patterns to look for:
- field `therapistName` → look for `therapistInfoLink`, `therapistLink`, `therapistUrl`
- field `X` → look for `XLink`, `XUrl`, `XInfoLink`

If such a link field exists, wrap the cell value in:
```tsx
const url = row.original.linkFieldName
url ? <a href={url} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noopener noreferrer" : undefined} className="underline hover:no-underline">{value}</a> : value
```
Absolute URLs (starting with `http://` or `https://`) → open in new tab with `target="_blank"` and `rel="noopener noreferrer"`. Relative URLs → render as-is (no target).

---

## Step 4 — Determine search fields

Identify which string fields are good candidates for search (title, name, description, notes, etc.). These will be used in the `OR` search clause in server actions.

---

## Step 5 — Determine sort default

Pick the default sort field:
- Prefer `date`, `startDate`, `createdAt` if they exist
- Fall back to `id`

---

## Step 6 — Determine additional filter fields (extraFilters)

Only implement additional filter groups (beyond search and date range) if they were **explicitly provided** via `filter:fieldName` arguments.

For each provided extra filter field:
- If the field is an enum → generate `LABELS` constant and options list, use as a multi-select filter
- If the field is Boolean → use two options: `{ value: "true", label: "Yes" }`, `{ value: "false", label: "No" }`

---

## Step 7 — Generate files

Generate ALL of the following files. Use the naming conventions exactly as shown. Replace placeholders:
- `{ModelName}` → PascalCase model name (e.g., `Therapy`)
- `{modelName}` → camelCase model name (e.g., `therapy`)
- `{model-name}` → kebab-case model name (e.g., `therapy`)
- `{model-names}` → plural kebab-case for folder/route (e.g., `therapies`)
- `{modelNames}` → camelCase plural (e.g., `therapies`)
- `{ModelNames}` → PascalCase plural (e.g., `Therapies`)

### File 1: Server actions
**Path:** `app/actions/{model-names}.ts`

```typescript
"use server";

import prisma from "@/lib/prisma";
import { {ModelName} } from "@/lib/generated/prisma/client";
// Import enums if used: import { EnumName } from "@/lib/generated/prisma/client";
import { SortDirection } from "@tanstack/react-table";
import { PaginatedResult } from "./medical-expenses"; // reuse the shared type

export type {ModelNames}Query = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: keyof {ModelName};
  sortDirection?: SortDirection;
  search?: string;
  dateFrom?: string; // only if model has a DateTime field
  dateTo?: string;   // only if model has a DateTime field
  // Add extra filter fields here if extraFilters were specified
  // e.g., types?: string[];
};

export const get{ModelNames} = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = "{defaultSortField}",
  sortDirection = "desc",
  search = "",
  dateFrom,  // only if model has a DateTime field
  dateTo,    // only if model has a DateTime field
  // extra filter params
}: {ModelNames}Query = {}): Promise<PaginatedResult<{ModelName}>> => {
  const skip = (page - 1) * pageSize;
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(search ? {
      OR: [
        // Include string fields suitable for search
        { fieldName: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    // Date range filter (only if model has DateTime field)
    ...(dateFrom || dateTo ? {
      {dateField}: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      },
    } : {}),
    // Extra enum filters (only if provided via extraFilters)
    // ...(types && types.length > 0 ? { type: { in: types as EnumType[] } } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.{modelName}.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortDirection },
    }),
    prisma.{modelName}.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const delete{ModelName} = async (id: string): Promise<void> => {
  await prisma.{modelName}.delete({ where: { id } });
};

// Include create/update only if form component exists:

export type Create{ModelName}Input = {
  userId: string;
  // ... all non-id, non-relation fields
};

export const create{ModelName} = async (input: Create{ModelName}Input) => {
  try {
    await prisma.{modelName}.create({ data: input });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to create {modelName}");
  }
};

export type Update{ModelName}Input = {
  id: string;
  // ... all updatable fields (exclude userId/relation ids)
};

export const update{ModelName} = async ({ id, ...data }: Update{ModelName}Input) => {
  try {
    await prisma.{modelName}.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to update {modelName}");
  }
};
```

> Adapt the actual field list based on the real Prisma model. Only include `create`/`update` functions if the form component exists.

---

### File 2: API client layer
**Path:** `lib/api/{model-names}.ts`

```typescript
import type { PaginatedResult } from "@/app/actions/medical-expenses";
import type { {ModelName} } from "@/lib/generated/prisma/client";

export type {ModelNames}Params = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  // extra filter params
};

export async function get{ModelNames}(
  params: {ModelNames}Params
): Promise<PaginatedResult<{ModelName}>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = "{defaultSortField}",
    sortDirection = "desc",
    search = "",
    dateFrom,
    dateTo,
    // extra filter params
  } = params;

  const searchParams = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    // extra filter params (arrays joined with comma)
  });

  const res = await fetch(`/api/{model-names}?${searchParams}`);
  return res.json();
}

export async function delete{ModelName}(id: string): Promise<void> {
  const res = await fetch(`/api/{model-names}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete {modelName}");
}
```

---

### File 3: API GET route
**Path:** `app/api/{model-names}/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server";
import { get{ModelNames} } from "../../actions/{model-names}";
import { {ModelName} } from "@/lib/generated/prisma/client";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";

const searchParamsCache = createSearchParamsCache({
  profileId:     parseAsString,
  page:          parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField:     parseAsString.withDefault("{defaultSortField}"),
  sortDirection: parseAsString.withDefault("desc"),
  search:        parseAsString.withDefault(""),
  dateFrom:      parseAsString,   // only if model has DateTime
  dateTo:        parseAsString,   // only if model has DateTime
  // extra filter params: e.g. types: parseAsArrayOf(parseAsString)
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo } =
    searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await get{ModelNames}({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField: sortField as keyof {ModelName},
    sortDirection: sortDirection as "asc" | "desc",
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
  })
  return NextResponse.json(result)
}
```

---

### File 4: API DELETE route
**Path:** `app/api/{model-names}/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { delete{ModelName} } from "../../../actions/{model-names}";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await delete{ModelName}(id);
  return new NextResponse(null, { status: 204 });
}
```

---

### File 5: List query hook
**Path:** `app/(app)/{model-names}/hooks/use-{model-names}.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/app/actions/medical-expenses";
import type { {ModelName} } from "@/lib/generated/prisma/client";
import { get{ModelNames}, type {ModelNames}Params } from "@/lib/api/{model-names}";

export type { {ModelNames}Params };

export const {modelNames}QueryKey = (params: {ModelNames}Params) =>
  ["{model-names}", params] as const;

export const use{ModelNames} = (params: {ModelNames}Params = {}) => {
  return useQuery<PaginatedResult<{ModelName}>>({
    queryKey: {modelNames}QueryKey(params),
    queryFn: () => get{ModelNames}(params),
  });
};
```

---

### File 6: Delete mutation hook
**Path:** `app/(app)/{model-names}/hooks/use-delete-{model-name}.ts`

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delete{ModelName} } from "@/lib/api/{model-names}";

export const useDelete{ModelName} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => delete{ModelName}(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{model-names}"] });
    },
  });
};
```

---

### File 7 (if form exists): Create mutation hook
**Path:** `app/(app)/{model-names}/hooks/use-create-{model-name}.ts`

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create{ModelName} } from "@/app/actions/{model-names}";

export const useCreate{ModelName} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create{ModelName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{model-names}"] });
    },
  });
};
```

---

### File 8 (if form exists): Edit mutation hook
**Path:** `app/(app)/{model-names}/hooks/use-edit-{model-name}.ts`

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { update{ModelName} } from "@/app/actions/{model-names}";

export const useEdit{ModelName} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: update{ModelName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{model-names}"] });
    },
  });
};
```

---

### File 9 (if model has enum fields used as extra filters): Constants file
**Path:** `app/(app)/{model-names}/constants.ts`

```typescript
import { EnumTypeName } from "@/lib/generated/prisma"

export const ENUM_TYPE_LABELS: Record<EnumTypeName, string> = {
  Value1: "Human Readable Value 1",
  Value2: "Human Readable Value 2",
  // ... all enum values
}
```

---

### File 10: The page component
**Path:** `app/(app)/{model-names}/page.tsx`

This is the main deliverable. Follow the medical-expenses page pattern exactly:

```typescript
"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { {ModelName} } from "@/lib/generated/prisma/client"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { use{ModelNames} } from "./hooks/use-{model-names}"
import { useDelete{ModelName} } from "./hooks/use-delete-{model-name}"
// Import form and edit hook only if form exists:
// import {ModelName}Form from "./{model-name}-form"
// import { useCreate{ModelName} } from "./hooks/use-create-{model-name}"
// import { useEdit{ModelName} } from "./hooks/use-edit-{model-name}"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { SortButton } from "@/components/ui/sort-button"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Modal } from "@/components/ui/modal"
import { TableTemplate } from "@/components/table-template"
// Import constants only if there are extra enum filters:
// import { ENUM_TYPE_LABELS } from "./constants"

// Uncomment if there are extra enum filter options:
// const ENUM_TYPE_OPTIONS = Object.entries(ENUM_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const {ModelNames}Page = () => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    page:          parseAsInteger.withDefault(1),
    pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    sortField:     parseAsString.withDefault("{defaultSortField}"),
    sortDirection: parseAsString.withDefault("desc"),
    search:        parseAsString.withDefault(""),
    dateFrom:      parseAsString,  // only if model has DateTime
    dateTo:        parseAsString,  // only if model has DateTime
    // extra filter state (only if extraFilters provided):
    // types: parseAsArrayOf(parseAsString).withDefault([]),
  })

  const { data, isLoading } = use{ModelNames}({
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDelete{ModelName}()

  // Only if form exists:
  // const [addingItem, setAddingItem] = useState(false)
  // const [editingItem, setEditingItem] = useState<{ModelName} | null>(null)

  if (!profile) {
    return null
  }

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const columns: ColumnDef<{ModelName}>[] = [
    // Generate columns based on Step 3 rules
    // Include SortButton for sortable fields (strings, numbers, dates)
    // Apply link wrapping if a corresponding link field exists
    // Always include an actions column at the end:
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Only if form exists: */}
            {/* <DropdownMenuItem onSelect={() => setEditingItem(row.original)}>Edit</DropdownMenuItem> */}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeletingId(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // Only if model has DateTime fields:
  const dateRange =
    filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  return (
    <TableTemplate
      title={`${profile.firstName}'s {human readable plural model name}`}
      // Add description prop if one was provided:
      // description="{description}"  — Note: check if TableTemplate supports description prop; if not, render it manually above the component
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageSize={filters.pageSize}
      onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))}
      // Only if form exists:
      // onAddNew={() => setAddingItem(true)}
      filters={{
        searchValue: filters.search,
        onSearchChange: (search) => setFilters((prev) => ({ ...prev, page: 1, search })),
        searchPlaceholder: "Search {model-names}...",
        // Only if model has DateTime:
        dateRange,
        onDateRangeChange: (range: DateRange | undefined) =>
          setFilters((prev) => ({
            ...prev,
            page: 1,
            dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : null,
            dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : null,
          })),
        // Extra filter groups only if extraFilters were provided:
        // filterGroups: [
        //   {
        //     label: "Type",
        //     options: ENUM_TYPE_OPTIONS,
        //     selected: filters.types,
        //     onChange: (types) => setFilters((prev) => ({ ...prev, page: 1, types })),
        //   },
        // ],
        hasActiveFilters: !!(filters.search || filters.dateFrom || filters.dateTo),
        onClearFilters: () => setFilters({ page: 1, search: "", dateFrom: null, dateTo: null }),
      }}
      deleteConfig={{
        deletingId,
        onCancel: () => setDeletingId(null),
        onConfirm: () => {
          if (deletingId === null) return
          deleteItem(deletingId, { onSuccess: () => setDeletingId(null) })
        },
        isPending: isDeleting,
      }}
      // Only if form exists:
      // modals={
      //   <>
      //     <Modal
      //       open={addingItem}
      //       onOpenChange={(open) => { if (!open) setAddingItem(false) }}
      //       title="Add {human readable model name}"
      //       description="Fill in the details below."
      //     >
      //       <{ModelName}Form profileId={activeProfileId!} onClose={() => setAddingItem(false)} />
      //     </Modal>
      //     <Modal
      //       open={editingItem !== null}
      //       onOpenChange={(open) => { if (!open) setEditingItem(null) }}
      //       title="Edit {human readable model name}"
      //       description="Update the details of the selected {human readable model name}."
      //     >
      //       {editingItem && (
      //         <{ModelName}Form
      //           profileId={activeProfileId!}
      //           onClose={() => setEditingItem(null)}
      //           {modelName}={editingItem}
      //         />
      //       )}
      //     </Modal>
      //   </>
      // }
    />
  )
}

export default {ModelNames}Page
```

---

## Step 8 — Check if TableTemplate supports a description prop

Look at the current `components/table-template.tsx`. If it does NOT have a `description` prop:
1. Add a `description?: string` prop to `TableTemplateProps`
2. Render it in the JSX below the `<h1>` title, e.g.:
   ```tsx
   {description && <p className="text-sm text-muted-foreground">{description}</p>}
   ```
Only do this if a description was actually provided in the arguments AND TableTemplate doesn't already support it.

---

## Step 9 — Final checks

After generating all files:
1. Remove all template comments and dead code (commented-out sections that don't apply)
2. Ensure all imports are correct and match actual file paths
3. If the page folder already has a `page.tsx`, replace its contents
4. Do NOT generate a form component — that is out of scope for this skill
5. Report which files were created/modified and whether add/edit was included or skipped (and why)
