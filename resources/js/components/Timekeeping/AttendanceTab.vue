<script setup lang="ts">
import { ChevronDown, ChevronRight, SearchX } from 'lucide-vue-next';
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
import type { AttendanceRecord } from '@/types';

interface Employee {
    id: string;
    name: string;
    avatarHue: number;
}

interface Props {
    filteredAttendance: AttendanceRecord[];
    expandedAttendanceId: string | null;
    employeeLookup: Map<string, Employee>;
}

defineProps<Props>();

const emit = defineEmits<{
    'toggle-record': [recordId: string];
    'show-logs': [record: AttendanceRecord];
    'open-employee-sheet': [employeeId: string];
}>();

function attendanceStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function attendanceStatusClass(status: string): string {
    if (status === 'present') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    if (status === 'late') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
}

function avatarStyle(hue: number) {
    return {
        backgroundColor: `hsl(${hue} 85% 94%)`,
        color: `hsl(${hue} 45% 28%)`,
    };
}
</script>

<template>
    <Card class="overflow-hidden rounded-[1.75rem] shadow-xs">
        <CardHeader
            class="flex flex-col gap-3 border-b bg-muted/20 pb-5 lg:flex-row lg:items-center lg:justify-between"
        >
            <div>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>
                    Click any row to expand the clock events for
                    that employee.
                </CardDescription>
            </div>
            <p class="text-sm text-muted-foreground">
                {{ filteredAttendance.length }} employees in view
            </p>
        </CardHeader>

        <CardContent class="p-0">
            <div
                v-if="filteredAttendance.length === 0"
                class="flex flex-col items-center gap-3 px-6 py-16 text-center"
            >
                <div class="rounded-full border bg-muted p-4 text-muted-foreground">
                    <SearchX class="size-6" />
                </div>
                <div class="space-y-1">
                    <p class="font-medium text-foreground">
                        No attendance records found
                    </p>
                    <p class="text-sm text-muted-foreground">
                        Adjust the current filters to reveal the
                        static demo entries again.
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
                            <th class="px-6 py-4">Employee name</th>
                            <th class="px-6 py-4">Time in</th>
                            <th class="px-6 py-4">Time out</th>
                            <th class="px-6 py-4">Total hours</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="record in filteredAttendance" :key="record.id">
                            <tr
                                class="cursor-pointer border-b transition-colors hover:bg-muted/20"
                                @click="emit('toggle-record', record.id)"
                            >
                                <td class="px-6 py-4 align-top">
                                    <div
                                        class="flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground"
                                    >
                                        <ChevronDown
                                            v-if="
                                                expandedAttendanceId ===
                                                record.id
                                            "
                                            class="size-4"
                                        />
                                        <ChevronRight v-else class="size-4" />
                                    </div>
                                </td>
                                <td class="px-6 py-4 align-top">
                                    <div class="flex items-start gap-3">
                                        <Avatar class="size-10 rounded-xl">
                                            <AvatarFallback
                                                class="rounded-xl font-semibold"
                                                :style="
                                                    avatarStyle(
                                                        employeeLookup.get(
                                                            record.employeeId,
                                                        )?.avatarHue ?? 200,
                                                    )
                                                "
                                            >
                                                {{
                                                    getInitials(
                                                        record.employeeName,
                                                    )
                                                }}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div class="space-y-1">
                                            <div
                                                class="font-medium text-foreground"
                                            >
                                                {{ record.employeeName }}
                                            </div>
                                            <div
                                                class="text-sm text-muted-foreground"
                                            >
                                                {{ record.position }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">{{ record.timeIn }}</td>
                                <td class="px-6 py-4">{{ record.timeOut }}</td>
                                <td class="px-6 py-4">
                                    {{ record.totalHours }}
                                </td>
                                <td class="px-6 py-4">
                                    <Badge
                                        variant="outline"
                                        class="rounded-full"
                                        :class="
                                            attendanceStatusClass(
                                                record.status,
                                            )
                                        "
                                    >
                                        {{
                                            attendanceStatusLabel(
                                                record.status,
                                            )
                                        }}
                                    </Badge>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            class="rounded-full"
                                            @click.stop="
                                                emit('show-logs', record)
                                            "
                                        >
                                            View logs
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="rounded-full"
                                            @click.stop="
                                                emit(
                                                    'open-employee-sheet',
                                                    record.employeeId,
                                                )
                                            "
                                        >
                                            View 201
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                            <tr
                                v-if="expandedAttendanceId === record.id"
                                class="border-b bg-muted/10"
                            >
                                <td colspan="7" class="px-6 py-4">
                                    <div
                                        class="space-y-3 rounded-2xl border bg-card p-4"
                                    >
                                        <div>
                                            <p
                                                class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                                            >
                                                Clock events
                                            </p>
                                            <div
                                                class="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4"
                                            >
                                                <div
                                                    class="rounded-xl border bg-muted/20 px-3 py-2"
                                                >
                                                    <p
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        AM In
                                                    </p>
                                                    <p
                                                        class="mt-1 font-medium text-foreground"
                                                    >
                                                        8:00 AM
                                                    </p>
                                                </div>
                                                <div
                                                    class="rounded-xl border bg-muted/20 px-3 py-2"
                                                >
                                                    <p
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        AM Out
                                                    </p>
                                                    <p
                                                        class="mt-1 font-medium text-foreground"
                                                    >
                                                        12:00 PM
                                                    </p>
                                                </div>
                                                <div
                                                    class="rounded-xl border bg-muted/20 px-3 py-2"
                                                >
                                                    <p
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        PM In
                                                    </p>
                                                    <p
                                                        class="mt-1 font-medium text-foreground"
                                                    >
                                                        1:00 PM
                                                    </p>
                                                </div>
                                                <div
                                                    class="rounded-xl border bg-muted/20 px-3 py-2"
                                                >
                                                    <p
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        PM Out
                                                    </p>
                                                    <p
                                                        class="mt-1 font-medium text-foreground"
                                                    >
                                                        5:00 PM
                                                    </p>
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
</template>
