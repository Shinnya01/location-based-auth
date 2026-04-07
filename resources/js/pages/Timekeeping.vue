<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import {
    Building2,
    CalendarRange,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    CircleX,
    Clock3,
    Eye,
    FileText,
    Fingerprint,
    FolderOpen,
    History,
    IdCard,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Printer,
    SearchX,
    ShieldCheck,
    Upload,
    User,
    Users,
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import Heading from '@/components/Heading.vue';
import { getInitials } from '@/composables/useInitials';
import {
    attendanceRecords,
    createEmployeeProfiles,
    demoDateRange,
    departments,
    documentCategories,
    documentTypeOptions,
    employees,
    rawLogs,
    shifts,
} from '@/lib/hrisData';
import { cn } from '@/lib/utils';
import { timekeeping } from '@/routes';
import type {
    AttendanceRecord,
    AttendanceStatus,
    DocumentCategory,
    DocumentStatus,
    DocumentType,
    EmployeeDocument,
    EmployeeRecordProfile,
    LogMethod,
    RawLogEntry,
    RawLogStatus,
} from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

type PageTab = 'attendance' | 'logs' | 'shifts';
type EmployeeSheetTab = 'profile' | 'attendance' | 'file';
type DocumentDialogMode = 'add' | 'edit';
type DocumentAction = 'save' | 'submit';

type DocumentFormState = {
    category: DocumentCategory;
    type: DocumentType;
    title: string;
    remarks: string;
    fileName: string;
};

type DtrPrintableRow = {
    date: string;
    amIn: string;
    amOut: string;
    pmIn: string;
    pmOut: string;
    totalHours: string;
    remarks: string;
    shiftName: string;
};

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

const summaryCardStyles = {
    present:
        'border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-white dark:border-emerald-900/70 dark:from-emerald-950/40 dark:via-background dark:to-background',
    late: 'border-amber-200/80 bg-linear-to-br from-amber-50 via-white to-white dark:border-amber-900/70 dark:from-amber-950/40 dark:via-background dark:to-background',
    absent:
        'border-rose-200/80 bg-linear-to-br from-rose-50 via-white to-white dark:border-rose-900/70 dark:from-rose-950/40 dark:via-background dark:to-background',
} as const;

const textareaClass =
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const employeeProfiles = ref<EmployeeRecordProfile[]>(createEmployeeProfiles());

const dateFrom = ref<string>(demoDateRange.from);
const dateTo = ref<string>(demoDateRange.to);
const selectedDepartmentId = ref<string>('all');
const selectedEmployeeId = ref<string>('all');
const activeTab = ref<PageTab>('attendance');
const focusedLogsEmployeeId = ref<string | null>(null);
const expandedAttendanceId = ref<string | null>(null);

const isEmployeeSheetOpen = ref<boolean>(false);
const activeEmployeeId = ref<string | null>(null);
const employeeSheetTab = ref<EmployeeSheetTab>('file');
const selectedDocumentCategory = ref<DocumentCategory>('Personal');

const isDocumentDialogOpen = ref<boolean>(false);
const documentDialogMode = ref<DocumentDialogMode>('add');
const editingDocumentId = ref<string | null>(null);
const documentForm = ref<DocumentFormState>(createEmptyDocumentForm('Personal'));
const documentFileInput = ref<HTMLInputElement | null>(null);

const isDocumentViewOpen = ref<boolean>(false);
const previewDocumentId = ref<string | null>(null);

const isDtrPreviewOpen = ref<boolean>(false);

const employeeLookup = computed<Map<string, (typeof employees)[number]>>(
    () => new Map(employees.map((employee) => [employee.id, employee])),
);

const availableEmployees = computed(() =>
    employees.filter((employee) =>
        selectedDepartmentId.value === 'all'
            ? true
            : employee.departmentId === selectedDepartmentId.value,
    ),
);

watch(selectedDepartmentId, () => {
    if (
        selectedEmployeeId.value !== 'all' &&
        !availableEmployees.value.some(
            (employee) => employee.id === selectedEmployeeId.value,
        )
    ) {
        selectedEmployeeId.value = 'all';
    }

    if (!focusedLogsEmployeeId.value) {
        return;
    }

    const focusedEmployee = employeeLookup.value.get(focusedLogsEmployeeId.value);

    if (
        selectedDepartmentId.value !== 'all' &&
        focusedEmployee?.departmentId !== selectedDepartmentId.value
    ) {
        focusedLogsEmployeeId.value = null;
    }
});

watch(selectedEmployeeId, () => {
    focusedLogsEmployeeId.value = null;
});

const effectiveLogsEmployeeId = computed<string | null>(() => {
    if (focusedLogsEmployeeId.value) {
        return focusedLogsEmployeeId.value;
    }

    return selectedEmployeeId.value === 'all' ? null : selectedEmployeeId.value;
});

const filteredAttendance = computed<AttendanceRecord[]>(() =>
    attendanceRecords.filter((record) => {
        if (!isDateWithinRange(record.date)) {
            return false;
        }

        if (
            selectedDepartmentId.value !== 'all' &&
            record.departmentId !== selectedDepartmentId.value
        ) {
            return false;
        }

        if (
            selectedEmployeeId.value !== 'all' &&
            record.employeeId !== selectedEmployeeId.value
        ) {
            return false;
        }

        return true;
    }),
);

const attendanceSummary = computed(() => ({
    present: filteredAttendance.value.filter((record) => record.status === 'present')
        .length,
    late: filteredAttendance.value.filter((record) => record.status === 'late')
        .length,
    absent: filteredAttendance.value.filter((record) => record.status === 'absent')
        .length,
}));

const filteredRawLogs = computed<RawLogEntry[]>(() =>
    rawLogs.filter((log) => {
        if (!isDateWithinRange(log.timestamp.slice(0, 10))) {
            return false;
        }

        const employee = employeeLookup.value.get(log.employeeId);

        if (
            selectedDepartmentId.value !== 'all' &&
            employee?.departmentId !== selectedDepartmentId.value
        ) {
            return false;
        }

        if (
            effectiveLogsEmployeeId.value &&
            log.employeeId !== effectiveLogsEmployeeId.value
        ) {
            return false;
        }

        return true;
    }),
);

const attendanceRecordLookup = computed<Map<string, AttendanceRecord>>(
    () =>
        new Map(
            attendanceRecords.map((record) => [
                `${record.employeeId}:${record.date}`,
                record,
            ]),
        ),
);

const focusedLogsEmployee = computed(() =>
    effectiveLogsEmployeeId.value
        ? employeeLookup.value.get(effectiveLogsEmployeeId.value) ?? null
        : null,
);

const canPrintDtr = computed(
    () => Boolean(effectiveLogsEmployeeId.value && filteredRawLogs.value.length > 0),
);

const dtrPrintableRows = computed<DtrPrintableRow[]>(() => {
    if (!effectiveLogsEmployeeId.value) {
        return [];
    }

    const groupedLogs = new Map<string, RawLogEntry[]>();

    filteredRawLogs.value
        .filter((log) => log.employeeId === effectiveLogsEmployeeId.value)
        .forEach((log) => {
            const dateKey = log.timestamp.slice(0, 10);
            const existingLogs = groupedLogs.get(dateKey);

            if (existingLogs) {
                existingLogs.push(log);

                return;
            }

            groupedLogs.set(dateKey, [log]);
        });

    return Array.from(groupedLogs.entries())
        .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
        .map(([dateKey, groupedDateLogs]) => {
            const orderedLogs = [...groupedDateLogs].sort((left, right) =>
                left.timestamp.localeCompare(right.timestamp),
            );
            const inTimes = orderedLogs
                .filter((log) => log.type === 'IN')
                .map((log) => formatTimeOnly(log.timestamp));
            const outTimes = orderedLogs
                .filter((log) => log.type === 'OUT')
                .map((log) => formatTimeOnly(log.timestamp));
            const attendanceRecord =
                attendanceRecordLookup.value.get(
                    `${effectiveLogsEmployeeId.value}:${dateKey}`,
                ) ?? null;

            return {
                date: dateKey,
                amIn: inTimes[0] ?? '—',
                amOut: outTimes[0] ?? '—',
                pmIn: inTimes[1] ?? '—',
                pmOut: outTimes[1] ?? '—',
                totalHours: attendanceRecord?.totalHours ?? '—',
                remarks: attendanceRecord
                    ? attendanceStatusLabel(attendanceRecord.status)
                    : Array.from(new Set(orderedLogs.map((log) => log.status))).join(' / '),
                shiftName: attendanceRecord?.shiftName ?? 'No shift assigned',
            };
        });
});

const dtrShiftLabel = computed(() => {
    const shiftsForPrint = Array.from(
        new Set(
            dtrPrintableRows.value
                .map((row) => row.shiftName)
                .filter((shiftName) => shiftName !== 'No shift assigned'),
        ),
    );

    if (shiftsForPrint.length === 0) {
        return 'No shift assigned';
    }

    if (shiftsForPrint.length === 1) {
        return shiftsForPrint[0];
    }

    return 'Multiple shifts';
});

const dtrCoverageLabel = computed(() => {
    if (dateFrom.value && dateTo.value) {
        return `${formatDisplayDate(dateFrom.value)} to ${formatDisplayDate(dateTo.value)}`;
    }

    if (dateFrom.value) {
        return `From ${formatDisplayDate(dateFrom.value)}`;
    }

    if (dateTo.value) {
        return `Up to ${formatDisplayDate(dateTo.value)}`;
    }

    if (dtrPrintableRows.value.length === 1) {
        return formatDisplayDate(dtrPrintableRows.value[0].date);
    }

    if (dtrPrintableRows.value.length > 1) {
        return `${formatDisplayDate(dtrPrintableRows.value[0].date)} to ${formatDisplayDate(dtrPrintableRows.value.at(-1)?.date ?? dtrPrintableRows.value[0].date)}`;
    }

    return 'Current filtered range';
});

const dtrPrintHelperText = computed(() => {
    if (!effectiveLogsEmployeeId.value) {
        return 'Select or focus one employee to print DTR.';
    }

    if (filteredRawLogs.value.length === 0) {
        return 'No raw logs available for the current employee and date range.';
    }

    return `Preview a static Daily Time Record for ${focusedLogsEmployee.value?.name ?? 'the selected employee'}.`;
});

const selectedEmployee = computed(() =>
    activeEmployeeId.value
        ? employeeLookup.value.get(activeEmployeeId.value) ?? null
        : null,
);

const selectedEmployeeProfile = computed(() =>
    activeEmployeeId.value
        ? employeeProfiles.value.find(
              (profile) => profile.employeeId === activeEmployeeId.value,
          ) ?? null
        : null,
);

const selectedEmployeeAttendance = computed(() =>
    activeEmployeeId.value
        ? attendanceRecords.find(
              (record) => record.employeeId === activeEmployeeId.value,
          ) ?? null
        : null,
);

const selectedCategoryDocuments = computed<EmployeeDocument[]>(() => {
    if (!selectedEmployeeProfile.value) {
        return [];
    }

    return selectedEmployeeProfile.value.documents.filter(
        (document) => document.category === selectedDocumentCategory.value,
    );
});

const previewDocument = computed(() =>
    selectedEmployeeProfile.value?.documents.find(
        (document) => document.id === previewDocumentId.value,
    ) ?? null,
);

const hasInvalidDateRange = computed(
    () => dateFrom.value !== '' && dateTo.value !== '' && dateFrom.value > dateTo.value,
);

const documentDialogTitle = computed(() =>
    documentDialogMode.value === 'add' ? 'Add document' : 'Edit document',
);

const canSubmitDocument = computed(
    () => documentForm.value.title.trim().length > 0,
);

function createEmptyDocumentForm(category: DocumentCategory): DocumentFormState {
    return {
        category,
        type: documentTypeOptions[0],
        title: '',
        remarks: '',
        fileName: '',
    };
}

function isDateWithinRange(dateValue: string): boolean {
    if (dateFrom.value !== '' && dateValue < dateFrom.value) {
        return false;
    }

    if (dateTo.value !== '' && dateValue > dateTo.value) {
        return false;
    }

    return true;
}

function toggleExpandedRecord(recordId: string): void {
    expandedAttendanceId.value =
        expandedAttendanceId.value === recordId ? null : recordId;
}

function showEmployeeLogs(record: AttendanceRecord): void {
    focusedLogsEmployeeId.value = record.employeeId;
    activeTab.value = 'logs';
}

function clearLogFocus(): void {
    focusedLogsEmployeeId.value = null;
}

function openDtrPreview(): void {
    if (!canPrintDtr.value) {
        return;
    }

    isDtrPreviewOpen.value = true;
}

function openEmployeeSheet(
    employeeId: string,
    tab: EmployeeSheetTab = 'file',
): void {
    activeEmployeeId.value = employeeId;
    employeeSheetTab.value = tab;
    selectedDocumentCategory.value = 'Personal';
    isEmployeeSheetOpen.value = true;
}

function openAddDocumentDialog(): void {
    documentDialogMode.value = 'add';
    editingDocumentId.value = null;
    documentForm.value = createEmptyDocumentForm(selectedDocumentCategory.value);
    isDocumentDialogOpen.value = true;
}

function openEditDocumentDialog(document: EmployeeDocument): void {
    documentDialogMode.value = 'edit';
    editingDocumentId.value = document.id;
    selectedDocumentCategory.value = document.category;
    documentForm.value = {
        category: document.category,
        type: document.type,
        title: document.title,
        remarks: document.remarks,
        fileName: `${document.type}.pdf`,
    };
    isDocumentDialogOpen.value = true;
}

function openDocumentPreview(document: EmployeeDocument): void {
    previewDocumentId.value = document.id;
    isDocumentViewOpen.value = true;
}

function triggerFileInput(): void {
    documentFileInput.value?.click();
}

function handleFileSelection(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    documentForm.value.fileName = file?.name ?? '';
}

function resolveDocumentStatus(
    currentStatus: DocumentStatus | null,
    action: DocumentAction,
): DocumentStatus {
    if (action === 'submit') {
        return 'Done';
    }

    if (currentStatus === 'Done') {
        return 'Done';
    }

    if (currentStatus === 'Missing' || currentStatus === null) {
        return 'Draft';
    }

    return currentStatus;
}

function persistDocument(action: DocumentAction): void {
    if (!selectedEmployeeProfile.value || !canSubmitDocument.value) {
        return;
    }

    const existingDocument =
        editingDocumentId.value === null
            ? null
            : selectedEmployeeProfile.value.documents.find(
                  (document) => document.id === editingDocumentId.value,
              ) ?? null;

    const nextStatus = resolveDocumentStatus(
        existingDocument?.status ?? null,
        action,
    );

    const nextDocument: EmployeeDocument = {
        id: existingDocument?.id ?? `document-${Date.now()}`,
        employeeId: selectedEmployeeProfile.value.employeeId,
        category: documentForm.value.category,
        type: documentForm.value.type,
        documentName: documentForm.value.type,
        title: documentForm.value.title.trim(),
        status: nextStatus,
        uploadedBy: 'Records Admin, HRIS Demo',
        uploadedAt: demoDateRange.to,
        remarks:
            documentForm.value.remarks.trim() ||
            'Updated from the static HRIS timekeeping demo.',
    };

    if (existingDocument) {
        const targetDocument = selectedEmployeeProfile.value.documents.find(
            (document) => document.id === existingDocument.id,
        );

        if (targetDocument) {
            targetDocument.category = nextDocument.category;
            targetDocument.type = nextDocument.type;
            targetDocument.documentName = nextDocument.documentName;
            targetDocument.title = nextDocument.title;
            targetDocument.status = nextDocument.status;
            targetDocument.uploadedBy = nextDocument.uploadedBy;
            targetDocument.uploadedAt = nextDocument.uploadedAt;
            targetDocument.remarks = nextDocument.remarks;
        }
    } else {
        selectedEmployeeProfile.value.documents.unshift(nextDocument);
    }

    selectedDocumentCategory.value = nextDocument.category;
    isDocumentDialogOpen.value = false;
}

function attendanceStatusLabel(status: AttendanceStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function attendanceStatusClass(status: AttendanceStatus): string {
    if (status === 'present') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'late') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function documentStatusClass(status: DocumentStatus): string {
    if (status === 'Done') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'Draft') {
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function rawLogStatusClass(status: RawLogStatus): string {
    if (status === 'Verified') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'Adjusted') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function methodClass(method: LogMethod): string {
    return method === 'Biometric'
        ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
        : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300';
}

function methodIcon(method: LogMethod) {
    return method === 'Biometric' ? Fingerprint : MapPin;
}

function formatDisplayDate(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`));
}

function formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(timestamp));
}

function formatTimeOnly(timestamp: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(timestamp));
}

function formatPrintedAt(): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date());
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildDtrPrintHtml(): string {
    const employee = focusedLogsEmployee.value;

    if (!employee || dtrPrintableRows.value.length === 0) {
        return '';
    }

    const rowsMarkup = dtrPrintableRows.value
        .map(
            (row) => `
                <tr>
                    <td>${escapeHtml(formatDisplayDate(row.date))}</td>
                    <td>${escapeHtml(row.amIn)}</td>
                    <td>${escapeHtml(row.amOut)}</td>
                    <td>${escapeHtml(row.pmIn)}</td>
                    <td>${escapeHtml(row.pmOut)}</td>
                    <td>${escapeHtml(row.totalHours)}</td>
                    <td>${escapeHtml(row.remarks)}</td>
                </tr>
            `,
        )
        .join('');

    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Daily Time Record - ${escapeHtml(employee.name)}</title>
        <style>
            :root { color-scheme: light; }
            * { box-sizing: border-box; }
            body {
                margin: 0;
                padding: 32px;
                font-family: Arial, Helvetica, sans-serif;
                color: #0f172a;
                background: #ffffff;
            }
            .sheet {
                max-width: 960px;
                margin: 0 auto;
            }
            .header {
                display: flex;
                justify-content: space-between;
                gap: 24px;
                align-items: flex-start;
                margin-bottom: 24px;
            }
            .title {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.02em;
            }
            .subtitle {
                margin: 6px 0 0;
                font-size: 13px;
                color: #475569;
            }
            .meta-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }
            .meta-card {
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                padding: 12px 14px;
            }
            .meta-label {
                margin: 0;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #64748b;
            }
            .meta-value {
                margin: 10px 0 0;
                font-size: 14px;
                font-weight: 600;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #cbd5e1;
                padding: 10px 12px;
                text-align: left;
                font-size: 13px;
            }
            th {
                background: #f8fafc;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #475569;
            }
            .note {
                margin-top: 14px;
                font-size: 12px;
                color: #64748b;
            }
            @media print {
                body {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <main class="sheet">
            <header class="header">
                <div>
                    <h1 class="title">Daily Time Record</h1>
                    <p class="subtitle">Static HRIS printable preview from the Raw Logs tab</p>
                </div>
                <div class="subtitle">Printed ${escapeHtml(formatPrintedAt())}</div>
            </header>

            <section class="meta-grid">
                <article class="meta-card">
                    <p class="meta-label">Employee</p>
                    <p class="meta-value">${escapeHtml(employee.name)}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Employee Code</p>
                    <p class="meta-value">${escapeHtml(employee.employeeCode)}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Department</p>
                    <p class="meta-value">${escapeHtml(employee.departmentName)}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Position</p>
                    <p class="meta-value">${escapeHtml(employee.position)}</p>
                </article>
            </section>

            <section class="meta-grid">
                <article class="meta-card">
                    <p class="meta-label">Coverage</p>
                    <p class="meta-value">${escapeHtml(dtrCoverageLabel.value)}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Shift</p>
                    <p class="meta-value">${escapeHtml(dtrShiftLabel.value)}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Rows</p>
                    <p class="meta-value">${escapeHtml(String(dtrPrintableRows.value.length))}</p>
                </article>
                <article class="meta-card">
                    <p class="meta-label">Source</p>
                    <p class="meta-value">Raw Logs</p>
                </article>
            </section>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>AM In</th>
                        <th>AM Out</th>
                        <th>PM In</th>
                        <th>PM Out</th>
                        <th>Total Hours</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsMarkup}
                </tbody>
            </table>

            <p class="note">This is a static printable DTR preview generated from demo timekeeping data.</p>
        </main>
    </body>
</html>`;
}

function printDtrPreview(): void {
    if (!canPrintDtr.value) {
        return;
    }

    const printWindow = window.open('', 'dtr-print-preview', 'width=1024,height=768');
    const printHtml = buildDtrPrintHtml();

    if (!printWindow || printHtml === '') {
        return;
    }

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function avatarStyle(hue: number) {
    return {
        backgroundColor: `hsl(${hue} 85% 94%)`,
        color: `hsl(${hue} 45% 28%)`,
    };
}
</script>

<template>
    <Head title="Timekeeping" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6">
            <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <Heading
                        title="Timekeeping"
                        description="Monitor attendance, review raw logs, and open employee 201 files from a single static HRIS workspace."
                    />

                    <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge
                            variant="outline"
                            class="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                            Static demo data
                        </Badge>
                        <span>{{ filteredAttendance.length }} attendance rows</span>
                    </div>
                </div>

                <div class="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
                    <Card class="rounded-2xl border-border/80 shadow-none">
                        <CardHeader class="gap-3">
                            <CardTitle class="text-base">Filters</CardTitle>
                            <CardDescription>
                                Narrow the daily view by date, department, or employee.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div class="grid gap-2">
                                <Label for="date-from">Date from</Label>
                                <div class="relative">
                                    <CalendarRange class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="date-from"
                                        v-model="dateFrom"
                                        type="date"
                                        class="pl-9"
                                    />
                                </div>
                            </div>

                            <div class="grid gap-2">
                                <Label for="date-to">Date to</Label>
                                <div class="relative">
                                    <CalendarRange class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="date-to"
                                        v-model="dateTo"
                                        type="date"
                                        class="pl-9"
                                    />
                                </div>
                            </div>

                            <div class="grid gap-2">
                                <Label>Department</Label>
                                <Select v-model="selectedDepartmentId">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="All departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All departments</SelectItem>
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
                                <Select v-model="selectedEmployeeId">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="All employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All employees</SelectItem>
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

                    <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                        <Card
                            class="rounded-2xl shadow-none"
                            :class="summaryCardStyles.present"
                        >
                            <CardContent class="flex items-start justify-between gap-3 p-5">
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">
                                        Present
                                    </p>
                                    <p class="mt-3 text-3xl font-semibold tracking-tight">
                                        {{ attendanceSummary.present }}
                                    </p>
                                </div>
                                <div class="rounded-2xl border border-emerald-200/70 bg-white/80 p-2.5 text-emerald-700 shadow-xs dark:border-emerald-900 dark:bg-background/60 dark:text-emerald-300">
                                    <Users class="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            class="rounded-2xl shadow-none"
                            :class="summaryCardStyles.late"
                        >
                            <CardContent class="flex items-start justify-between gap-3 p-5">
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">
                                        Late
                                    </p>
                                    <p class="mt-3 text-3xl font-semibold tracking-tight">
                                        {{ attendanceSummary.late }}
                                    </p>
                                </div>
                                <div class="rounded-2xl border border-amber-200/70 bg-white/80 p-2.5 text-amber-700 shadow-xs dark:border-amber-900 dark:bg-background/60 dark:text-amber-300">
                                    <Clock3 class="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            class="rounded-2xl shadow-none"
                            :class="summaryCardStyles.absent"
                        >
                            <CardContent class="flex items-start justify-between gap-3 p-5">
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">
                                        Absent
                                    </p>
                                    <p class="mt-3 text-3xl font-semibold tracking-tight">
                                        {{ attendanceSummary.absent }}
                                    </p>
                                </div>
                                <div class="rounded-2xl border border-rose-200/70 bg-white/80 p-2.5 text-rose-700 shadow-xs dark:border-rose-900 dark:bg-background/60 dark:text-rose-300">
                                    <CircleX class="size-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div
                    v-if="hasInvalidDateRange"
                    class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                >
                    <CircleAlert class="mt-0.5 size-4 shrink-0" />
                    <p>The selected end date is earlier than the start date. Update the range to restore the tables.</p>
                </div>
            </div>
        </section>

        <Tabs v-model="activeTab" class="flex flex-1 flex-col">
            <TabsList class="w-full justify-start gap-1 rounded-2xl p-1.5">
                <TabsTrigger value="attendance" class="gap-2 px-4">
                    Attendance
                </TabsTrigger>
                <TabsTrigger value="logs" class="gap-2 px-4">Logs</TabsTrigger>
                <TabsTrigger value="shifts" class="gap-2 px-4">Shifts</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" class="mt-5">
                <Card class="overflow-hidden rounded-[1.75rem] shadow-xs">
                    <CardHeader class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle>Attendance</CardTitle>
                            <CardDescription>
                                Click any row to expand the clock events for that employee.
                            </CardDescription>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {{ filteredAttendance.length }} employees in view
                        </p>
                    </CardHeader>

                    <CardContent class="p-0">
                        <div v-if="filteredAttendance.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-full border bg-muted p-4 text-muted-foreground">
                                <SearchX class="size-6" />
                            </div>
                            <div class="space-y-1">
                                <p class="font-medium text-foreground">No attendance records found</p>
                                <p class="text-sm text-muted-foreground">
                                    Adjust the current filters to reveal the static demo entries again.
                                </p>
                            </div>
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    <tr>
                                        <th class="w-12 px-6 py-4"></th>
                                        <th class="px-6 py-4">Employee name</th>
                                        <th class="px-6 py-4">Time in</th>
                                        <th class="px-6 py-4">Time out</th>
                                        <th class="px-6 py-4">Total hours</th>
                                        <th class="px-6 py-4">Status</th>
                                        <th class="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template
                                        v-for="record in filteredAttendance"
                                        :key="record.id"
                                    >
                                        <tr
                                            class="cursor-pointer border-b transition-colors hover:bg-muted/20"
                                            @click="toggleExpandedRecord(record.id)"
                                        >
                                            <td class="px-6 py-4 align-top">
                                                <div class="flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground">
                                                    <ChevronDown
                                                        v-if="expandedAttendanceId === record.id"
                                                        class="size-4"
                                                    />
                                                    <ChevronRight
                                                        v-else
                                                        class="size-4"
                                                    />
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 align-top">
                                                <div class="flex items-start gap-3">
                                                    <Avatar class="size-10 rounded-xl">
                                                        <AvatarFallback
                                                            class="rounded-xl font-semibold"
                                                            :style="avatarStyle(employeeLookup.get(record.employeeId)?.avatarHue ?? 200)"
                                                        >
                                                            {{ getInitials(record.employeeName) }}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div class="space-y-1">
                                                        <div class="font-medium text-foreground">
                                                            {{ record.employeeName }}
                                                        </div>
                                                        <div class="text-sm text-muted-foreground">
                                                            {{ record.position }}
                                                        </div>
                                                        <div class="text-xs text-muted-foreground">
                                                            {{ record.departmentName }} · {{ record.employeeCode }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 align-top font-medium">
                                                {{ record.timeIn ?? 'No log' }}
                                            </td>
                                            <td class="px-6 py-4 align-top font-medium">
                                                {{ record.timeOut ?? 'No log' }}
                                            </td>
                                            <td class="px-6 py-4 align-top">
                                                {{ record.totalHours }}
                                            </td>
                                            <td class="px-6 py-4 align-top">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                    :class="attendanceStatusClass(record.status)"
                                                >
                                                    {{ attendanceStatusLabel(record.status) }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4 align-top">
                                                <div class="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click.stop="openEmployeeSheet(record.employeeId)"
                                                    >
                                                        <Eye class="size-4" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click.stop="showEmployeeLogs(record)"
                                                    >
                                                        <History class="size-4" />
                                                        Logs
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr
                                            v-if="expandedAttendanceId === record.id"
                                            class="border-b bg-muted/20"
                                        >
                                            <td colspan="7" class="px-6 py-5">
                                                <div class="rounded-2xl border bg-background p-4">
                                                    <div class="mb-4 flex items-center justify-between gap-4">
                                                        <div>
                                                            <p class="text-sm font-medium text-foreground">
                                                                Detailed logs
                                                            </p>
                                                            <p class="text-sm text-muted-foreground">
                                                                {{ formatDisplayDate(record.date) }} · {{ record.shiftName }}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            class="rounded-full"
                                                            :class="attendanceStatusClass(record.status)"
                                                        >
                                                            {{ attendanceStatusLabel(record.status) }}
                                                        </Badge>
                                                    </div>

                                                    <div
                                                        v-if="record.logs.length === 0"
                                                        class="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground"
                                                    >
                                                        No clock events were recorded for this employee on the selected date.
                                                    </div>

                                                    <div
                                                        v-else
                                                        class="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                                                    >
                                                        <div
                                                            v-for="log in record.logs"
                                                            :key="log.id"
                                                            class="rounded-2xl border bg-muted/20 px-4 py-4"
                                                        >
                                                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                                {{ log.type }}
                                                            </p>
                                                            <p class="mt-3 text-xl font-semibold text-foreground">
                                                                {{ log.time }}
                                                            </p>
                                                            <div class="mt-3 flex flex-wrap items-center gap-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    class="rounded-full"
                                                                    :class="methodClass(log.method)"
                                                                >
                                                                    <component
                                                                        :is="methodIcon(log.method)"
                                                                        class="size-3.5"
                                                                    />
                                                                    {{ log.method }}
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    class="rounded-full"
                                                                    :class="rawLogStatusClass(log.status)"
                                                                >
                                                                    {{ log.status }}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="logs" class="mt-5">
                <Card class="overflow-hidden rounded-[1.75rem] shadow-xs">
                    <CardHeader class="gap-3 border-b bg-muted/20 pb-5">
                        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>Raw logs</CardTitle>
                                <CardDescription>
                                    Biometric and GPS clock events captured for the selected view.
                                </CardDescription>
                            </div>

                            <div class="flex flex-col gap-2 lg:items-end">
                                <div class="flex flex-wrap items-center gap-2">
                                    <div
                                        v-if="focusedLogsEmployee"
                                        class="flex flex-wrap items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm"
                                    >
                                        <span class="text-muted-foreground">
                                            {{ focusedLogsEmployeeId ? 'Focused on' : 'Viewing' }}
                                        </span>
                                        <span class="font-medium text-foreground">
                                            {{ focusedLogsEmployee.name }}
                                        </span>
                                        <Button
                                            v-if="focusedLogsEmployeeId"
                                            variant="ghost"
                                            size="sm"
                                            class="h-7 rounded-full px-2"
                                            @click="clearLogFocus"
                                        >
                                            Clear
                                        </Button>
                                    </div>

                                    <Button
                                        variant="outline"
                                        class="rounded-full"
                                        :disabled="!canPrintDtr"
                                        @click="openDtrPreview"
                                    >
                                        <Printer class="size-4" />
                                        Print DTR
                                    </Button>
                                </div>

                                <p class="text-xs text-muted-foreground">
                                    {{ dtrPrintHelperText }}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent class="p-0">
                        <div v-if="filteredRawLogs.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-full border bg-muted p-4 text-muted-foreground">
                                <SearchX class="size-6" />
                            </div>
                            <div class="space-y-1">
                                <p class="font-medium text-foreground">No raw logs available</p>
                                <p class="text-sm text-muted-foreground">
                                    The current filters do not match any clock events in this demo dataset.
                                </p>
                            </div>
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    <tr>
                                        <th class="px-6 py-4">Employee</th>
                                        <th class="px-6 py-4">Timestamp</th>
                                        <th class="px-6 py-4">Type</th>
                                        <th class="px-6 py-4">Method</th>
                                        <th class="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="log in filteredRawLogs"
                                        :key="log.id"
                                        :class="
                                            cn(
                                                'border-b transition-colors',
                                                effectiveLogsEmployeeId === log.employeeId
                                                    ? 'bg-blue-50/60 dark:bg-blue-950/20'
                                                    : 'hover:bg-muted/20',
                                            )
                                        "
                                    >
                                        <td class="px-6 py-4">
                                            <div class="space-y-1">
                                                <p class="font-medium text-foreground">
                                                    {{ log.employeeName }}
                                                </p>
                                                <p class="text-xs text-muted-foreground">
                                                    {{ log.employeeCode }}
                                                </p>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-muted-foreground">
                                            {{ formatTimestamp(log.timestamp) }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full border-border bg-background"
                                            >
                                                {{ log.type }}
                                            </Badge>
                                        </td>
                                        <td class="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full"
                                                :class="methodClass(log.method)"
                                            >
                                                <component
                                                    :is="methodIcon(log.method)"
                                                    class="size-3.5"
                                                />
                                                {{ log.method }}
                                            </Badge>
                                        </td>
                                        <td class="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full"
                                                :class="rawLogStatusClass(log.status)"
                                            >
                                                {{ log.status }}
                                            </Badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="shifts" class="mt-5">
                <Card class="overflow-hidden rounded-[1.75rem] shadow-xs">
                    <CardHeader class="gap-3 border-b bg-muted/20 pb-5">
                        <CardTitle>Shifts</CardTitle>
                        <CardDescription>
                            Static shift definitions used in the sample HRIS timekeeping module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="p-0">
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    <tr>
                                        <th class="px-6 py-4">Shift name</th>
                                        <th class="px-6 py-4">Time in</th>
                                        <th class="px-6 py-4">Time out</th>
                                        <th class="px-6 py-4">Break duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="shift in shifts"
                                        :key="shift.id"
                                        class="border-b hover:bg-muted/20"
                                    >
                                        <td class="px-6 py-4 font-medium text-foreground">
                                            {{ shift.name }}
                                        </td>
                                        <td class="px-6 py-4">{{ shift.timeIn }}</td>
                                        <td class="px-6 py-4">{{ shift.timeOut }}</td>
                                        <td class="px-6 py-4">{{ shift.breakDuration }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        <Sheet :open="isEmployeeSheetOpen" @update:open="isEmployeeSheetOpen = $event">
            <SheetContent
                side="right"
                class="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[92vw] lg:max-w-4xl"
            >
                <div v-if="selectedEmployee && selectedEmployeeProfile" class="flex h-full flex-col">
                    <SheetHeader class="border-b px-6 pt-6 pb-5 text-left">
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div class="flex items-start gap-4">
                                <Avatar class="size-14 rounded-2xl">
                                    <AvatarFallback
                                        class="rounded-2xl text-base font-semibold"
                                        :style="avatarStyle(selectedEmployee.avatarHue)"
                                    >
                                        {{ getInitials(selectedEmployee.name) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="space-y-2">
                                    <div>
                                        <SheetTitle class="text-2xl">
                                            {{ selectedEmployee.name }}
                                        </SheetTitle>
                                        <SheetDescription class="mt-1 text-sm">
                                            {{ selectedEmployee.position }} ·
                                            {{ selectedEmployee.departmentName }}
                                        </SheetDescription>
                                    </div>

                                    <div class="flex flex-wrap gap-2">
                                        <Badge variant="outline" class="rounded-full border-border bg-background">
                                            <IdCard class="size-3.5" />
                                            {{ selectedEmployee.employeeCode }}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            class="rounded-full"
                                            :class="
                                                selectedEmployee.status === 'On Site'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : selectedEmployee.status === 'Field Duty'
                                                      ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300'
                                                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                                            "
                                        >
                                            {{ selectedEmployee.status }}
                                        </Badge>
                                        <Badge variant="outline" class="rounded-full border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                            <ShieldCheck class="size-3.5" />
                                            {{ selectedEmployee.employmentStatus }}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>

                    <div class="flex-1 px-6 py-6">
                        <Tabs v-model="employeeSheetTab" class="flex h-full flex-col">
                            <TabsList class="w-full justify-start gap-1 rounded-2xl p-1.5">
                                <TabsTrigger value="profile" class="px-4">
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="attendance" class="px-4">
                                    Attendance
                                </TabsTrigger>
                                <TabsTrigger value="file" class="px-4">
                                    201 File
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <div class="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                                    <Card class="rounded-3xl shadow-none">
                                        <CardHeader>
                                            <CardTitle>Personal information</CardTitle>
                                            <CardDescription>
                                                Static employee record details for the selected 201 file.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent class="grid gap-4 sm:grid-cols-2">
                                            <div class="rounded-2xl border bg-muted/20 p-4">
                                                <div class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <User class="size-4 text-muted-foreground" />
                                                    Demographics
                                                </div>
                                                <dl class="space-y-3 text-sm">
                                                    <div>
                                                        <dt class="text-muted-foreground">Birth date</dt>
                                                        <dd class="font-medium text-foreground">{{ formatDisplayDate(selectedEmployeeProfile.birthDate) }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Age</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.age }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Civil status</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.civilStatus }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Nationality</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.nationality }}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            <div class="rounded-2xl border bg-muted/20 p-4">
                                                <div class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <Mail class="size-4 text-muted-foreground" />
                                                    Contact details
                                                </div>
                                                <dl class="space-y-3 text-sm">
                                                    <div>
                                                        <dt class="text-muted-foreground">Email</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.email }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Phone</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.phone }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Address</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.address }}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            <div class="rounded-2xl border bg-muted/20 p-4">
                                                <div class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <Building2 class="size-4 text-muted-foreground" />
                                                    Employment
                                                </div>
                                                <dl class="space-y-3 text-sm">
                                                    <div>
                                                        <dt class="text-muted-foreground">Hire date</dt>
                                                        <dd class="font-medium text-foreground">{{ formatDisplayDate(selectedEmployeeProfile.hireDate) }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Supervisor</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.supervisor }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Work location</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.workLocation }}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            <div class="rounded-2xl border bg-muted/20 p-4">
                                                <div class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <Phone class="size-4 text-muted-foreground" />
                                                    Emergency contact
                                                </div>
                                                <dl class="space-y-3 text-sm">
                                                    <div>
                                                        <dt class="text-muted-foreground">Name</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.emergencyContact }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Mobile</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.emergencyPhone }}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card class="rounded-3xl shadow-none">
                                        <CardHeader>
                                            <CardTitle>Government IDs</CardTitle>
                                            <CardDescription>
                                                Common 201 identifiers shown with realistic dummy values.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent class="space-y-4">
                                            <div class="rounded-2xl border bg-muted/20 p-4">
                                                <div class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <ShieldCheck class="size-4 text-muted-foreground" />
                                                    Registry numbers
                                                </div>
                                                <dl class="space-y-3 text-sm">
                                                    <div>
                                                        <dt class="text-muted-foreground">GSIS</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.gsisNumber }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">PhilHealth</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.philHealthNumber }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">Pag-IBIG</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.pagIbigNumber }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-muted-foreground">TIN</dt>
                                                        <dd class="font-medium text-foreground">{{ selectedEmployeeProfile.tinNumber }}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            <div class="grid gap-3 sm:grid-cols-3">
                                                <div class="rounded-2xl border bg-muted/20 p-4">
                                                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                        Present this month
                                                    </p>
                                                    <p class="mt-3 text-2xl font-semibold text-foreground">
                                                        {{ selectedEmployeeProfile.attendanceSummary.present }}
                                                    </p>
                                                </div>
                                                <div class="rounded-2xl border bg-muted/20 p-4">
                                                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                        Late incidents
                                                    </p>
                                                    <p class="mt-3 text-2xl font-semibold text-foreground">
                                                        {{ selectedEmployeeProfile.attendanceSummary.late }}
                                                    </p>
                                                </div>
                                                <div class="rounded-2xl border bg-muted/20 p-4">
                                                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                        Last clock in
                                                    </p>
                                                    <p class="mt-3 text-2xl font-semibold text-foreground">
                                                        {{ selectedEmployeeProfile.attendanceSummary.lastClockIn }}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent value="attendance">
                                <div class="grid gap-4">
                                    <Card class="rounded-3xl shadow-none">
                                        <CardHeader>
                                            <CardTitle>Recent attendance history</CardTitle>
                                            <CardDescription>
                                                Five-day snapshot linked to this employee record.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent class="overflow-x-auto p-0">
                                            <table class="min-w-full text-sm">
                                                <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                    <tr>
                                                        <th class="px-6 py-4">Date</th>
                                                        <th class="px-6 py-4">Shift</th>
                                                        <th class="px-6 py-4">Time in</th>
                                                        <th class="px-6 py-4">Time out</th>
                                                        <th class="px-6 py-4">Total hours</th>
                                                        <th class="px-6 py-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr
                                                        v-for="history in selectedEmployeeProfile.attendanceHistory"
                                                        :key="history.id"
                                                        class="border-b hover:bg-muted/20"
                                                    >
                                                        <td class="px-6 py-4 font-medium text-foreground">
                                                            {{ formatDisplayDate(history.date) }}
                                                        </td>
                                                        <td class="px-6 py-4">{{ history.shiftName }}</td>
                                                        <td class="px-6 py-4">{{ history.timeIn ?? 'No log' }}</td>
                                                        <td class="px-6 py-4">{{ history.timeOut ?? 'No log' }}</td>
                                                        <td class="px-6 py-4">{{ history.totalHours }}</td>
                                                        <td class="px-6 py-4">
                                                            <Badge
                                                                variant="outline"
                                                                class="rounded-full"
                                                                :class="attendanceStatusClass(history.status)"
                                                            >
                                                                {{ attendanceStatusLabel(history.status) }}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>

                                    <Card class="rounded-3xl shadow-none">
                                        <CardHeader>
                                            <CardTitle>Today’s clock events</CardTitle>
                                            <CardDescription>
                                                Expanded view of the currently selected day.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                v-if="!selectedEmployeeAttendance || selectedEmployeeAttendance.logs.length === 0"
                                                class="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground"
                                            >
                                                No same-day clock events are available for this employee in the demo.
                                            </div>

                                            <div v-else class="grid gap-3 md:grid-cols-2">
                                                <div
                                                    v-for="log in selectedEmployeeAttendance.logs"
                                                    :key="log.id"
                                                    class="rounded-2xl border bg-muted/20 p-4"
                                                >
                                                    <div class="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                                {{ log.type }}
                                                            </p>
                                                            <p class="mt-2 text-xl font-semibold text-foreground">
                                                                {{ log.time }}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            class="rounded-full"
                                                            :class="methodClass(log.method)"
                                                        >
                                                            <component
                                                                :is="methodIcon(log.method)"
                                                                class="size-3.5"
                                                            />
                                                            {{ log.method }}
                                                        </Badge>
                                                    </div>
                                                    <p class="mt-3 text-sm text-muted-foreground">
                                                        {{ formatTimestamp(log.timestamp) }}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="file">
                                <div class="space-y-4">
                                    <Tabs
                                        v-model="selectedDocumentCategory"
                                        class="flex flex-col"
                                    >
                                        <TabsList class="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl p-1.5">
                                            <TabsTrigger
                                                v-for="category in documentCategories"
                                                :key="category"
                                                :value="category"
                                                class="px-4"
                                            >
                                                {{ category }}
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <Card class="rounded-3xl shadow-none">
                                        <CardHeader class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <CardTitle>{{ selectedDocumentCategory }}</CardTitle>
                                                <CardDescription>
                                                    Manage uploaded records for this 201 file category.
                                                </CardDescription>
                                            </div>
                                            <Button class="rounded-full" @click="openAddDocumentDialog">
                                                <Plus class="size-4" />
                                                Add document
                                            </Button>
                                        </CardHeader>
                                        <CardContent class="p-0">
                                            <div
                                                v-if="selectedCategoryDocuments.length === 0"
                                                class="flex flex-col items-center gap-3 px-6 py-14 text-center"
                                            >
                                                <div class="rounded-full border bg-muted p-4 text-muted-foreground">
                                                    <FolderOpen class="size-6" />
                                                </div>
                                                <div class="space-y-1">
                                                    <p class="font-medium text-foreground">No documents in this category yet</p>
                                                    <p class="text-sm text-muted-foreground">
                                                        Add a static sample document to populate this employee’s 201 file view.
                                                    </p>
                                                </div>
                                            </div>

                                            <div v-else class="overflow-x-auto">
                                                <table class="min-w-full text-sm">
                                                    <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                        <tr>
                                                            <th class="px-6 py-4">Document name</th>
                                                            <th class="px-6 py-4">Status</th>
                                                            <th class="px-6 py-4 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr
                                                            v-for="document in selectedCategoryDocuments"
                                                            :key="document.id"
                                                            class="border-b hover:bg-muted/20"
                                                        >
                                                            <td class="px-6 py-4">
                                                                <div class="space-y-1">
                                                                    <p class="font-medium text-foreground">
                                                                        {{ document.title }}
                                                                    </p>
                                                                    <p class="text-xs text-muted-foreground">
                                                                        {{ document.documentName }} · {{ document.type }}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td class="px-6 py-4">
                                                                <Badge
                                                                    variant="outline"
                                                                    class="rounded-full"
                                                                    :class="documentStatusClass(document.status)"
                                                                >
                                                                    {{ document.status }}
                                                                </Badge>
                                                            </td>
                                                            <td class="px-6 py-4">
                                                                <div class="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        class="rounded-full"
                                                                        @click="openDocumentPreview(document)"
                                                                    >
                                                                        <Eye class="size-4" />
                                                                        View
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        class="rounded-full"
                                                                        @click="openEditDocumentDialog(document)"
                                                                    >
                                                                        <Pencil class="size-4" />
                                                                        Edit
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
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SheetContent>
        </Sheet>

        <Dialog :open="isDtrPreviewOpen" @update:open="isDtrPreviewOpen = $event">
            <DialogContent class="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Daily Time Record</DialogTitle>
                    <DialogDescription>
                        Static DTR preview derived from the current Raw Logs filters and employee focus.
                    </DialogDescription>
                </DialogHeader>

                <div v-if="focusedLogsEmployee && dtrPrintableRows.length > 0" class="space-y-5">
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                        <div class="rounded-3xl border bg-muted/20 p-5">
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Employee
                            </p>
                            <div class="mt-3 space-y-2">
                                <p class="text-xl font-semibold text-foreground">
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
                                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Coverage
                                </p>
                                <p class="mt-3 text-sm font-medium text-foreground">
                                    {{ dtrCoverageLabel }}
                                </p>
                            </div>

                            <div class="rounded-3xl border bg-muted/20 p-5">
                                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Shift
                                </p>
                                <p class="mt-3 text-sm font-medium text-foreground">
                                    {{ dtrShiftLabel }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="max-h-[52vh] overflow-y-auto rounded-3xl border">
                        <table class="min-w-full text-sm">
                            <thead class="bg-muted/35 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
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
                                    <td class="px-5 py-4 font-medium text-foreground">
                                        {{ formatDisplayDate(row.date) }}
                                    </td>
                                    <td class="px-5 py-4">{{ row.amIn }}</td>
                                    <td class="px-5 py-4">{{ row.amOut }}</td>
                                    <td class="px-5 py-4">{{ row.pmIn }}</td>
                                    <td class="px-5 py-4">{{ row.pmOut }}</td>
                                    <td class="px-5 py-4">{{ row.totalHours }}</td>
                                    <td class="px-5 py-4">{{ row.remarks }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="rounded-2xl border border-dashed bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                        Printing opens a browser print view using only this static DTR layout, not the full dashboard.
                    </div>
                </div>

                <DialogFooter class="gap-2 sm:justify-between">
                    <p class="text-xs text-muted-foreground">
                        {{ dtrPrintHelperText }}
                    </p>

                    <div class="flex flex-wrap justify-end gap-2">
                        <Button variant="ghost" @click="isDtrPreviewOpen = false">
                            Close
                        </Button>
                        <Button :disabled="!canPrintDtr" @click="printDtrPreview">
                            <Printer class="size-4" />
                            Print
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog :open="isDocumentDialogOpen" @update:open="isDocumentDialogOpen = $event">
            <DialogContent class="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{{ documentDialogTitle }}</DialogTitle>
                    <DialogDescription>
                        Client-only modal for the employee’s 201 file. Changes stay in local page state only.
                    </DialogDescription>
                </DialogHeader>

                <div class="grid gap-4">
                    <div class="grid gap-2">
                        <Label>Document type</Label>
                        <Select v-model="documentForm.type">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a document type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="documentType in documentTypeOptions"
                                    :key="documentType"
                                    :value="documentType"
                                >
                                    {{ documentType }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="grid gap-2">
                        <Label for="document-title">Title</Label>
                        <Input
                            id="document-title"
                            v-model="documentForm.title"
                            placeholder="e.g. Personal Data Sheet 2026"
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label>File upload</Label>
                        <input
                            ref="documentFileInput"
                            type="file"
                            class="hidden"
                            @change="handleFileSelection"
                        />
                        <button
                            type="button"
                            class="flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/20 px-4 py-4 text-left transition-colors hover:bg-muted/35"
                            @click="triggerFileInput"
                        >
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl border bg-background p-2 text-muted-foreground">
                                    <Upload class="size-4" />
                                </div>
                                <div>
                                    <p class="font-medium text-foreground">
                                        {{ documentForm.fileName || 'Choose a file' }}
                                    </p>
                                    <p class="text-sm text-muted-foreground">
                                        UI placeholder only. No real upload will be sent.
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" class="rounded-full">UI only</Badge>
                        </button>
                    </div>

                    <div class="grid gap-2">
                        <Label for="document-remarks">Remarks</Label>
                        <textarea
                            id="document-remarks"
                            v-model="documentForm.remarks"
                            :class="textareaClass"
                            placeholder="Add filing notes, reviewer comments, or document context."
                        />
                    </div>
                </div>

                <DialogFooter class="gap-2 sm:justify-between">
                    <p class="text-sm text-muted-foreground">
                        Save creates a draft. Submit marks the document as done.
                    </p>
                    <div class="flex gap-2">
                        <Button
                            variant="outline"
                            :disabled="!canSubmitDocument"
                            @click="persistDocument('save')"
                        >
                            Save
                        </Button>
                        <Button
                            :disabled="!canSubmitDocument"
                            @click="persistDocument('submit')"
                        >
                            Submit
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog :open="isDocumentViewOpen" @update:open="isDocumentViewOpen = $event">
            <DialogContent class="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Document preview</DialogTitle>
                    <DialogDescription>
                        Static preview details for the selected 201 file entry.
                    </DialogDescription>
                </DialogHeader>

                <div v-if="previewDocument" class="grid gap-4">
                    <div class="flex min-h-56 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
                        <div class="rounded-2xl border bg-background p-3 text-muted-foreground">
                            <FileText class="size-6" />
                        </div>
                        <div class="space-y-1">
                            <p class="font-medium text-foreground">{{ previewDocument.title }}</p>
                            <p class="text-sm text-muted-foreground">
                                File preview placeholder
                            </p>
                        </div>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-3">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Uploaded by
                            </p>
                            <p class="mt-3 font-medium text-foreground">
                                {{ previewDocument.uploadedBy }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Date
                            </p>
                            <p class="mt-3 font-medium text-foreground">
                                {{ formatDisplayDate(previewDocument.uploadedAt) }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Status
                            </p>
                            <div class="mt-3">
                                <Badge
                                    variant="outline"
                                    class="rounded-full"
                                    :class="documentStatusClass(previewDocument.status)"
                                >
                                    {{ previewDocument.status }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
