<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-vue-next';
import { computed, reactive, ref } from 'vue';
import Heading from '@/components/Heading.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { departmentRecords } from '@/lib/hrisData';
import { departments } from '@/routes';
import type { DepartmentRecord } from '@/types';

type DepartmentFormMode = 'create' | 'edit';

type DepartmentFormState = {
    name: string;
    supervisor: string;
    workLocation: string;
    positions: string;
};

type DepartmentFormErrors = Partial<Record<keyof DepartmentFormState, string>>;

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Department',
                href: departments(),
            },
        ],
    },
});

const searchTerm = ref<string>('');
const localDepartmentRecords = ref<DepartmentRecord[]>(
    departmentRecords.map(cloneDepartmentRecord),
);
const departmentFormMode = ref<DepartmentFormMode>('create');
const editingDepartmentId = ref<string | null>(null);
const deletingDepartmentId = ref<string | null>(null);
const isDepartmentDialogOpen = ref<boolean>(false);
const isDeleteDialogOpen = ref<boolean>(false);
const departmentFormErrors = ref<DepartmentFormErrors>({});
const departmentForm = reactive<DepartmentFormState>({
    name: '',
    supervisor: '',
    workLocation: '',
    positions: '',
});

const filteredDepartmentRecords = computed<DepartmentRecord[]>(() => {
    const normalizedSearchTerm = searchTerm.value.trim().toLowerCase();

    if (normalizedSearchTerm === '') {
        return localDepartmentRecords.value;
    }

    return localDepartmentRecords.value.filter((department) =>
        [
            department.id,
            department.name,
            department.supervisor,
            department.workLocation,
            department.positions.join(' '),
        ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearchTerm),
    );
});

const departmentDialogTitle = computed(() =>
    departmentFormMode.value === 'create'
        ? 'Create department'
        : 'Edit department',
);

const departmentDialogDescription = computed(() =>
    departmentFormMode.value === 'create'
        ? 'Add a static department row to this demo workspace. Changes stay in local page state only.'
        : 'Update the selected static department row. Changes stay in local page state only.',
);

const departmentDialogActionLabel = computed(() =>
    departmentFormMode.value === 'create'
        ? 'Save department'
        : 'Update department',
);

const departmentPendingDeletion = computed<DepartmentRecord | null>(() =>
    deletingDepartmentId.value
        ? (localDepartmentRecords.value.find(
              (department) => department.id === deletingDepartmentId.value,
          ) ?? null)
        : null,
);

function cloneDepartmentRecord(department: DepartmentRecord): DepartmentRecord {
    return {
        ...department,
        positions: [...department.positions],
    };
}

function resetDepartmentForm(): void {
    departmentForm.name = '';
    departmentForm.supervisor = '';
    departmentForm.workLocation = '';
    departmentForm.positions = '';
    departmentFormErrors.value = {};
    editingDepartmentId.value = null;
}

function positionsAsText(positions: string[]): string {
    return positions.join(', ');
}

function parsePositions(positions: string): string[] {
    return Array.from(
        new Set(
            positions
                .split(',')
                .map((position) => position.trim())
                .filter(Boolean),
        ),
    );
}

function slugifyDepartmentName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function createDepartmentId(name: string): string {
    const baseId = slugifyDepartmentName(name) || 'department';
    let nextId = baseId;
    let suffix = 2;

    while (
        localDepartmentRecords.value.some(
            (department) => department.id === nextId,
        )
    ) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
    }

    return nextId;
}

function validateDepartmentForm(): boolean {
    const errors: DepartmentFormErrors = {};

    if (departmentForm.name.trim() === '') {
        errors.name = 'Department name is required.';
    }

    if (departmentForm.supervisor.trim() === '') {
        errors.supervisor = 'Supervisor is required.';
    }

    if (departmentForm.workLocation.trim() === '') {
        errors.workLocation = 'Work location is required.';
    }

    if (parsePositions(departmentForm.positions).length === 0) {
        errors.positions = 'Add at least one position.';
    }

    departmentFormErrors.value = errors;

    return Object.keys(errors).length === 0;
}

function openCreateDepartmentDialog(): void {
    departmentFormMode.value = 'create';
    resetDepartmentForm();
    isDepartmentDialogOpen.value = true;
}

function openEditDepartmentDialog(department: DepartmentRecord): void {
    departmentFormMode.value = 'edit';
    editingDepartmentId.value = department.id;
    departmentForm.name = department.name;
    departmentForm.supervisor = department.supervisor;
    departmentForm.workLocation = department.workLocation;
    departmentForm.positions = positionsAsText(department.positions);
    departmentFormErrors.value = {};
    isDepartmentDialogOpen.value = true;
}

function handleDepartmentDialogOpenChange(isOpen: boolean): void {
    isDepartmentDialogOpen.value = isOpen;

    if (!isOpen) {
        resetDepartmentForm();
    }
}

function saveDepartment(): void {
    if (!validateDepartmentForm()) {
        return;
    }

    const nextDepartmentRecord: DepartmentRecord = {
        id:
            editingDepartmentId.value ??
            createDepartmentId(departmentForm.name.trim()),
        name: departmentForm.name.trim(),
        supervisor: departmentForm.supervisor.trim(),
        workLocation: departmentForm.workLocation.trim(),
        positions: parsePositions(departmentForm.positions),
    };

    if (departmentFormMode.value === 'create') {
        localDepartmentRecords.value = [
            nextDepartmentRecord,
            ...localDepartmentRecords.value,
        ];
    } else {
        localDepartmentRecords.value = localDepartmentRecords.value.map(
            (department) =>
                department.id === nextDepartmentRecord.id
                    ? nextDepartmentRecord
                    : department,
        );
    }

    isDepartmentDialogOpen.value = false;
    resetDepartmentForm();
}

function openDeleteDepartmentDialog(department: DepartmentRecord): void {
    deletingDepartmentId.value = department.id;
    isDeleteDialogOpen.value = true;
}

function handleDeleteDialogOpenChange(isOpen: boolean): void {
    isDeleteDialogOpen.value = isOpen;

    if (!isOpen) {
        deletingDepartmentId.value = null;
    }
}

function deleteDepartment(): void {
    if (!departmentPendingDeletion.value) {
        return;
    }

    localDepartmentRecords.value = localDepartmentRecords.value.filter(
        (department) => department.id !== departmentPendingDeletion.value?.id,
    );
    isDeleteDialogOpen.value = false;
    deletingDepartmentId.value = null;
}
</script>

<template>
    <Head title="Department" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section
            class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6"
        >
            <div class="flex flex-col gap-6">
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
                >
                    <Heading
                        title="Department"
                        description="Manage a static department directory from one HRIS workspace using local create, edit, and delete dialogs."
                    />

                    <div
                        class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                    >
                        <Badge
                            variant="outline"
                            class="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                            Static demo data
                        </Badge>
                        <span
                            >{{ filteredDepartmentRecords.length }} rows in
                            view</span
                        >
                    </div>
                </div>

                <Card class="rounded-[1.75rem] shadow-xs">
                    <CardHeader class="gap-3 border-b bg-muted/20 pb-5">
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by department id, name, supervisor, work
                            location, or listed positions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                        <div class="grid gap-2">
                            <Label for="department-search">Search</Label>
                            <div class="relative">
                                <Search
                                    class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="department-search"
                                    v-model="searchTerm"
                                    type="text"
                                    placeholder="Search department id, name, supervisor, or position"
                                    class="pl-9"
                                />
                            </div>
                        </div>

                        <div class="flex items-end">
                            <Button
                                class="w-full rounded-full lg:w-auto"
                                @click="openCreateDepartmentDialog"
                            >
                                <Plus class="size-4" />
                                Create department
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card class="rounded-[1.75rem] shadow-xs">
                    <CardHeader
                        class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                        <div>
                            <CardTitle>Department table</CardTitle>
                            <CardDescription>
                                Static department records with client-only CRUD
                                actions for mockup workflows.
                            </CardDescription>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {{ filteredDepartmentRecords.length }} static rows
                        </p>
                    </CardHeader>

                    <CardContent class="p-0">
                        <div
                            v-if="filteredDepartmentRecords.length === 0"
                            class="flex flex-col items-center gap-3 px-6 py-16 text-center"
                        >
                            <div
                                class="rounded-full border bg-muted p-4 text-muted-foreground"
                            >
                                <SearchX class="size-6" />
                            </div>
                            <div class="space-y-1">
                                <p class="font-medium text-foreground">
                                    No department rows found
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    Adjust the current search or create a new
                                    static department entry.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                class="rounded-full"
                                @click="openCreateDepartmentDialog"
                            >
                                <Plus class="size-4" />
                                Create department
                            </Button>
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead
                                    class="bg-muted/35 text-left text-xs font-medium text-muted-foreground"
                                >
                                    <tr>
                                        <th class="px-6 py-4 font-mono">id</th>
                                        <th class="px-6 py-4">name</th>
                                        <th class="px-6 py-4">supervisor</th>
                                        <th class="px-6 py-4">workLocation</th>
                                        <th class="px-6 py-4">positions</th>
                                        <th class="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="department in filteredDepartmentRecords"
                                        :key="department.id"
                                        class="border-b hover:bg-muted/20"
                                    >
                                        <td
                                            class="px-6 py-4 font-mono text-xs whitespace-nowrap text-muted-foreground"
                                        >
                                            {{ department.id }}
                                        </td>
                                        <td
                                            class="px-6 py-4 font-medium whitespace-nowrap"
                                        >
                                            {{ department.name }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {{ department.supervisor }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="block min-w-56">
                                                {{ department.workLocation }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="block min-w-64">
                                                {{
                                                    department.positions.join(
                                                        ', ',
                                                    )
                                                }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    class="rounded-full"
                                                    @click="
                                                        openEditDepartmentDialog(
                                                            department,
                                                        )
                                                    "
                                                >
                                                    <Pencil class="size-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    class="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    @click="
                                                        openDeleteDepartmentDialog(
                                                            department,
                                                        )
                                                    "
                                                >
                                                    <Trash2 class="size-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        <Dialog
            :open="isDepartmentDialogOpen"
            @update:open="handleDepartmentDialogOpenChange"
        >
            <DialogContent class="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{{ departmentDialogTitle }}</DialogTitle>
                    <DialogDescription>
                        {{ departmentDialogDescription }}
                    </DialogDescription>
                </DialogHeader>

                <div class="grid gap-4 py-2 sm:grid-cols-2">
                    <div class="grid gap-2">
                        <Label for="department-name">Name</Label>
                        <Input
                            id="department-name"
                            v-model="departmentForm.name"
                            type="text"
                            placeholder="Human Resources"
                            :aria-invalid="Boolean(departmentFormErrors.name)"
                        />
                        <p
                            v-if="departmentFormErrors.name"
                            class="text-sm text-destructive"
                        >
                            {{ departmentFormErrors.name }}
                        </p>
                    </div>

                    <div class="grid gap-2">
                        <Label for="department-supervisor">Supervisor</Label>
                        <Input
                            id="department-supervisor"
                            v-model="departmentForm.supervisor"
                            type="text"
                            placeholder="Maricel S. Villanueva"
                            :aria-invalid="
                                Boolean(departmentFormErrors.supervisor)
                            "
                        />
                        <p
                            v-if="departmentFormErrors.supervisor"
                            class="text-sm text-destructive"
                        >
                            {{ departmentFormErrors.supervisor }}
                        </p>
                    </div>

                    <div class="grid gap-2 sm:col-span-2">
                        <Label for="department-work-location"
                            >Work location</Label
                        >
                        <Input
                            id="department-work-location"
                            v-model="departmentForm.workLocation"
                            type="text"
                            placeholder="HR Service Center, 4F Main Building"
                            :aria-invalid="
                                Boolean(departmentFormErrors.workLocation)
                            "
                        />
                        <p
                            v-if="departmentFormErrors.workLocation"
                            class="text-sm text-destructive"
                        >
                            {{ departmentFormErrors.workLocation }}
                        </p>
                    </div>

                    <div class="grid gap-2 sm:col-span-2">
                        <Label for="department-positions">Positions</Label>
                        <Input
                            id="department-positions"
                            v-model="departmentForm.positions"
                            type="text"
                            placeholder="HR Officer II, Recruitment Analyst, Administrative Aide VI"
                            :aria-invalid="
                                Boolean(departmentFormErrors.positions)
                            "
                        />
                        <p class="text-xs text-muted-foreground">
                            Separate multiple positions with commas.
                        </p>
                        <p
                            v-if="departmentFormErrors.positions"
                            class="text-sm text-destructive"
                        >
                            {{ departmentFormErrors.positions }}
                        </p>
                    </div>
                </div>

                <DialogFooter class="gap-2 sm:justify-between">
                    <p class="text-sm text-muted-foreground">
                        Static CRUD only. Refreshing the page resets the demo
                        data.
                    </p>
                    <div class="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            class="rounded-full"
                            @click="handleDepartmentDialogOpenChange(false)"
                        >
                            Cancel
                        </Button>
                        <Button class="rounded-full" @click="saveDepartment">
                            {{ departmentDialogActionLabel }}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog
            :open="isDeleteDialogOpen"
            @update:open="handleDeleteDialogOpenChange"
        >
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete department</DialogTitle>
                    <DialogDescription>
                        Remove this static department row from the current page
                        state only.
                    </DialogDescription>
                </DialogHeader>

                <div
                    v-if="departmentPendingDeletion"
                    class="rounded-2xl border bg-muted/20 p-4"
                >
                    <p class="font-medium text-foreground">
                        {{ departmentPendingDeletion.name }}
                    </p>
                    <p class="mt-1 text-sm text-muted-foreground">
                        {{ departmentPendingDeletion.supervisor }}
                    </p>
                    <p class="mt-3 text-sm text-muted-foreground">
                        {{ departmentPendingDeletion.positions.length }}
                        listed positions at
                        {{ departmentPendingDeletion.workLocation }}
                    </p>
                </div>

                <DialogFooter class="gap-2 sm:justify-between">
                    <p class="text-sm text-muted-foreground">
                        This change is not persisted to the backend.
                    </p>
                    <div class="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            class="rounded-full"
                            @click="handleDeleteDialogOpenChange(false)"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            class="rounded-full"
                            @click="deleteDepartment"
                        >
                            Delete department
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
