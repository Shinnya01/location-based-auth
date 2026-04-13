/**
 * Timekeeping feature types
 */

/**
 * Filter state for attendance records
 */
export interface AttendanceFilters {
    dateFrom: string;
    dateTo: string;
    selectedDepartmentId: string;
    selectedEmployeeId: string;
}

/**
 * Log focus and filtering state
 */
export interface LogsFilterState {
    focusedLogsEmployeeId: string | null;
    effectiveLogsEmployeeId: string | null;
}

/**
 * Document dialog state with form data
 */
export interface DocumentDialogState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    editingDocumentId: string | null;
}

/**
 * Document form data structure
 */
export interface DocumentFormData {
    type: string;
    title: string;
    fileName: string | null;
    remarks: string;
    category: string;
}

/**
 * DTR (Daily Time Record) printable row
 */
export interface DtrPrintableRow {
    date: string;
    amIn: string;
    amOut: string;
    pmIn: string;
    pmOut: string;
    totalHours: string;
    remarks: string;
}
