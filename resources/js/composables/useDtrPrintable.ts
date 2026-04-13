import { computed, ref } from 'vue';
import { attendanceRecords } from '@/lib/hrisData';
import type { RawLogEntry } from '@/types';
import { useLogsFilter } from './useLogsFilter';

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

export function useDtrPrintable(
    dateFrom: { value: string },
    dateTo: { value: string },
    formatDisplayDate: (date: string) => string,
    formatTimeOnly: (timestamp: string) => string,
    attendanceStatusLabel: (status: string) => string,
) {
    const { effectiveLogsEmployeeId, filteredRawLogs, focusedLogsEmployee } =
        useLogsFilter();

    const isDtrPreviewOpen = ref<boolean>(false);

    const attendanceRecordLookup = computed<Map<string, (typeof attendanceRecords)[0]>>(
        () =>
            new Map(
                attendanceRecords.map((record) => [
                    `${record.employeeId}:${record.date}`,
                    record,
                ]),
            ),
    );

    const canPrintDtr = computed(() =>
        Boolean(effectiveLogsEmployeeId.value && filteredRawLogs.value.length > 0),
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
            .sort(([leftDate], [rightDate]) =>
                leftDate.localeCompare(rightDate),
            )
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
                        : Array.from(
                              new Set(orderedLogs.map((log) => log.status)),
                          ).join(' / '),
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

    function openDtrPreview(): void {
        if (!canPrintDtr.value) {
            return;
        }

        isDtrPreviewOpen.value = true;
    }

    function escapeHtml(value: string): string {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
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

        const printWindow = window.open(
            '',
            'dtr-print-preview',
            'width=1024,height=768',
        );
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

    return {
        isDtrPreviewOpen,
        dtrPrintableRows,
        dtrShiftLabel,
        dtrCoverageLabel,
        dtrPrintHelperText,
        canPrintDtr,
        openDtrPreview,
        printDtrPreview,
    };
}
