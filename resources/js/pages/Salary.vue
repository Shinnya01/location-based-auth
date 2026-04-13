<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Eye } from 'lucide-vue-next';
import { computed, ref } from 'vue';
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
import { formatDisplayDate } from '@/lib/formatters';
import { salaryRecords } from '@/lib/hrisData';
import { salary } from '@/routes';
import type { SalaryGrade } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Salary & Compensation',
                href: salary(),
            },
        ],
    },
});

const selectedSalaryId = ref<string | null>(null);
const isSalaryDetailsOpen = ref(false);
const selectedGradeFilter = ref<SalaryGrade | 'All'>('All');

const salaryGrades: (SalaryGrade | 'All')[] = [
    'All',
    'SG-1',
    'SG-2',
    'SG-3',
    'SG-4',
    'SG-5',
    'SG-6',
    'SG-7',
];

const filteredSalary = computed(() => {
    return salaryRecords.filter(
        (record) =>
            selectedGradeFilter.value === 'All' ||
            record.salaryGrade === selectedGradeFilter.value
    );
});

const selectedSalary = computed(() => {
    if (!selectedSalaryId.value) {
return null;
}

    return salaryRecords.find((s) => s.id === selectedSalaryId.value) || null;
});

const salarySummary = computed(() => {
    const filtered = filteredSalary.value;
    const totalMonthly = filtered.reduce((sum, r) => sum + r.monthlySalary, 0);
    const totalAnnual = filtered.reduce((sum, r) => sum + r.annualSalary, 0);

    return {
        totalEmployees: filtered.length,
        monthlyBudget: totalMonthly,
        annualBudget: totalAnnual,
        averageSalary:
            filtered.length > 0
                ? Math.round(totalMonthly / filtered.length)
                : 0,
    };
});

const openSalaryDetails = (id: string) => {
    selectedSalaryId.value = id;
    isSalaryDetailsOpen.value = true;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};
</script>

<template>
    <Head title="Salary & Compensation" />

    <div class="space-y-6 p-6">
        <!-- Header -->
        <div>
            <h2 class="text-3xl font-bold tracking-tight">
                Salary & Compensation
            </h2>
            <p class="text-muted-foreground">
                Manage salary grades and employee compensation
            </p>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Total Employees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">
                        {{ salarySummary.totalEmployees }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Monthly Budget
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-lg font-bold">
                        {{ formatCurrency(salarySummary.monthlyBudget) }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Annual Budget
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-lg font-bold">
                        {{ formatCurrency(salarySummary.annualBudget) }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Average Salary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-lg font-bold">
                        {{ formatCurrency(salarySummary.averageSalary) }}
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Grade Filters -->
        <div class="flex flex-wrap gap-2">
            <Button
                v-for="grade in salaryGrades"
                :key="grade"
                :variant="selectedGradeFilter === grade ? 'default' : 'outline'"
                @click="selectedGradeFilter = grade"
                class="rounded-full"
            >
                {{ grade }}
            </Button>
        </div>

        <!-- Salary Table -->
        <Card>
            <CardHeader>
                <CardTitle>Salary Records</CardTitle>
                <CardDescription>
                    {{
                        filteredSalary.length
                    }}
                    record(s)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead class="text-right">
                                    Monthly Salary
                                </TableHead>
                                <TableHead class="text-right">
                                    Annual Salary
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead class="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="record in filteredSalary"
                                :key="record.id"
                            >
                                <TableCell class="font-medium">
                                    {{ record.employeeName }}
                                </TableCell>
                                <TableCell>{{ record.position }}</TableCell>
                                <TableCell class="font-mono font-semibold">
                                    {{ record.salaryGrade }}
                                </TableCell>
                                <TableCell class="text-right">
                                    {{
                                        formatCurrency(record.monthlySalary)
                                    }}
                                </TableCell>
                                <TableCell class="text-right font-semibold">
                                    {{ formatCurrency(record.annualSalary) }}
                                </TableCell>
                                <TableCell>
                                    <Badge class="bg-emerald-100 text-emerald-900">
                                        {{ record.status }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-center">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        @click="openSalaryDetails(record.id)"
                                    >
                                        <Eye class="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>

    <!-- Salary Details Sheet -->
    <Sheet v-model:open="isSalaryDetailsOpen">
        <SheetContent class="w-full max-w-2xl sm:w-2/3">
            <SheetHeader>
                <SheetTitle>Salary Details</SheetTitle>
                <SheetDescription>
                    Compensation and salary grade information
                </SheetDescription>
            </SheetHeader>

            <div v-if="selectedSalary" class="mt-8 space-y-6">
                <!-- Employee Info -->
                <div class="space-y-3 border-b pb-6">
                    <h3 class="font-semibold">Employee Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-muted-foreground">Name</p>
                            <p class="font-medium">
                                {{ selectedSalary.employeeName }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Code</p>
                            <p class="font-medium">
                                {{ selectedSalary.employeeCode }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Position</p>
                            <p class="font-medium">
                                {{ selectedSalary.position }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Department</p>
                            <p class="font-medium">
                                {{ selectedSalary.departmentName }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Salary Grade Info -->
                <div class="space-y-3 border-b pb-6">
                    <h3 class="font-semibold">Salary Grade Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-muted-foreground">Salary Grade</p>
                            <p class="font-mono font-bold text-lg">
                                {{ selectedSalary.salaryGrade }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Effective Date</p>
                            <p class="font-medium">
                                {{
                                    formatDisplayDate(selectedSalary.effectiveDate)
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Compensation -->
                <div class="space-y-3 border-b pb-6">
                    <h3 class="font-semibold">Compensation</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <p class="text-muted-foreground">Monthly Salary</p>
                            <p class="font-medium">
                                {{ formatCurrency(selectedSalary.monthlySalary) }}
                            </p>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <p class="font-semibold">Annual Salary</p>
                            <p class="text-lg font-bold">
                                {{ formatCurrency(selectedSalary.annualSalary) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Status -->
                <div class="space-y-3">
                    <h3 class="font-semibold">Status</h3>
                    <div class="flex items-center gap-2">
                        <Badge class="bg-emerald-100 text-emerald-900">
                            {{ selectedSalary.status }}
                        </Badge>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
</template>
