import { computed, ref, watch } from 'vue';
import { rawLogs, employees } from '@/lib/hrisData';
import type { RawLogEntry } from '@/types';
import { useAttendanceFilter } from './useAttendanceFilter';

export function useLogsFilter() {
    const { selectedDepartmentId, isDateWithinRange } = useAttendanceFilter();

    const focusedLogsEmployeeId = ref<string | null>(null);

    const employeeLookup = computed<Map<string, (typeof employees)[number]>>(
        () => new Map(employees.map((employee) => [employee.id, employee])),
    );

    // Reset focused employee when department changes
    watch(selectedDepartmentId, () => {
        if (!focusedLogsEmployeeId.value) {
            return;
        }

        const focusedEmployee = employeeLookup.value.get(
            focusedLogsEmployeeId.value,
        );

        if (
            selectedDepartmentId.value !== 'all' &&
            focusedEmployee?.departmentId !== selectedDepartmentId.value
        ) {
            focusedLogsEmployeeId.value = null;
        }
    });

    const effectiveLogsEmployeeId = computed<string | null>(() => {
        return focusedLogsEmployeeId.value;
    });

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

    const focusedLogsEmployee = computed(() =>
        effectiveLogsEmployeeId.value
            ? (employeeLookup.value.get(effectiveLogsEmployeeId.value) ?? null)
            : null,
    );

    function clearLogFocus(): void {
        focusedLogsEmployeeId.value = null;
    }

    return {
        focusedLogsEmployeeId,
        effectiveLogsEmployeeId,
        filteredRawLogs,
        focusedLogsEmployee,
        employeeLookup,
        clearLogFocus,
    };
}
