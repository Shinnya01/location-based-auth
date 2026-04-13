<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Eye, Search, SearchX } from 'lucide-vue-next';
import { computed, ref } from 'vue';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { employeeDirectoryRecords } from '@/lib/hrisData';
import { employees } from '@/routes';
import type { EmployeeDirectoryRecord, EmployeeDirectoryStatus } from '@/types';
type StatusFilter = 'all' | EmployeeDirectoryStatus;

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Employees',
                href: employees(),
            },
        ],
    },
});

const searchTerm = ref<string>('');
const selectedStatus = ref<StatusFilter>('all');
const selectedEmployeeNumber = ref<string | null>(null);
const isEmployeePreviewOpen = ref<boolean>(false);

const filteredEmployeeDirectoryRecords = computed<EmployeeDirectoryRecord[]>(
    () => {
        const normalizedSearchTerm = searchTerm.value.trim().toLowerCase();

        return employeeDirectoryRecords.filter((record) => {
            if (
                selectedStatus.value !== 'all' &&
                record.status !== selectedStatus.value
            ) {
                return false;
            }

            if (normalizedSearchTerm === '') {
                return true;
            }

            return [
                record.employee_no,
                record.department_employee_id,
                record.first_name,
                record.middle_name,
                record.last_name,
                `${record.first_name} ${record.middle_name} ${record.last_name}`,
                `${record.first_name} ${record.last_name}`,
                record.position,
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearchTerm);
        });
    },
);

const selectedEmployeeRecord = computed<EmployeeDirectoryRecord | null>(() =>
    selectedEmployeeNumber.value
        ? (employeeDirectoryRecords.find(
              (record) => record.employee_no === selectedEmployeeNumber.value,
          ) ?? null)
        : null,
);

function employeeStatusClass(status: EmployeeDirectoryStatus): string {
    if (status === 'Active') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'On Leave') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function employeeFullName(record: EmployeeDirectoryRecord): string {
    return `${record.first_name} ${record.middle_name} ${record.last_name}`;
}

function openEmployeePreview(employeeNumber: string): void {
    selectedEmployeeNumber.value = employeeNumber;
    isEmployeePreviewOpen.value = true;
}
</script>

<template>
    <Head title="Employees" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section
            class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6"
        >
            <div class="flex flex-col gap-6">
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
                >
                    <Heading
                        title="Employees"
                        description="Review a static employee master list from a single HRIS workspace, using schema-style columns that mirror the provided data table."
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
                            >{{ filteredEmployeeDirectoryRecords.length }} rows
                            in view</span
                        >
                    </div>
                </div>

                <Card >
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by employee_no, employee name, or position,
                            then narrow the table by status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent
                        class="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_240px]"
                    >
                        <div class="grid gap-2">
                            <Label for="employee-search">Search</Label>
                            <div class="relative">
                                <Search
                                    class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="employee-search"
                                    v-model="searchTerm"
                                    type="text"
                                    placeholder="Search employee_no, name, or position"
                                    class="pl-9"
                                />
                            </div>
                        </div>

                        <div class="grid gap-2">
                            <Label>Status</Label>
                            <Select v-model="selectedStatus">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all"
                                        >All status</SelectItem
                                    >
                                    <SelectItem value="Active"
                                        >Active</SelectItem
                                    >
                                    <SelectItem value="On Leave"
                                        >On Leave</SelectItem
                                    >
                                    <SelectItem value="Inactive"
                                        >Inactive</SelectItem
                                    >
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card class="rounded-[1.75rem] shadow-xs">
                    <CardHeader
                        class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                        <div>
                            <CardTitle>Employee table</CardTitle>
                            <CardDescription>
                                Static employee registry shaped after the
                                provided schema table.
                            </CardDescription>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {{ filteredEmployeeDirectoryRecords.length }} static
                            rows
                        </p>
                    </CardHeader>

                    <CardContent class="p-0">
                        <div
                            v-if="filteredEmployeeDirectoryRecords.length === 0"
                            class="flex flex-col items-center gap-3 px-6 py-16 text-center"
                        >
                            <div
                                class="rounded-full border bg-muted p-4 text-muted-foreground"
                            >
                                <SearchX class="size-6" />
                            </div>
                            <div class="space-y-1">
                                <p class="font-medium text-foreground">
                                    No employee rows found
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    Adjust the current filters to reveal the
                                    static demo entries again.
                                </p>
                            </div>
                        </div>

                        <div v-else class="overflow-x-auto">

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead class="font-mono">Employee No.</TableHead>
                                        <TableHead class="font-mono">Department Employee ID</TableHead>
                                        <TableHead class="font-mono">First Name</TableHead>
                                        <TableHead class="font-mono">Last Name</TableHead>
                                        <TableHead class="font-mono">Middle Name</TableHead>
                                        <TableHead class="font-mono">Position</TableHead>
                                        <TableHead class="font-mono">Hire Date</TableHead>
                                        <TableHead class="font-mono">Status</TableHead>
                                        <TableHead class="text-right font-mono">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="employeeRecord in filteredEmployeeDirectoryRecords"
                                        :key="employeeRecord.employee_no"
                                        class="border-b hover:bg-muted/20">
                                        <TableCell>{{ employeeRecord.employee_no }}</TableCell>
                                        <TableCell>{{ employeeRecord.department_employee_id }}</TableCell>
                                        <TableCell>{{ employeeRecord.first_name }}</TableCell>
                                        <TableCell>{{ employeeRecord.last_name }}</TableCell>
                                        <TableCell>{{ employeeRecord.middle_name }}</TableCell>
                                        <TableCell>{{ employeeRecord.position }}</TableCell>
                                        <TableCell>{{ employeeRecord.hire_date }}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                class="rounded-full"
                                                :class="
                                                    employeeStatusClass(
                                                        employeeRecord.status,
                                                    )
                                                "
                                            >
                                                {{ employeeRecord.status }}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div class="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    class="rounded-full"
                                                    @click="
                                                        openEmployeePreview(
                                                            employeeRecord.employee_no,
                                                        )
                                                    "
                                                >
                                                    <Eye class="size-4" />
                                                    Show
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                          
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        <Sheet
            :open="isEmployeePreviewOpen"
            @update:open="isEmployeePreviewOpen = $event"
        >
            <SheetContent
                side="right"
                class="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[92vw] lg:max-w-xl"
            >
                <div v-if="selectedEmployeeRecord" class="flex h-full flex-col">
                    <SheetHeader class="border-b px-6 pt-6 pb-5 text-left">
                        <SheetTitle>
                            {{ employeeFullName(selectedEmployeeRecord) }}
                        </SheetTitle>
                        <SheetDescription>
                            Static employee preview from the Employees module.
                        </SheetDescription>
                    </SheetHeader>

                    <div class="space-y-4 px-6 py-6">
                        <Card class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>Employee summary</CardTitle>
                                <CardDescription>
                                    Client-only preview of the selected employee
                                    directory row.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            employee_no
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.employee_no
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            department_employee_id
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.department_employee_id
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            first_name
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.first_name
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            last_name
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.last_name
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            middle_name
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.middle_name
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            position
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.position
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            hire_date
                                        </p>
                                        <p
                                            class="mt-3 font-medium text-foreground"
                                        >
                                            {{
                                                selectedEmployeeRecord.hire_date
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <p
                                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                        >
                                            status
                                        </p>
                                        <div class="mt-3">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full"
                                                :class="
                                                    employeeStatusClass(
                                                        selectedEmployeeRecord.status,
                                                    )
                                                "
                                            >
                                                {{
                                                    selectedEmployeeRecord.status
                                                }}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
</template>
