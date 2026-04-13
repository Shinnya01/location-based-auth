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
import { payrollRecords, payrollDetails } from '@/lib/hrisData';
import { payroll } from '@/routes';
import type { PayrollStatus } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Payroll',
                href: payroll(),
            },
        ],
    },
});

const selectedPayrollId = ref<string | null>(null);
const selectedStatusFilter = ref<PayrollStatus | 'All'>('All');
const isPayrollDetailsOpen = ref(false);

const filteredPayroll = computed(() => {
    return payrollRecords.filter(
        (record) =>
            selectedStatusFilter.value === 'All' ||
            record.status === selectedStatusFilter.value
    );
});

const selectedPayroll = computed(() => {
    if (!selectedPayrollId.value) {
return null;
}

    return payrollDetails.find((p) => p.id === selectedPayrollId.value) || null;
});

const payrollSummary = computed(() => {
    const filtered = filteredPayroll.value;

    return {
        totalRecords: filtered.length,
        draftCount: filtered.filter((r) => r.status === 'Draft').length,
        finalizedCount: filtered.filter((r) => r.status === 'Finalized').length,
        paidCount: filtered.filter((r) => r.status === 'Paid').length,
        totalNetPay: filtered.reduce((sum, r) => sum + r.netPay, 0),
    };
});

const openPayrollDetails = (id: string) => {
    selectedPayrollId.value = id;
    isPayrollDetailsOpen.value = true;
};

const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
        case 'Draft':
            return 'bg-amber-100 text-amber-900';
        case 'Finalized':
            return 'bg-blue-100 text-blue-900';
        case 'Paid':
            return 'bg-emerald-100 text-emerald-900';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};
</script>

<template>
    <Head title="Payroll" />

    <div class="space-y-6 p-6">
        <!-- Header -->
        <div>
            <h2 class="text-3xl font-bold tracking-tight">Payroll</h2>
            <p class="text-muted-foreground">
                Manage payroll records and pay disbursement
            </p>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 md:grid-cols-5">
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Total Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">
                        {{ payrollSummary.totalRecords }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">Draft</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-amber-600">
                        {{ payrollSummary.draftCount }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Finalized
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-blue-600">
                        {{ payrollSummary.finalizedCount }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-emerald-600">
                        {{ payrollSummary.paidCount }}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm font-medium">
                        Total Net Pay
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-lg font-bold">
                        {{ formatCurrency(payrollSummary.totalNetPay) }}
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Status Filters -->
        <div class="flex flex-wrap gap-2">
            <Button
                v-for="status in ['All', 'Draft', 'Finalized', 'Paid']"
                :key="status"
                :variant="selectedStatusFilter === status ? 'default' : 'outline'"
                @click="selectedStatusFilter = status as PayrollStatus | 'All'"
                class="rounded-full"
            >
                {{ status }}
            </Button>
        </div>

        <!-- Payroll Table -->
        <Card>
            <CardHeader>
                <CardTitle>Payroll Records</CardTitle>
                <CardDescription>
                    {{
                        filteredPayroll.length
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
                                <TableHead>Code</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead class="text-right">
                                    Net Pay
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead class="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="record in filteredPayroll"
                                :key="record.id"
                            >
                                <TableCell class="font-medium">
                                    {{ record.employeeName }}
                                </TableCell>
                                <TableCell>{{ record.employeeCode }}</TableCell>
                                <TableCell>
                                    {{
                                        formatDisplayDate(record.periodStart)
                                    }}
                                    –
                                    {{
                                        formatDisplayDate(record.periodEnd)
                                    }}
                                </TableCell>
                                <TableCell class="text-right font-semibold">
                                    {{ formatCurrency(record.netPay) }}
                                </TableCell>
                                <TableCell>
                                    <Badge :class="getStatusColor(record.status)">
                                        {{ record.status }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-center">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        @click="openPayrollDetails(record.id)"
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

    <!-- Payroll Details Sheet -->
    <Sheet v-model:open="isPayrollDetailsOpen">
        <SheetContent class="w-full max-w-2xl sm:w-2/3">
            <SheetHeader>
                <SheetTitle>Payroll Details</SheetTitle>
                <SheetDescription>
                    Detailed payroll breakdown and payment information
                </SheetDescription>
            </SheetHeader>

            <div v-if="selectedPayroll" class="mt-8 space-y-6">
                <!-- Employee Info -->
                <div class="space-y-3 border-b pb-6">
                    <h3 class="font-semibold">Employee Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-muted-foreground">Name</p>
                            <p class="font-medium">
                                {{ selectedPayroll.employeeName }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Code</p>
                            <p class="font-medium">
                                {{ selectedPayroll.employeeCode }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Position</p>
                            <p class="font-medium">
                                {{ selectedPayroll.position }}
                            </p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Department</p>
                            <p class="font-medium">
                                {{ selectedPayroll.departmentName }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Pay Summary -->
                <div class="space-y-3 border-b pb-6">
                    <h3 class="font-semibold">Pay Summary</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <p class="text-muted-foreground">Basic Pay</p>
                            <p class="font-medium">
                                {{ formatCurrency(selectedPayroll.basicPay) }}
                            </p>
                        </div>
                        <div class="flex justify-between">
                            <p class="text-muted-foreground">Overtime Pay</p>
                            <p class="font-medium">
                                {{
                                    formatCurrency(selectedPayroll.overtimePay)
                                }}
                            </p>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <p class="text-muted-foreground">
                                Gross Income
                            </p>
                            <p class="font-semibold">
                                {{
                                    formatCurrency(
                                        selectedPayroll.basicPay +
                                            selectedPayroll.overtimePay
                                    )
                                }}
                            </p>
                        </div>
                        <div class="flex justify-between">
                            <p class="text-muted-foreground">Deductions</p>
                            <p class="font-medium text-red-600">
                                ({{ formatCurrency(selectedPayroll.deductions) }})
                            </p>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <p class="font-semibold">Net Pay</p>
                            <p class="text-lg font-bold">
                                {{ formatCurrency(selectedPayroll.netPay) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Status -->
                <div class="space-y-3">
                    <h3 class="font-semibold">Status</h3>
                    <div class="flex items-center gap-4">
                        <Badge :class="getStatusColor(selectedPayroll.status)">
                            {{ selectedPayroll.status }}
                        </Badge>
                        <p class="text-sm text-muted-foreground">
                            Processed on
                            {{ formatDisplayDate(selectedPayroll.processedAt) }}
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
</template>
