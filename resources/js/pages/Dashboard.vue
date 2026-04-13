<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    Building2,
    Clock3,
    FileArchive,
    FileText,
    FolderOpen,
    Printer,
    Users,
} from 'lucide-vue-next';
import { computed } from 'vue';
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
    applicantRecords,
    attendanceRecords,
    departmentRecords,
    documentRegistryEntries,
    employeeDirectoryRecords,
    employeeRecordFiles,
    printableForms,
} from '@/lib/hrisData';
import {
    dashboard,
    departments,
    employees,
    recordKeeping,
    timekeeping,
} from '@/routes';
import { forms as recordKeepingForms } from '@/routes/record-keeping';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: dashboard(),
            },
        ],
    },
});

const employeeSummary = computed(() => ({
    total: employeeDirectoryRecords.length,
    active: employeeDirectoryRecords.filter(
        (record) => record.status === 'Active',
    ).length,
    onLeave: employeeDirectoryRecords.filter(
        (record) => record.status === 'On Leave',
    ).length,
    inactive: employeeDirectoryRecords.filter(
        (record) => record.status === 'Inactive',
    ).length,
}));

const departmentSummary = computed(() => ({
    total: departmentRecords.length,
    supervisors: new Set(departmentRecords.map((record) => record.supervisor))
        .size,
    workLocations: new Set(
        departmentRecords.map((record) => record.workLocation),
    ).size,
    positions: departmentRecords.reduce(
        (count, record) => count + record.positions.length,
        0,
    ),
}));

const timekeepingSummary = computed(() => ({
    total: attendanceRecords.length,
    present: attendanceRecords.filter((record) => record.status === 'present')
        .length,
    late: attendanceRecords.filter((record) => record.status === 'late').length,
    absent: attendanceRecords.filter((record) => record.status === 'absent')
        .length,
}));

const recordKeepingSummary = computed(() => ({
    applicants: applicantRecords.length,
    employeeFiles: employeeRecordFiles.length,
    registryEntries: documentRegistryEntries.length,
}));

const printableFormSummary = computed(() => ({
    total: printableForms.length,
    recruitment: printableForms.filter(
        (form) => form.category === 'Recruitment',
    ).length,
    recordsOffice: printableForms.filter(
        (form) => form.category === 'Administrative',
    ).length,
}));
</script>

<template>
    <Head title="Dashboard" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section
            class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6"
        >
            <div
                class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
            >
                <div class="space-y-1">
                    <h1 class="text-xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p class="max-w-3xl text-sm text-muted-foreground">
                        Centralize the summaries here so the module pages can
                        stay focused on filters, tables, and actions.
                    </p>
                </div>

                <div
                    class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                >
                    <Badge
                        variant="outline"
                        class="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                        Static HRIS overview
                    </Badge>
                    <span>5 workspaces summarized</span>
                </div>
            </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card class="rounded-[1.75rem] shadow-xs">
                <CardHeader
                    class="flex flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-5"
                >
                    <div>
                        <CardTitle>Employees</CardTitle>
                        <CardDescription>
                            Static employee directory snapshot.
                        </CardDescription>
                    </div>
                    <div
                        class="rounded-full border border-blue-200/70 bg-blue-50 p-2.5 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                        <Users class="size-5" />
                    </div>
                </CardHeader>
                <CardContent class="space-y-4 p-5">
                    <div class="grid gap-3 sm:grid-cols-2">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Total
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ employeeSummary.total }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Active
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ employeeSummary.active }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                On Leave
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ employeeSummary.onLeave }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Inactive
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ employeeSummary.inactive }}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" class="rounded-full" as-child>
                        <Link :href="employees()">Open Employees</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card class="rounded-[1.75rem] shadow-xs">
                <CardHeader
                    class="flex flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-5"
                >
                    <div>
                        <CardTitle>Department</CardTitle>
                        <CardDescription>
                            Static organization structure snapshot.
                        </CardDescription>
                    </div>
                    <div
                        class="rounded-2xl border border-amber-200/70 bg-amber-50 p-2.5 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                        <Building2 class="size-5" />
                    </div>
                </CardHeader>
                <CardContent class="space-y-4 p-5">
                    <div class="grid gap-3 sm:grid-cols-2">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Departments
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ departmentSummary.total }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Supervisors
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ departmentSummary.supervisors }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Work Locations
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ departmentSummary.workLocations }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Positions
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ departmentSummary.positions }}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" class="rounded-full" as-child>
                        <Link :href="departments()">Open Department</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card class="rounded-[1.75rem] shadow-xs">
                <CardHeader
                    class="flex flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-5"
                >
                    <div>
                        <CardTitle>Timekeeping</CardTitle>
                        <CardDescription>
                            Daily attendance snapshot from the static demo logs.
                        </CardDescription>
                    </div>
                    <div
                        class="rounded-2xl border border-emerald-200/70 bg-emerald-50 p-2.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                        <Clock3 class="size-5" />
                    </div>
                </CardHeader>
                <CardContent class="space-y-4 p-5">
                    <div class="grid gap-3 sm:grid-cols-2">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Attendance Rows
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ timekeepingSummary.total }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Present
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ timekeepingSummary.present }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Late
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ timekeepingSummary.late }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Absent
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ timekeepingSummary.absent }}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" class="rounded-full" as-child>
                        <Link :href="timekeeping()">Open Timekeeping</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card class="rounded-[1.75rem] shadow-xs">
                <CardHeader
                    class="flex flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-5"
                >
                    <div>
                        <CardTitle>Record Keeping</CardTitle>
                        <CardDescription>
                            Folder, jacket, and registry summary in one view.
                        </CardDescription>
                    </div>
                    <div
                        class="rounded-2xl border border-violet-200/70 bg-violet-50 p-2.5 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
                    >
                        <FileArchive class="size-5" />
                    </div>
                </CardHeader>
                <CardContent class="space-y-4 p-5">
                    <div class="grid gap-3 sm:grid-cols-3">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Applicants
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ recordKeepingSummary.applicants }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                201 Files
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ recordKeepingSummary.employeeFiles }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Registry
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ recordKeepingSummary.registryEntries }}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" class="rounded-full" as-child>
                        <Link :href="recordKeeping()">Open Record Keeping</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card class="rounded-[1.75rem] shadow-xs">
                <CardHeader
                    class="flex flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-5"
                >
                    <div>
                        <CardTitle>Printable Forms</CardTitle>
                        <CardDescription>
                            Blank template counts moved off the page and into
                            the dashboard.
                        </CardDescription>
                    </div>
                    <div
                        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-2.5 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                    >
                        <Printer class="size-5" />
                    </div>
                </CardHeader>
                <CardContent class="space-y-4 p-5">
                    <div class="grid gap-3 sm:grid-cols-3">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Total
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ printableFormSummary.total }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Recruitment
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ printableFormSummary.recruitment }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs text-muted-foreground uppercase">
                                Administrative
                            </p>
                            <p class="mt-2 text-2xl font-semibold">
                                {{ printableFormSummary.recordsOffice }}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" class="rounded-full" as-child>
                        <Link :href="recordKeepingForms()">
                            Open Printable Forms
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card
                class="rounded-[1.75rem] border-dashed shadow-xs lg:col-span-2 xl:col-span-1"
            >
                <CardHeader class="border-b bg-muted/20 pb-5">
                    <CardTitle>Workspace Note</CardTitle>
                    <CardDescription>
                        Each module page now stays focused on operations instead
                        of repeating overview cards.
                    </CardDescription>
                </CardHeader>
                <CardContent
                    class="space-y-3 p-5 text-sm text-muted-foreground"
                >
                    <div
                        class="flex items-start gap-3 rounded-2xl border bg-muted/20 p-4"
                    >
                        <FolderOpen
                            class="mt-0.5 size-4 shrink-0 text-foreground"
                        />
                        <p>
                            Filters, tables, dialogs, and previews remain inside
                            their own module pages.
                        </p>
                    </div>
                    <div
                        class="flex items-start gap-3 rounded-2xl border bg-muted/20 p-4"
                    >
                        <FileText
                            class="mt-0.5 size-4 shrink-0 text-foreground"
                        />
                        <p>
                            Summary counts are centralized here so the workspace
                            feels cleaner and less repetitive.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
