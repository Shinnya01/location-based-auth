<script setup lang="ts">
import {
    ChevronRight,
    Fingerprint,
    MapPin,
    SearchX,
    Printer,
} from 'lucide-vue-next';
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
import { getInitials } from '@/composables/useInitials';
import type { RawLogEntry } from '@/types';

interface Employee {
    id: string;
    name: string;
    position: string;
    departmentName: string;
    avatarHue: number;
}

interface Props {
    filteredRawLogs: RawLogEntry[];
    focusedLogsEmployee: Employee | null;
    focusedLogsEmployeeId: string | null;
    employeeLookup: Map<string, Employee>;
    canPrintDtr: boolean;
    dtrPrintHelperText: string;
}

defineProps<Props>();

const emit = defineEmits<{
    'clear-log-focus': [];
    'focus-logs-employee': [employeeId: string];
    'open-dtr-preview': [];
    'open-employee-sheet': [employeeId: string];
}>();

function methodClass(method: string): string {
    return method === 'Biometric'
        ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
        : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300';
}

function methodIcon(method: string) {
    return method === 'Biometric' ? Fingerprint : MapPin;
}

function rawLogStatusClass(status: string): string {
    if (status === 'Verified') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'Adjusted') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(timestamp));
}

function avatarStyle(hue: number) {
    return {
        backgroundColor: `hsl(${hue} 85% 94%)`,
        color: `hsl(${hue} 45% 28%)`,
    };
}
</script>

<template>
    <div class="grid gap-5">
        <Card class="overflow-hidden rounded-[1.75rem] shadow-xs">
            <CardHeader
                class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between"
            >
                <div>
                    <CardTitle>Employee focus</CardTitle>
                    <CardDescription>
                        Click any employee below to narrow the raw logs view to
                        that single employee.
                    </CardDescription>
                </div>
                <p class="text-sm text-muted-foreground">
                    {{
                        focusedLogsEmployeeId
                            ? '1 employee selected'
                            : 'All employees'
                    }}
                </p>
            </CardHeader>

            <CardContent class="p-0">
                <div
                    v-if="filteredRawLogs.length === 0"
                    class="flex flex-col items-center gap-3 px-6 py-16 text-center"
                >
                    <div class="rounded-full border bg-muted p-4 text-muted-foreground">
                        <SearchX class="size-6" />
                    </div>
                    <div class="space-y-1">
                        <p class="font-medium text-foreground">
                            No raw logs found
                        </p>
                        <p class="text-sm text-muted-foreground">
                            Adjust the current filters to see logged activities.
                        </p>
                    </div>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead
                            class="bg-muted/35 text-left text-xs tracking-[0.18em] text-muted-foreground uppercase"
                        >
                            <tr>
                                <th class="w-12 px-6 py-4"></th>
                                <th class="px-6 py-4">Employee</th>
                                <th class="px-6 py-4">Timestamp</th>
                                <th class="px-6 py-4">Type</th>
                                <th class="px-6 py-4">Method</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="log in filteredRawLogs"
                                :key="log.id"
                                class="border-b hover:bg-muted/20"
                                :class="{
                                    'bg-blue-50/50 dark:bg-blue-950/20':
                                        focusedLogsEmployeeId ===
                                        log.employeeId,
                                }"
                            >
                                <td class="px-6 py-4 align-top">
                                    <button
                                        v-if="
                                            focusedLogsEmployeeId ===
                                            log.employeeId
                                        "
                                        type="button"
                                        class="flex size-8 items-center justify-center rounded-full border bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"
                                        @click="emit('clear-log-focus')"
                                    >
                                        <ChevronRight class="size-4" />
                                    </button>
                                </td>
                                <td class="px-6 py-4 align-top">
                                    <div class="flex items-start gap-3">
                                        <Avatar class="size-10 rounded-xl">
                                            <AvatarFallback
                                                class="rounded-xl font-semibold text-xs"
                                                :style="
                                                    avatarStyle(
                                                        employeeLookup.get(
                                                            log.employeeId,
                                                        )?.avatarHue ?? 200,
                                                    )
                                                "
                                            >
                                                {{
                                                    getInitials(
                                                        employeeLookup.get(
                                                            log.employeeId,
                                                        )?.name ?? 'U',
                                                    )
                                                }}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div class="space-y-1">
                                            <div
                                                class="font-medium text-foreground"
                                            >
                                                {{
                                                    employeeLookup.get(
                                                        log.employeeId,
                                                    )?.name
                                                }}
                                            </div>
                                            <div
                                                class="text-xs text-muted-foreground"
                                            >
                                                {{
                                                    employeeLookup.get(
                                                        log.employeeId,
                                                    )?.position
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    {{ formatTimestamp(log.timestamp) }}
                                </td>
                                <td class="px-6 py-4">
                                    <Badge variant="outline" class="rounded-full">
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
                                <td class="px-6 py-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="rounded-full"
                                        @click="
                                            emit('focus-logs-employee', log.employeeId)
                                        "
                                    >
                                        Focus
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        <Card class="rounded-[1.75rem] shadow-xs">
            <CardHeader
                class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between"
            >
                <div>
                    <CardTitle>Daily Time Record</CardTitle>
                    <CardDescription>
                        {{ dtrPrintHelperText }}
                    </CardDescription>
                </div>
                <Button
                    :disabled="!canPrintDtr"
                    @click="emit('open-dtr-preview')"
                >
                    <Printer class="size-4" />
                    Preview & Print
                </Button>
            </CardHeader>
        </Card>
    </div>
</template>
