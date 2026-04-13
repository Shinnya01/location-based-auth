<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft, FileText } from 'lucide-vue-next';
import { computed, ref } from 'vue';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { printableForms } from '@/lib/hrisData';
import { recordKeeping } from '@/routes';
import { forms as recordKeepingForms } from '@/routes/record-keeping';
import type { PrintableForm } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Record Keeping',
                href: recordKeeping(),
            },
            {
                title: 'Printable Forms',
                href: recordKeepingForms(),
            },
        ],
    },
});

const previewFormId = ref<string | null>(null);
const isPreviewOpen = ref<boolean>(false);

const selectedPrintableForm = computed<PrintableForm | null>(
    () =>
        printableForms.find((form) => form.id === previewFormId.value) ?? null,
);

function openFormPreview(formId: string): void {
    previewFormId.value = formId;
    isPreviewOpen.value = true;
}
</script>

<template>
    <Head title="Printable Forms" />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section
            class="rounded-[1.75rem] border bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-xs md:p-6"
        >
            <div
                class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
            >
                <div class="space-y-1">
                    <h1 class="text-xl font-semibold tracking-tight">
                        Printable Forms
                    </h1>
                    <p class="max-w-3xl text-sm text-muted-foreground">
                        Access blank printable HR forms in a separate static
                        page under Record Keeping, without mixing them with
                        applicant or employee record creation.
                    </p>
                </div>

                <Badge
                    variant="outline"
                    class="w-fit rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                >
                    Static printable catalog
                </Badge>
            </div>
        </section>
        <div>
            <Button variant="outline" class="rounded-full" as-child>
                <Link :href="recordKeeping()">
                    <ArrowLeft class="size-4" />
                    Back to Record Keeping
                </Link>
            </Button>
        </div>
        <Card class="rounded-[1.75rem] shadow-xs">
            <CardHeader class="border-b bg-muted/20 pb-5">
                <CardTitle>Printable forms catalog</CardTitle>
                <CardDescription>
                    Blank forms that can be previewed or printed before they are
                    filed under an applicant or employee record.
                </CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 p-5 md:grid-cols-2">
                <div
                    v-for="form in printableForms"
                    :key="form.id"
                    class="rounded-2xl border bg-muted/20 p-4"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-foreground">
                                {{ form.name }}
                            </p>
                            <p class="mt-1 text-xs text-muted-foreground">
                                {{ form.formCode }} · {{ form.category }}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            class="rounded-full border-border bg-background"
                        >
                            {{ form.audience }}
                        </Badge>
                    </div>
                    <p class="mt-3 text-sm text-muted-foreground">
                        {{ form.description }}
                    </p>
                    <div class="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            class="rounded-full"
                            @click="openFormPreview(form.id)"
                        >
                            Preview
                        </Button>
                        <Button variant="ghost" size="sm" class="rounded-full">
                            Print
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Dialog :open="isPreviewOpen" @update:open="isPreviewOpen = $event">
            <DialogContent class="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{{
                        selectedPrintableForm?.name ?? 'Form preview'
                    }}</DialogTitle>
                    <DialogDescription>
                        Static printable form preview. No generation, download,
                        or printing logic is connected.
                    </DialogDescription>
                </DialogHeader>

                <div v-if="selectedPrintableForm" class="grid gap-4">
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
                                {{ selectedPrintableForm.formCode }}
                            </p>
                            <p class="text-sm text-muted-foreground">
                                Printable form preview placeholder
                            </p>
                        </div>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-3">
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p
                                class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                Category
                            </p>
                            <p class="mt-3 font-medium text-foreground">
                                {{ selectedPrintableForm.category }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p
                                class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                Audience
                            </p>
                            <p class="mt-3 font-medium text-foreground">
                                {{ selectedPrintableForm.audience }}
                            </p>
                        </div>
                        <div class="rounded-2xl border bg-muted/20 p-4">
                            <p
                                class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                Availability
                            </p>
                            <p class="mt-3 font-medium text-foreground">
                                Ready to print
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
