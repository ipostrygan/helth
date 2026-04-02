# Create Form

Generate a form component (modal or separate page) for a Prisma model, supporting both add and edit modes.

## Usage
```
/create-form <ModelName>
```

**Examples:**
```
/create-form MedicalExpense
/create-form Therapy
/create-form Appointment
```

---

## Your task

The user has invoked this command with the following arguments:

> $ARGUMENTS

Parse the arguments to extract:
- **modelName**: PascalCase Prisma model name (single token)

Then execute all steps below sequentially.

---

## Step 1 — Read the Prisma schema

Read `/Users/ipostrygan/education/medical-tracker/prisma/schema.prisma` and locate the model matching `modelName`. Extract:

- All fields with their types (`String`, `Float`, `Int`, `DateTime`, `Boolean`, enum type, relation model type, array type)
- Which fields are optional (`?`)
- Which fields are enums — also locate the full enum definition to get all values
- Which fields are relations (have `@relation`, are a model type, or are an array type)
- Foreign key fields (fields ending in `Id`, e.g. `userId`, `therapyId`)

Build two lists:

**FormFields** — fields that will appear in the form. Exclude:
- `id`
- `userId` (the profile ownership FK — always passed as a prop, never shown in the form)
- Any array/relation fields
- Fields of a related model type (not scalar)
- `imageKey` or similar storage key fields
- `createdAt`, `updatedAt` (auto-managed)

**RelationFields** — foreign key fields (ending in `Id`) that ARE user-selectable, i.e. every FK except `userId`. For each, derive the related model name by stripping `Id` (e.g. `therapyId` → `Therapy`).

Count the total number of **FormFields**. This determines the form mode:
- **≤ 6 FormFields** → **Modal form** (rendered inside a Dialog on the datatable page)
- **> 6 FormFields** → **Separate page** (dedicated create/edit routes)

---

## Step 2 — Check for existing server actions and hooks

Check `app/actions/{model-names}.ts` for the presence of `create{ModelName}` and `update{ModelName}` functions.

Check whether these hooks already exist:
- `app/(app)/{model-names}/hooks/use-create-{model-name}.ts`
- `app/(app)/{model-names}/hooks/use-edit-{model-name}.ts`

Note which files need to be created vs. already exist.

---

## Step 3 — Check for existing constants

Check `app/(app)/{model-names}/constants.ts`. If it does not exist and the model has enum fields, it will need to be created with `LABELS` maps.

---

## Step 4 — Check for existing Command combobox components

For each **RelationField** (e.g. `therapyId` → `Therapy`), check whether a combobox component already exists at:
```
app/(app)/{model-names}/components/{relation-name}-combobox.tsx
```
For example: `app/(app)/medical-expenses/components/therapy-combobox.tsx`

Also check if a shared component exists at `components/ui/{relation-name}-combobox.tsx`.

Note which combobox components need to be created.

---

## Step 5 — Check the existing datatable page (modal mode only)

If form mode is **Modal**, read the existing `app/(app)/{model-names}/page.tsx` to understand its current state so you can patch it correctly.

---

## Step 6 — Generate or update server actions

Open `app/actions/{model-names}.ts`. If `create{ModelName}` or `update{ModelName}` are missing, add them following this pattern:

```typescript
export type Create{ModelName}Input = {
  userId: string;
  // All FormFields (non-optional fields required, optional fields marked with ?)
  // Include RelationFields (e.g. therapyId?: string)
  fieldName: FieldType;
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
  // All FormFields (same types as Create but all optional for partial updates, except required ones)
  // Include RelationFields
  fieldName?: FieldType;
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

Use actual field names and types from the Prisma model. Map Prisma types to TypeScript: `String` → `string`, `Float`/`Int` → `number`, `DateTime` → `Date`, `Boolean` → `boolean`, enum → the enum type from `@/lib/generated/prisma/client`.

---

## Step 7 — Generate mutation hooks (if missing)

### use-create-{model-name}.ts
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

### use-edit-{model-name}.ts
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

## Step 8 — Generate constants file (if missing and model has enums)

If the model has enum fields and `app/(app)/{model-names}/constants.ts` does not exist, create it:

```typescript
import { EnumTypeName } from "@/lib/generated/prisma";

export const ENUM_TYPE_LABELS: Record<EnumTypeName, string> = {
  Value1: "Human Readable Value 1",
  // ... all enum values with friendly labels (PascalCase → "Title Case with spaces")
};
```

If the file already exists, check whether labels for all enums in this model are present and add any missing ones.

---

## Step 9 — Generate Command combobox components (for relation fields)

For each **RelationField** that needs a combobox component, create:

**Path:** `app/(app)/{model-names}/components/{relation-name}-combobox.tsx`

The component must:
- Accept `value: string | null`, `onChange: (id: string) => void`, and optionally `profileId?: string`
- Use a `Popover` + `Command` (shadcn) pattern for the dropdown
- Fetch results reactively based on the user's typed search using `useQuery` from `@tanstack/react-query`
- Use `shouldFilter={false}` on `Command` (server-side filtering)
- Call the appropriate API client function (from `lib/api/{relation-names}.ts`) passing `search` and `profileId`
- Display a sensible label field (prefer `title`, `name`, `firstName`+`lastName`, then fall back to `id`)
- Show the selected item's label on the trigger button
- Show "No results found." in `CommandEmpty` when the list is empty

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { get{RelationNames} } from "@/lib/api/{relation-names}";

type {RelationName}ComboboxProps = {
  value: string | null;
  onChange: (id: string) => void;
  profileId?: string;
};

export function {RelationName}Combobox({ value, onChange, profileId }: {RelationName}ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["{relation-names}-combobox", profileId, search],
    queryFn: () => get{RelationNames}({ profileId, search, pageSize: 20 }),
    enabled: open,
  });

  const items = data?.data ?? [];
  const selected = items.find((item) => item.id === value);
  // If value is set but not in current results, we still want to show something.
  // Keep a label by checking selected or falling back to value.
  const selectedLabel = selected ? (selected.title ?? selected.name ?? selected.id) : (value ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedLabel : "Select {relation-name}..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search {relation-name}s..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 size-4", value === item.id ? "opacity-100" : "opacity-0")}
                  />
                  {item.title ?? item.name ?? item.id}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

Adapt the label display logic based on the actual fields of the related model (e.g. `User` uses `firstName + " " + lastName`).

---

## Step 10 — Generate the form component

### Zod schema

Build the Zod schema from all **FormFields** and **RelationFields**:

- `String` (required) → `z.string().min(1, "Field is required")`
- `String?` (optional) → `z.string().optional()`
- `Float` / `Int` (required) → `z.number().positive("Must be greater than 0")`
- `Float?` / `Int?` → `z.number().optional()`
- `DateTime` (required) → `z.date()`
- `DateTime?` → `z.date().optional()`
- `Boolean` → `z.boolean().default(false)`
- Enum (required) → `z.nativeEnum(EnumType)` — import the enum from `@/lib/generated/prisma`
- Enum (optional) → `z.nativeEnum(EnumType).optional()`
- RelationField FK (e.g. `therapyId?: string`) → `z.string().optional()` (optional FK for optional relation) or `z.string().min(1)` if required

### Input component per field type

Use these shadcn components:

| Field type | Component |
|---|---|
| `String` (short, ≤ 1 line expected) | `<Input>` |
| `String` (long: `description`, `notes`, `comment`, `bio`) | `<Textarea rows={3}>` |
| `Float` / `Int` | `<Input type="number" step="0.01">` (use `step="1"` for Int) |
| `DateTime` | `<Popover>` + `<Calendar>` (same pattern as medical-expense-form) |
| `Boolean` | `<Switch>` from shadcn, wrapped in a `<Field>` with label |
| Enum | `<Select>` + `<SelectContent>` with items from LABELS constant |
| RelationField FK | `<{RelationName}Combobox>` component (created in Step 9) |

Wrap every field in `<Field>`, `<Label>`, and `<FieldError>` from `@/components/ui/field`.
Use `Controller` from `react-hook-form` for Calendar, Select, Switch, and Combobox fields.
Use `register` for plain `Input` and `Textarea` fields.

### Default values (edit mode)

When `{modelName}` prop is provided (edit mode), set `defaultValues` from the existing item:
- `DateTime` fields: `new Date(item.fieldName)`
- `Float`/`Int`: use as-is
- Optional fields: `item.fieldName ?? undefined`
- All others: directly from item

### On submit

```typescript
const onSubmit = async (values: FormValues) => {
  if (isEditMode) {
    await edit{ModelName}({ id: {modelName}.id, ...values })
  } else {
    await create{ModelName}({ ...values, userId: profileId })
  }
  // modal mode: call onClose()
  // page mode: router.push("/{model-names}")
}
```

---

### Modal form variant (≤ 6 FormFields)

**Path:** `app/(app)/{model-names}/{model-name}-form.tsx`

Structure:
```typescript
"use client"

// imports...

const schema = z.object({ /* fields */ })
type FormValues = z.infer<typeof schema>

type {ModelName}FormProps = {
  profileId: string
  onClose: () => void
  {modelName}?: {ModelName}  // optional = edit mode when present
}

const {ModelName}Form = ({ profileId, onClose, {modelName} }: {ModelName}FormProps) => {
  const isEditMode = !!{modelName}
  const { mutateAsync: create{ModelName} } = useCreate{ModelName}()
  const { mutateAsync: edit{ModelName} } = useEdit{ModelName}()
  // calendar open state if any DateTime fields
  const { control, register, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {modelName} ? { /* map fields */ } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await edit{ModelName}({ id: {modelName}.id, ...values })
    } else {
      await create{ModelName}({ ...values, userId: profileId })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* fields */}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isPending={isSubmitting} disabled={!isDirty || !isValid}>
          {isEditMode ? "Save" : "Submit"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default {ModelName}Form
```

Import `DialogFooter` from `@/components/ui/dialog`.

---

### Separate page variant (> 6 FormFields)

Create two page files that share the same form component.

#### Shared form component
**Path:** `app/(app)/{model-names}/components/{model-name}-form.tsx`

```typescript
"use client"

// imports...
import { useRouter } from "next/navigation"

const schema = z.object({ /* all FormFields and RelationFields */ })
type FormValues = z.infer<typeof schema>

type {ModelName}FormProps = {
  profileId: string
  {modelName}?: {ModelName}  // optional = edit mode
}

const {ModelName}Form = ({ profileId, {modelName} }: {ModelName}FormProps) => {
  const router = useRouter()
  const isEditMode = !!{modelName}
  const { mutateAsync: create{ModelName} } = useCreate{ModelName}()
  const { mutateAsync: edit{ModelName} } = useEdit{ModelName}()
  // calendar open state if DateTime fields
  const { control, register, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {modelName} ? { /* map fields */ } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await edit{ModelName}({ id: {modelName}.id, ...values })
    } else {
      await create{ModelName}({ ...values, userId: profileId })
    }
    router.push("/{model-names}")
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <form id="{model-name}-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* all fields */}
          </FieldGroup>
        </form>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/{model-names}")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="{model-name}-form"
            isPending={isSubmitting}
            disabled={!isDirty || !isValid}
          >
            {isEditMode ? "Save" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default {ModelName}Form
```

#### Create page
**Path:** `app/(app)/{model-names}/create/page.tsx`

```typescript
"use client"

import { useActiveProfile } from "@/context/profile-context"
import {ModelName}Form from "../components/{model-name}-form"

const Create{ModelName}Page = () => {
  const { activeProfileId } = useActiveProfile()

  if (!activeProfileId) return null

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold">Add {Human Readable Model Name}</h1>
      </div>
      <{ModelName}Form profileId={activeProfileId} />
    </div>
  )
}

export default Create{ModelName}Page
```

#### Edit page
**Path:** `app/(app)/{model-names}/[id]/edit/page.tsx`

```typescript
"use client"

import { use } from "react"
import { useActiveProfile } from "@/context/profile-context"
import { use{ModelName} } from "../hooks/use-{model-name}"  // single-item query hook (create if missing — see below)
import {ModelName}Form from "../../components/{model-name}-form"

type EditPageProps = {
  params: Promise<{ id: string }>
}

const Edit{ModelName}Page = ({ params }: EditPageProps) => {
  const { id } = use(params)
  const { activeProfileId } = useActiveProfile()
  const { data: {modelName}, isLoading } = use{ModelName}(id)

  if (isLoading) return null
  if (!{modelName} || !activeProfileId) return null

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold">Edit {Human Readable Model Name}</h1>
      </div>
      <{ModelName}Form profileId={activeProfileId} {modelName}={{modelName}} />
    </div>
  )
}

export default Edit{ModelName}Page
```

For the edit page you need a single-item query hook. Check if `app/(app)/{model-names}/hooks/use-{model-name}.ts` exists. If not, create it:

```typescript
// app/(app)/{model-names}/hooks/use-{model-name}.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { {ModelName} } from "@/lib/generated/prisma/client";
import { get{ModelName} } from "@/lib/api/{model-names}";  // see API client note below

export const use{ModelName} = (id: string) => {
  return useQuery<{ModelName}>({
    queryKey: ["{model-names}", id],
    queryFn: () => get{ModelName}(id),
    enabled: !!id,
  });
};
```

Also add a `get{ModelName}(id: string)` function to `lib/api/{model-names}.ts`:

```typescript
export async function get{ModelName}(id: string): Promise<{ModelName}> {
  const res = await fetch(`/api/{model-names}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch {modelName}");
  return res.json();
}
```

And add a GET handler to `app/api/{model-names}/[id]/route.ts` (alongside DELETE):

```typescript
import { get{ModelName}ById } from "../../../actions/{model-names}";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await get{ModelName}ById(id);
  if (!item) return new NextResponse(null, { status: 404 });
  return NextResponse.json(item);
}
```

And the corresponding server action:

```typescript
export const get{ModelName}ById = async (id: string): Promise<{ModelName} | null> => {
  return prisma.{modelName}.findUnique({ where: { id } });
};
```

---

## Step 11 — Patch the datatable page (modal mode only)

If form mode is **Modal**, patch `app/(app)/{model-names}/page.tsx`:

1. Add these imports:
   ```typescript
   import {ModelName}Form from "./{model-name}-form"
   import { useCreate{ModelName} } from "./hooks/use-create-{model-name}"
   import { useEdit{ModelName} } from "./hooks/use-edit-{model-name}"
   ```
   (The `useCreate`/`useEdit` imports are not needed in the page itself since the form uses them internally — skip them.)

2. Add state inside the component (after the existing `deletingId` state):
   ```typescript
   const [addingItem, setAddingItem] = useState(false)
   const [editingItem, setEditingItem] = useState<{ModelName} | null>(null)
   ```

3. Add `onAddNew` prop to `<TableTemplate>`:
   ```typescript
   onAddNew={() => setAddingItem(true)}
   addNewLabel="Add {Human Readable Model Name}"
   ```

4. Add Edit action to the dropdown menu inside the `actions` column (before Delete):
   ```typescript
   <DropdownMenuItem onSelect={() => setEditingItem(row.original)}>Edit</DropdownMenuItem>
   ```

5. Add `modals` prop to `<TableTemplate>`:
   ```typescript
   modals={
     <>
       <Modal
         open={addingItem}
         onOpenChange={(open) => { if (!open) setAddingItem(false) }}
         title="Add {Human Readable Model Name}"
         description="Fill in the details below."
       >
         <{ModelName}Form profileId={activeProfileId!} onClose={() => setAddingItem(false)} />
       </Modal>
       <Modal
         open={editingItem !== null}
         onOpenChange={(open) => { if (!open) setEditingItem(null) }}
         title="Edit {Human Readable Model Name}"
         description="Update the details of the selected {human readable model name}."
       >
         {editingItem && (
           <{ModelName}Form
             profileId={activeProfileId!}
             onClose={() => setEditingItem(null)}
             {modelName}={editingItem}
           />
         )}
       </Modal>
     </>
   }
   ```

Make minimal, targeted edits to the existing page file — do not rewrite it from scratch.

---

## Step 12 — Patch the datatable page (separate page mode only)

If form mode is **Separate page**, patch `app/(app)/{model-names}/page.tsx`:

1. Add these imports:
   ```typescript
   import { useRouter } from "next/navigation"
   ```

2. Add `const router = useRouter()` inside the component.

3. Add `onAddNew` prop to `<TableTemplate>`:
   ```typescript
   onAddNew={() => router.push("/{model-names}/create")}
   addNewLabel="Add {Human Readable Model Name}"
   ```

4. Add Edit action to the dropdown menu:
   ```typescript
   <DropdownMenuItem onSelect={() => router.push(`/{model-names}/${row.original.id}/edit`)}>
     Edit
   </DropdownMenuItem>
   ```

---

## Step 13 — Final checks

1. Verify all imports are correct and match actual file paths in this project.
2. Ensure all new `components/` directories are created (they don't need an `index.ts`).
3. Remove any leftover template comments from generated files.
4. Do NOT generate or modify the main list page beyond the targeted patches in Step 11/12.
5. If any shadcn component used (`Switch`, `Command`, `CommandInput`, etc.) is not yet in `components/ui/`, note that the user should run `npx shadcn@latest add <component>` to install it.
6. Report a summary:
   - Form mode chosen (modal / separate page) and why (field count)
   - Files created
   - Files modified
   - Any shadcn components that may need to be installed
   - Any relation combobox components generated
