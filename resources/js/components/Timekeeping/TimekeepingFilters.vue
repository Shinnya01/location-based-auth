<script setup lang="ts">
import { CalendarRange, CircleAlert } from 'lucide-vue-next';
import type { Department } from '@/types';
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

interface Props {
    dateFrom: string;
    dateTo: string;
    selectedDepartmentId: string;
    selectedEmployeeId: string;
    hasInvalidDateRange: boolean;
    departments: Department[];
    availableEmployees: Array<{
        id: string;
        name: string;
        departmentId: string;
    }>;
}

defineProps<Props>();

const emit = defineEmits<{
    'update:dateFrom': [value: string];
    'update:dateTo': [value: string];
    'update:selectedDepartmentId': [value: string];
    'update:selectedEmployeeId': [value: string];
}>();
</script>

<template>
    <section
        class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-4 shadow-xs md:p-5"
    >
        <div class="flex flex-col gap-5">
            <div
                class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between"
            >
                <div class="space-y-1">
                    <h1 class="text-xl font-semibold tracking-tight">
                        Timekeeping
                    </h1>
                    <p class="max-w-3xl text-sm text-muted-foreground">
                        Monitor attendance, review raw logs, and open
                        employee 201 files from a single static HRIS
                        workspace.
                    </p>
                </div>
            </div>

            <div>
                <Card
                    class="gap-4 rounded-2xl border-border/80 py-4 shadow-none"
                >
                    <CardHeader class="gap-2 px-5">
                        <CardTitle class="text-base">Filters</CardTitle>
                        <CardDescription>
                            Narrow the daily view by date, department, or
                            employee.
                        </CardDescription>
                    </CardHeader>
                    <CardContent
                        class="grid gap-3 px-5 md:grid-cols-2 xl:grid-cols-4"
                    >
                        <div class="grid gap-2">
                            <Label for="date-from">Date from</Label>
                            <div class="relative">
                                <CalendarRange
                                    class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="date-from"
                                    :value="dateFrom"
                                    @input="
                                        emit('update:dateFrom', $event.target.value)
                                    "
                                    type="date"
                                    class="pl-9"
                                />
                            </div>
                        </div>

                        <div class="grid gap-2">
                            <Label for="date-to">Date to</Label>
                            <div class="relative">
                                <CalendarRange
                                    class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="date-to"
                                    :value="dateTo"
                                    @input="
                                        emit('update:dateTo', $event.target.value)
                                    "
                                    type="date"
                                    class="pl-9"
                                />
                            </div>
                        </div>

                        <div class="grid gap-2">
                            <Label>Department</Label>
                            <Select
                                :model-value="selectedDepartmentId"
                                @update:model-value="
                                    emit('update:selectedDepartmentId', $event)
                                "
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue
                                        placeholder="All departments"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all"
                                        >All departments</SelectItem
                                    >
                                    <SelectItem
                                        v-for="department in departments"
                                        :key="department.id"
                                        :value="department.id"
                                    >
                                        {{ department.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="grid gap-2">
                            <Label>Employee</Label>
                            <Select
                                :model-value="selectedEmployeeId"
                                @update:model-value="
                                    emit('update:selectedEmployeeId', $event)
                                "
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="All employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all"
                                        >All employees</SelectItem
                                    >
                                    <SelectItem
                                        v-for="employee in availableEmployees"
                                        :key="employee.id"
                                        :value="employee.id"
                                    >
                                        {{ employee.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div
                v-if="hasInvalidDateRange"
                class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
            >
                <CircleAlert class="mt-0.5 size-4 shrink-0" />
                <p>
                    The selected end date is earlier than the start date.
                    Update the range to restore the tables.
                </p>
            </div>
        </div>
    </section>
</template>
