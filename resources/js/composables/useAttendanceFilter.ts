import { computed, ref, watch } from 'vue';
import {
    attendanceRecords,
    departments,
    employees,
    demoDateRange,
} from '@/lib/hrisData';
import type { AttendanceRecord } from '@/types';

export function useAttendanceFilter() {
    const dateFrom = ref<string>(demoDateRange.from);
    const dateTo = ref<string>(demoDateRange.to);
    const selectedDepartmentId = ref<string>('all');
    const selectedEmployeeId = ref<string>('all');

    const availableEmployees = computed(() =>
        employees.filter((employee) =>
            selectedDepartmentId.value === 'all'
                ? true
                : employee.departmentId === selectedDepartmentId.value,
        ),
    );

    // Reset employee selection when department changes
    watch(selectedDepartmentId, () => {
        if (
            selectedEmployeeId.value !== 'all' &&
            !availableEmployees.value.some(
                (employee) => employee.id === selectedEmployeeId.value,
            )
        ) {
            selectedEmployeeId.value = 'all';
        }
    });

    const hasInvalidDateRange = computed(
        () =>
            dateFrom.value !== '' &&
            dateTo.value !== '' &&
            dateFrom.value > dateTo.value,
    );

    function isDateWithinRange(dateValue: string): boolean {
        if (dateFrom.value !== '' && dateValue < dateFrom.value) {
            return false;
        }

        if (dateTo.value !== '' && dateValue > dateTo.value) {
            return false;
        }

        return true;
    }

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

    return {
        dateFrom,
        dateTo,
        selectedDepartmentId,
        selectedEmployeeId,
        availableEmployees,
        hasInvalidDateRange,
        filteredAttendance,
        isDateWithinRange,
        departments,
    };
}
