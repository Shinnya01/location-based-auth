<script setup lang="ts">
import { Clock } from 'lucide-vue-next';
import type {  ShiftDefinition, Shifts} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { shifts } from '@/lib/hrisData';

interface Props {
    shifts: Shifts[];
}

defineProps <{
    shifts: ShiftDefinition 
}>()

defineProps<Props>();
</script>

<template>
    <Card class="rounded-[1.75rem] shadow-xs">
        <CardHeader>
            <CardTitle>Shifts</CardTitle>
            <CardDescription>
                Static shift definitions for this HRIS demo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div v-if="shifts.length === 0" class="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
                No shifts configured.
            </div>
            <div v-else class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div
                    v-for="shift in shifts"
                    :key="shift.id"
                    class="rounded-2xl border bg-muted/20 p-4"
                >
                    <div class="mb-2 flex items-center gap-2">
                        <Clock class="size-4 text-muted-foreground" />
                        <p class="font-medium text-foreground">
                            {{ shift.name }}
                        </p>
                    </div>
                    <p class="text-sm text-muted-foreground">
                        {{ shift.startTime }} - {{ shift.endTime }}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
