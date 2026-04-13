<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Printer, Upload } from 'lucide-vue-next';
import { Printer as PrinterIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import AttendanceTab from '@/components/Timekeeping/AttendanceTab.vue';
import DocumentDialog from '@/components/Timekeeping/DocumentDialog.vue';
import DocumentPreviewDialog from '@/components/Timekeeping/DocumentPreviewDialog.vue';
import EmployeeSheet from '@/components/Timekeeping/EmployeeSheet.vue';
import LogsTab from '@/components/Timekeeping/LogsTab.vue';
import ShiftsTab from '@/components/Timekeeping/ShiftsTab.vue';
import TimekeepingFilters from '@/components/Timekeeping/TimekeepingFilters.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendanceFilter } from '@/composables/useAttendanceFilter';
import { useDocumentManagement } from '@/composables/useDocumentManagement';
import { useDtrPrintable } from '@/composables/useDtrPrintable';
import { useLogsFilter } from '@/composables/useLogsFilter';
import { formatDisplayDate, formatTimeOnly } from '@/lib/formatters';
import {
    createEmployeeProfiles,
    departments,
    documentTypeOptions,
    employees,
    shifts,
} from '@/lib/hrisData';
import { TEXTAREA_STYLES } from '@/lib/uiClasses';
import { timekeeping } from '@/routes';
import type { DocumentCategory, EmployeeRecordProfile } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Timekeeping',
                href: timekeeping(),
            },
        ],
    },
});


const textareaClass =
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

// Initialize composables
const {
    dateFrom,
    dateTo,
    selectedDepartmentId,
    selectedEmployeeId,
    availableEmployees,
    hasInvalidDateRange,
    filteredAttendance,
} = useAttendanceFilter();

const {
    focusedLogsEmployeeId,
    filteredRawLogs,
    focusedLogsEmployee,
    employeeLookup,
    clearLogFocus,
} = useLogsFilter();

const {
    isDocumentDialogOpen,
    documentDialogMode,
    editingDocumentId,
    documentForm,
    documentFileInput,
    isDocumentViewOpen,
    previewDocumentId,
    documentDialogTitle,
    canSubmitDocument,
    openAddDocumentDialog,
    openEditDocumentDialog,
    openDocumentPreview,
    triggerFileInput,
    handleFileSelection,
    persistDocument,
} = useDocumentManagement();

// Helper function for status labels
function attendanceStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// DTR printable composable depends on formatters
const {
    isDtrPreviewOpen,
    dtrPrintableRows,
    dtrShiftLabel,
    dtrCoverageLabel,
    dtrPrintHelperText,
    canPrintDtr,
    openDtrPreview,
    printDtrPreview,
} = useDtrPrintable(
    dateFrom,
    dateTo,
    formatDisplayDate,
    formatTimeOnly,
    attendanceStatusLabel,
);

// Local page state
const activeTab = ref<'attendance' | 'logs' | 'shifts'>('attendance');
const expandedAttendanceId = ref<string | null>(null);
const isEmployeeSheetOpen = ref<boolean>(false);
const activeEmployeeId = ref<string | null>(null);
const selectedDocumentCategory = ref<DocumentCategory>('Personal');
const employeeProfiles = ref<EmployeeRecordProfile[]>(createEmployeeProfiles());

// Computed properties for employee lookups
const selectedEmployee = computed(() =>
    activeEmployeeId.value
        ? (employeeLookup.value.get(activeEmployeeId.value) ?? null)
        : null,
);

const selectedEmployeeProfile = computed(() =>
    activeEmployeeId.value
        ? (employeeProfiles.value.find(
              (profile) => profile.employeeId === activeEmployeeId.value,
          ) ?? null)
        : null,
);

const selectedCategoryDocuments = computed(() => {
    if (!selectedEmployeeProfile.value) {
        return [];
    }

    return selectedEmployeeProfile.value.documents.filter(
        (document) => document.category === selectedDocumentCategory.value,
    );
});

const previewDocument = computed(
    () =>
        selectedEmployeeProfile.value?.documents.find(
            (document) => document.id === previewDocumentId.value,
        ) ?? null,
);

// Event handlers
function toggleExpandedRecord(recordId: string): void {
    expandedAttendanceId.value =
        expandedAttendanceId.value === recordId ? null : recordId;
}

function showEmployeeLogs(record: any): void {
    focusedLogsEmployeeId.value = record.employeeId;
    activeTab.value = 'logs';
}

function openEmployeeSheet(employeeId: string): void {
    activeEmployeeId.value = employeeId;
    selectedDocumentCategory.value = 'Personal';
    isEmployeeSheetOpen.value = true;
}

function handlePersistDocument(action: 'save' | 'submit'): void {
    persistDocument(action, selectedEmployeeProfile.value, selectedDocumentCategory.value);
    selectedDocumentCategory.value = documentForm.value.category;
}
</script>

<template>
    <Head title="Timekeeping" />

    <div class="flex flex-1 flex-col gap-5 p-4 md:p-5">
        <!-- Filters Section -->
        <TimekeepingFilters
            :date-from="dateFrom"
            :date-to="dateTo"
            :selected-department-id="selectedDepartmentId"
            :selected-employee-id="selectedEmployeeId"
            :has-invalid-date-range="hasInvalidDateRange"
            :departments="departments"
            :available-employees="availableEmployees"
            @update:date-from="dateFrom = $event"
            @update:date-to="dateTo = $event"
            @update:selected-department-id="selectedDepartmentId = $event"
            @update:selected-employee-id="selectedEmployeeId = $event"
        />

        <!-- Main Tabs -->
        <Tabs v-model="activeTab" class="flex flex-1 flex-col">
            <TabsList class="w-full justify-start gap-1 rounded-2xl p-1.5">
                <TabsTrigger value="attendance" class="gap-2 px-4">
                    Attendance
                </TabsTrigger>
                <TabsTrigger value="logs" class="gap-2 px-4">Logs</TabsTrigger>
                <TabsTrigger value="shifts" class="gap-2 px-4">
                    Shifts
                </TabsTrigger>
            </TabsList>

            <!-- Attendance Tab -->
            <TabsContent value="attendance" class="mt-5">
                <AttendanceTab
                    :filtered-attendance="filteredAttendance"
                    :expanded-attendance-id="expandedAttendanceId"
                    :employee-lookup="employeeLookup"
                    @toggle-record="toggleExpandedRecord"
                    @show-logs="showEmployeeLogs"
                    @open-employee-sheet="openEmployeeSheet"
                />
            </TabsContent>

            <!-- Logs Tab -->
            <TabsContent value="logs" class="mt-5">
                <LogsTab
                    :filtered-raw-logs="filteredRawLogs"
                    :focused-logs-employee="focusedLogsEmployee"
                    :focused-logs-employee-id="focusedLogsEmployeeId"
                    :employee-lookup="employeeLookup"
                    :can-print-dtr="canPrintDtr"
                    :dtr-print-helper-text="dtrPrintHelperText"
                    @clear-log-focus="clearLogFocus"
                    @focus-logs-employee="focusedLogsEmployeeId = $event"
                    @open-dtr-preview="openDtrPreview"
                    @open-employee-sheet="openEmployeeSheet"
                />
            </TabsContent>

            <!-- Shifts Tab -->
            <TabsContent value="shifts" class="mt-5">
                <ShiftsTab :shifts="shifts" />
            </TabsContent>
        </Tabs>

        <!-- Employee Sheet -->
        <EmployeeSheet
            :is-open="isEmployeeSheetOpen"
            :selected-employee="selectedEmployee"
            :selected-employee-profile="selectedEmployeeProfile"
            :selected-employee-attendance="selectedEmployeeProfile?.attendanceHistory[0]"
            :selected-document-category="selectedDocumentCategory"
            :selected-category-documents="selectedCategoryDocuments"
            :preview-document="previewDocument"
            :is-document-view-open="isDocumentViewOpen"
            :document-type-options="documentTypeOptions"
            @update:is-open="isEmployeeSheetOpen = $event"
            @update:selected-document-category="selectedDocumentCategory = $event"
            @open-document-dialog="openAddDocumentDialog"
            @open-edit-document-dialog="openEditDocumentDialog"
            @open-document-preview="openDocumentPreview"
        />

        <!-- DTR Preview Dialog -->
        <Dialog :open="isDtrPreviewOpen" @update:open="isDtrPreviewOpen = $event">
            <DialogContent class="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Daily Time Record</DialogTitle>
                    <DialogDescription>
                        Static DTR preview derived from the current Raw Logs
                        filters and employee focus.
                    </DialogDescription>
                </DialogHeader>

                <div
                    v-if="focusedLogsEmployee && dtrPrintableRows.length > 0"
                    class="space-y-5"
                >
                    <div
                        class="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
                    >
                        <div class="rounded-3xl border bg-muted/20 p-5">
                            <p
                                class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                Employee
                            </p>
                            <div class="mt-3 space-y-2">
                                <p
                                    class="text-xl font-semibold text-foreground"
                                >
                                    {{ focusedLogsEmployee.name }}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    {{ focusedLogsEmployee.employeeCode }} ·
                                    {{ focusedLogsEmployee.position }} ·
                                    {{ focusedLogsEmployee.departmentName }}
                                </p>
                            </div>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div class="rounded-3xl border bg-muted/20 p-5">
                                <p
                                    class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Coverage
                                </p>
                                <p
                                    class="mt-3 text-sm font-medium text-foreground"
                                >
                                    {{ dtrCoverageLabel }}
                                </p>
                            </div>

                            <div class="rounded-3xl border bg-muted/20 p-5">
                                <p
                                    class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Shift
                                </p>
                                <p
                                    class="mt-3 text-sm font-medium text-foreground"
                                >
                                    {{ dtrShiftLabel }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="max-h-[52vh] overflow-y-auto rounded-3xl border"
                    >
                        <table class="min-w-full text-sm">
                            <thead
                                class="bg-muted/35 text-left text-xs tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                <tr>
                                    <th class="px-5 py-4">Date</th>
                                    <th class="px-5 py-4">AM In</th>
                                    <th class="px-5 py-4">AM Out</th>
                                    <th class="px-5 py-4">PM In</th>
                                    <th class="px-5 py-4">PM Out</th>
                                    <th class="px-5 py-4">Total Hours</th>
                                    <th class="px-5 py-4">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="row in dtrPrintableRows"
                                    :key="row.date"
                                    class="border-b hover:bg-muted/20"
                                >
                                    <td
                                        class="px-5 py-4 font-medium text-foreground"
                                    >
                                        {{ formatDisplayDate(row.date) }}
                                    </td>
                                    <td class="px-5 py-4">{{ row.amIn }}</td>
                                    <td class="px-5 py-4">{{ row.amOut }}</td>
                                    <td class="px-5 py-4">{{ row.pmIn }}</td>
                                    <td class="px-5 py-4">{{ row.pmOut }}</td>
                                    <td class="px-5 py-4">
                                        {{ row.totalHours }}
                                    </td>
                                    <td class="px-5 py-4">{{ row.remarks }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div
                        class="rounded-2xl border border-dashed bg-muted/10 px-4 py-3 text-sm text-muted-foreground"
                    >
                        Printing opens a browser print view using only this
                        static DTR layout, not the full dashboard.
                    </div>
                </div>

                <DialogFooter class="gap-2 sm:justify-between">
                    <p class="text-xs text-muted-foreground">
                        {{ dtrPrintHelperText }}
                    </p>

                    <div class="flex flex-wrap justify-end gap-2">
                        <Button
                            variant="ghost"
                            @click="isDtrPreviewOpen = false"
                        >
                            Close
                        </Button>
                        <Button
                            :disabled="!canPrintDtr"
                            @click="printDtrPreview"
                        >
                            <Printer class="size-4" />
                            Print
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Document Dialog -->
        <DocumentDialog
            :is-open="isDocumentDialogOpen"
            :dialog-title="documentDialogTitle"
            :can-submit="canSubmitDocument"
            :document-form="documentForm"
            :document-type-options="documentTypeOptions"
            :file-input="documentFileInput"
            @update:is-open="isDocumentDialogOpen = $event"
            @trigger-file-input="triggerFileInput"
            @handle-file-selection="handleFileSelection"
            @persist="persistDocument"
        />

        <!-- Document Preview Dialog -->
        <DocumentPreviewDialog
            :is-open="isDocumentViewOpen"
            :document="previewDocument"
            @update:is-open="isDocumentViewOpen = $event"
        />
    </div>
</template>
