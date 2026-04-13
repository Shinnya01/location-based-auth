<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDisplayDate } from '@/lib/formatters';

interface DocumentData {
    id: string;
    title: string;
    uploadedBy: string;
    uploadedAt: string;
    status: 'Draft' | 'Submitted' | 'Approved';
    type: string;
    documentName: string;
    category: string;
}

interface Props {
    isOpen: boolean;
    document: DocumentData | null;
}

defineProps<Props>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
}>();

function documentStatusClass(status: string): string {
    switch (status) {
        case 'Draft':
            return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
        case 'Submitted':
            return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
        case 'Approved':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
        default:
            return 'border-border bg-background text-foreground';
    }
}
</script>

<template>
    <Dialog :open="isOpen" @update:open="emit('update:isOpen', $event)">
        <DialogContent class="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Document preview</DialogTitle>
                <DialogDescription>
                    Static preview details for the selected 201 file entry.
                </DialogDescription>
            </DialogHeader>

            <div v-if="document" class="grid gap-4">
                <div
                    class="flex min-h-56 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-muted/20 p-8 text-center"
                >
                    <div
                        class="rounded-2xl border bg-background p-3 text-muted-foreground"
                    >
                        <FileText class="size-6" />
                    </div>
                    <div class="space-y-1">
                        <p class="font-medium text-foreground">
                            {{ document.title }}
                        </p>
                        <p class="text-sm text-muted-foreground">
                            File preview placeholder
                        </p>
                    </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-3">
                    <div class="rounded-2xl border bg-muted/20 p-4">
                        <p
                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                        >
                            Uploaded by
                        </p>
                        <p class="mt-3 font-medium text-foreground">
                            {{ document.uploadedBy }}
                        </p>
                    </div>
                    <div class="rounded-2xl border bg-muted/20 p-4">
                        <p
                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                        >
                            Date
                        </p>
                        <p class="mt-3 font-medium text-foreground">
                            {{ formatDisplayDate(document.uploadedAt) }}
                        </p>
                    </div>
                    <div class="rounded-2xl border bg-muted/20 p-4">
                        <p
                            class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                        >
                            Status
                        </p>
                        <div class="mt-3">
                            <Badge
                                variant="outline"
                                class="rounded-full"
                                :class="documentStatusClass(document.status)"
                            >
                                {{ document.status }}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
