<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import {
    Archive,
    BriefcaseBusiness,
    FileArchive,
    FolderOpen,
    Printer,
    ShieldCheck,
    Users,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import Heading from '@/components/Heading.vue';
import {
    applicantRecords,
    archiveEntries,
    documentRegistryEntries,
    employeeRecordFiles,
    printableForms,
} from '@/lib/hrisData';
import { recordKeeping } from '@/routes';
import type {
    ApplicantRecord,
    EmployeeRecordFileSummary,
} from '@/types';
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

type RecordKeepingSection =
    | 'applicants'
    | 'employee-files'
    | 'registry'
    | 'archives';

type RecordPreviewKind = 'applicant' | 'employee';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Record Keeping',
                href: recordKeeping(),
            },
        ],
    },
});

const activeSection = ref<RecordKeepingSection>('applicants');
const previewKind = ref<RecordPreviewKind>('applicant');
const previewRecordId = ref<string | null>(null);
const isPreviewOpen = ref<boolean>(false);

const sectionItems = [
    {
        value: 'applicants',
        label: 'Applicant Records',
        description: 'Folders created before hiring',
        icon: BriefcaseBusiness,
    },
    {
        value: 'employee-files',
        label: 'Employee 201 File',
        description: 'Official personnel jackets after appointment',
        icon: Users,
    },
    {
        value: 'registry',
        label: 'Document Registry',
        description: 'Cross-record filing tracker',
        icon: FolderOpen,
    },
    {
        value: 'archives',
        label: 'Archives',
        description: 'Retained and archived folders',
        icon: Archive,
    },
] as const;

const applicantCount = computed(() => applicantRecords.length);
const employeeFileCount = computed(() => employeeRecordFiles.length);
const registryEntryCount = computed(() => documentRegistryEntries.length);
const printableFormCount = computed(() => printableForms.length);

const selectedApplicant = computed<ApplicantRecord | null>(() =>
    previewKind.value === 'applicant'
        ? applicantRecords.find((record) => record.id === previewRecordId.value) ?? null
        : null,
);

const selectedEmployeeFile = computed<EmployeeRecordFileSummary | null>(() =>
    previewKind.value === 'employee'
        ? employeeRecordFiles.find((record) => record.employeeId === previewRecordId.value) ?? null
        : null,
);

function openApplicantPreview(applicantId: string): void {
    previewKind.value = 'applicant';
    previewRecordId.value = applicantId;
    isPreviewOpen.value = true;
}

function openEmployeeFilePreview(employeeId: string): void {
    previewKind.value = 'employee';
    previewRecordId.value = employeeId;
    isPreviewOpen.value = true;
}

function applicantStatusClass(status: ApplicantRecord['status']): string {
    if (status === 'Active') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'For Pooling') {
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    }

    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
}

function filingStatusClass(status: EmployeeRecordFileSummary['filingStatus']): string {
    if (status === 'Complete') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'For Update') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
}

function documentStatusClass(status: string): string {
    if (status === 'Done') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'Draft') {
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function formatDisplayDate(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`));
}
</script>

<template>
    <Head title="Record Keeping" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6">
            <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <Heading
                        title="Record Keeping"
                        description="Manage applicant folders, employee 201 files, and registry tracking while keeping printable forms on their own dedicated static page."
                    />

                    <Badge
                        variant="outline"
                        class="w-fit rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                        Static records workspace
                    </Badge>
                </div>

                <div class="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                    <div class="flex items-start gap-3">
                        <div class="rounded-2xl border border-emerald-200 bg-white/80 p-2.5 text-emerald-700 dark:border-emerald-900 dark:bg-background/60 dark:text-emerald-300">
                            <ShieldCheck class="size-5" />
                        </div>
                        <div class="space-y-1">
                            <p class="font-medium text-foreground">
                                Recruitment records start as applicants, not employees
                            </p>
                            <p class="text-sm text-muted-foreground">
                                In this mockup, documents can be filed under an applicant folder first. A person only moves into the employee 201 file after appointment or hiring.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card class="rounded-2xl border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-white shadow-none dark:border-emerald-900/70 dark:from-emerald-950/40 dark:via-background dark:to-background">
                        <CardContent class="flex items-start justify-between gap-3 p-5">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">
                                    Applicant folders
                                </p>
                                <p class="mt-3 text-3xl font-semibold tracking-tight">
                                    {{ applicantCount }}
                                </p>
                            </div>
                            <div class="rounded-2xl border border-emerald-200/70 bg-white/80 p-2.5 text-emerald-700 shadow-xs dark:border-emerald-900 dark:bg-background/60 dark:text-emerald-300">
                                <BriefcaseBusiness class="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card class="rounded-2xl border-blue-200/80 bg-linear-to-br from-blue-50 via-white to-white shadow-none dark:border-blue-900/70 dark:from-blue-950/40 dark:via-background dark:to-background">
                        <CardContent class="flex items-start justify-between gap-3 p-5">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">
                                    Active 201 files
                                </p>
                                <p class="mt-3 text-3xl font-semibold tracking-tight">
                                    {{ employeeFileCount }}
                                </p>
                            </div>
                            <div class="rounded-2xl border border-blue-200/70 bg-white/80 p-2.5 text-blue-700 shadow-xs dark:border-blue-900 dark:bg-background/60 dark:text-blue-300">
                                <FileArchive class="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card class="rounded-2xl border-amber-200/80 bg-linear-to-br from-amber-50 via-white to-white shadow-none dark:border-amber-900/70 dark:from-amber-950/40 dark:via-background dark:to-background">
                        <CardContent class="flex items-start justify-between gap-3 p-5">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">
                                    Registry entries
                                </p>
                                <p class="mt-3 text-3xl font-semibold tracking-tight">
                                    {{ registryEntryCount }}
                                </p>
                            </div>
                            <div class="rounded-2xl border border-amber-200/70 bg-white/80 p-2.5 text-amber-700 shadow-xs dark:border-amber-900 dark:bg-background/60 dark:text-amber-300">
                                <FolderOpen class="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card class="rounded-2xl border-slate-200/80 bg-linear-to-br from-slate-50 via-white to-white shadow-none dark:border-slate-800 dark:from-slate-950/40 dark:via-background dark:to-background">
                        <CardContent class="flex items-start justify-between gap-3 p-5">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">
                                    Printable forms
                                </p>
                                <p class="mt-3 text-3xl font-semibold tracking-tight">
                                    {{ printableFormCount }}
                                </p>
                            </div>
                            <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-2.5 text-slate-700 shadow-xs dark:border-slate-800 dark:bg-background/60 dark:text-slate-200">
                                <Printer class="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <div class="grid flex-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside class="xl:sticky xl:top-4 xl:self-start">
                <Card class="rounded-[1.75rem] shadow-xs">
                    <CardHeader>
                        <CardTitle class="text-base">Module sections</CardTitle>
                        <CardDescription>
                            Switch between record areas without depending on the Employees module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <button
                            v-for="section in sectionItems"
                            :key="section.value"
                            type="button"
                            class="flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors"
                            :class="
                                activeSection === section.value
                                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
                                    : 'border-transparent bg-muted/20 text-foreground hover:border-border hover:bg-muted/40'
                            "
                            @click="activeSection = section.value"
                        >
                            <component :is="section.icon" class="mt-0.5 size-4 shrink-0" />
                            <div class="space-y-1">
                                <p class="text-sm font-medium">{{ section.label }}</p>
                                <p class="text-xs text-muted-foreground">
                                    {{ section.description }}
                                </p>
                            </div>
                        </button>
                    </CardContent>
                </Card>
            </aside>

            <div class="space-y-6">
                <section v-if="activeSection === 'applicants'" class="space-y-4">
                    <Card class="rounded-[1.75rem] shadow-xs">
                        <CardHeader class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>Applicant Records</CardTitle>
                                <CardDescription>
                                    Recruitment folders can be created first, even before a person becomes an employee.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                No employee account required
                            </Badge>
                        </CardHeader>
                        <CardContent class="p-0">
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <tr>
                                            <th class="px-6 py-4">Applicant</th>
                                            <th class="px-6 py-4">Position applied</th>
                                            <th class="px-6 py-4">Stage</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4">Docs</th>
                                            <th class="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="applicant in applicantRecords"
                                            :key="applicant.id"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td class="px-6 py-4">
                                                <div class="space-y-1">
                                                    <p class="font-medium text-foreground">{{ applicant.name }}</p>
                                                    <p class="text-xs text-muted-foreground">
                                                        {{ applicant.applicantCode }} · {{ applicant.departmentName }}
                                                    </p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">{{ applicant.positionApplied }}</td>
                                            <td class="px-6 py-4">
                                                <Badge variant="outline" class="rounded-full border-border bg-background">
                                                    {{ applicant.stage }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                    :class="applicantStatusClass(applicant.status)"
                                                >
                                                    {{ applicant.status }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">{{ applicant.documentProgress }}</td>
                                            <td class="px-6 py-4">
                                                <div class="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click="openApplicantPreview(applicant.id)"
                                                    >
                                                        View folder
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section v-else-if="activeSection === 'employee-files'" class="space-y-4">
                    <Card class="rounded-[1.75rem] shadow-xs">
                        <CardHeader class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>Employee 201 File</CardTitle>
                                <CardDescription>
                                    Official personnel records created only after hiring, appointment, or onboarding.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" class="rounded-full border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                Post-hiring only
                            </Badge>
                        </CardHeader>
                        <CardContent class="p-0">
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <tr>
                                            <th class="px-6 py-4">Employee</th>
                                            <th class="px-6 py-4">Position</th>
                                            <th class="px-6 py-4">Filing status</th>
                                            <th class="px-6 py-4">Document counts</th>
                                            <th class="px-6 py-4">Updated</th>
                                            <th class="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="employeeFile in employeeRecordFiles.slice(0, 12)"
                                            :key="employeeFile.employeeId"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td class="px-6 py-4">
                                                <div class="space-y-1">
                                                    <p class="font-medium text-foreground">{{ employeeFile.employeeName }}</p>
                                                    <p class="text-xs text-muted-foreground">
                                                        {{ employeeFile.employeeCode }} · {{ employeeFile.departmentName }}
                                                    </p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">{{ employeeFile.position }}</td>
                                            <td class="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                    :class="filingStatusClass(employeeFile.filingStatus)"
                                                >
                                                    {{ employeeFile.filingStatus }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">
                                                {{ employeeFile.documentCounts.done }} done ·
                                                {{ employeeFile.documentCounts.draft }} draft ·
                                                {{ employeeFile.documentCounts.missing }} missing
                                            </td>
                                            <td class="px-6 py-4">{{ formatDisplayDate(employeeFile.lastUpdated) }}</td>
                                            <td class="px-6 py-4">
                                                <div class="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click="openEmployeeFilePreview(employeeFile.employeeId)"
                                                    >
                                                        Open file
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section v-else-if="activeSection === 'registry'" class="space-y-4">
                    <Card class="rounded-[1.75rem] shadow-xs">
                        <CardHeader class="border-b bg-muted/20 pb-5">
                            <CardTitle>Document Registry</CardTitle>
                            <CardDescription>
                                Central filing view across applicant folders and employee 201 jackets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="p-0">
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <tr>
                                            <th class="px-6 py-4">Owner</th>
                                            <th class="px-6 py-4">Type</th>
                                            <th class="px-6 py-4">Document</th>
                                            <th class="px-6 py-4">Category</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4">Storage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="entry in documentRegistryEntries"
                                            :key="entry.id"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td class="px-6 py-4">
                                                <div class="space-y-1">
                                                    <p class="font-medium text-foreground">{{ entry.ownerName }}</p>
                                                    <p class="text-xs text-muted-foreground">{{ entry.ownerCode }}</p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <Badge variant="outline" class="rounded-full border-border bg-background">
                                                    {{ entry.ownerType }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">{{ entry.documentName }}</td>
                                            <td class="px-6 py-4">{{ entry.category }}</td>
                                            <td class="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                    :class="documentStatusClass(entry.status)"
                                                >
                                                    {{ entry.status }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">{{ entry.storageTag }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section v-else class="space-y-4">
                    <Card class="rounded-[1.75rem] shadow-xs">
                        <CardHeader class="border-b bg-muted/20 pb-5">
                            <CardTitle>Archives</CardTitle>
                            <CardDescription>
                                Archived record folders and retained forms with storage references.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="p-0">
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <tr>
                                            <th class="px-6 py-4">Title</th>
                                            <th class="px-6 py-4">Type</th>
                                            <th class="px-6 py-4">Archived</th>
                                            <th class="px-6 py-4">Retention</th>
                                            <th class="px-6 py-4">Storage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="entry in archiveEntries"
                                            :key="entry.id"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td class="px-6 py-4 font-medium text-foreground">{{ entry.title }}</td>
                                            <td class="px-6 py-4">{{ entry.recordType }}</td>
                                            <td class="px-6 py-4">{{ formatDisplayDate(entry.archivedAt) }}</td>
                                            <td class="px-6 py-4">{{ entry.retention }}</td>
                                            <td class="px-6 py-4">{{ entry.storageLocation }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>

        <Sheet :open="isPreviewOpen" @update:open="isPreviewOpen = $event">
            <SheetContent
                side="right"
                class="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[92vw] lg:max-w-xl"
            >
                <div class="flex h-full flex-col" v-if="selectedApplicant || selectedEmployeeFile">
                    <SheetHeader class="border-b px-6 pt-6 pb-5 text-left">
                        <SheetTitle>
                            {{ selectedApplicant?.name ?? selectedEmployeeFile?.employeeName }}
                        </SheetTitle>
                        <SheetDescription>
                            {{
                                selectedApplicant
                                    ? 'Applicant folder preview'
                                    : 'Employee 201 file preview'
                            }}
                        </SheetDescription>
                    </SheetHeader>

                    <div class="space-y-4 px-6 py-6">
                        <Card v-if="selectedApplicant" class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>Applicant record summary</CardTitle>
                                <CardDescription>
                                    Recruitment documents may exist here before any employee profile is created.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Applicant code
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedApplicant.applicantCode }}
                                        </p>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Position applied
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedApplicant.positionApplied }}
                                        </p>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Stage
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedApplicant.stage }}
                                        </p>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Document progress
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedApplicant.documentProgress }}
                                        </p>
                                    </div>
                                </div>
                                <div class="rounded-2xl border bg-blue-50/70 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
                                    Once this applicant is hired or appointed, the folder can be promoted into an employee 201 file without requiring a login account during recruitment.
                                </div>
                            </CardContent>
                        </Card>

                        <Card v-if="selectedEmployeeFile" class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>Employee file summary</CardTitle>
                                <CardDescription>
                                    Official employee record kept independently from timekeeping and recruitment views.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Employee code
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedEmployeeFile.employeeCode }}
                                        </p>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Filing status
                                        </p>
                                        <div class="mt-3">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full"
                                                :class="filingStatusClass(selectedEmployeeFile.filingStatus)"
                                            >
                                                {{ selectedEmployeeFile.filingStatus }}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Done documents
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedEmployeeFile.documentCounts.done }}
                                        </p>
                                    </div>
                                    <div class="rounded-2xl border bg-muted/20 p-4">
                                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Pending updates
                                        </p>
                                        <p class="mt-3 font-medium text-foreground">
                                            {{ selectedEmployeeFile.documentCounts.draft + selectedEmployeeFile.documentCounts.missing }}
                                        </p>
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
