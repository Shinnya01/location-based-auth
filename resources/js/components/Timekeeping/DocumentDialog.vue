<script setup lang="ts">
import { Upload } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { TEXTAREA_STYLES } from '@/lib/uiClasses';

interface Props {
    isOpen: boolean;
    dialogTitle: string;
    canSubmit: boolean;
    documentForm: {
        type: string;
        title: string;
        fileName: string | null;
        remarks: string;
        category: string;
    };
    documentTypeOptions: string[];
}

defineProps<Props>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    'trigger-file-input': [];
    'handle-file-selection': [event: Event];
    'persist': [action: 'save' | 'submit'];
}>();

const fileInput = defineModel<HTMLInputElement | null>('fileInput');
</script>

<template>
    <Dialog :open="isOpen" @update:open="emit('update:isOpen', $event)">
        <DialogContent class="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>
                    Client-only modal for the employee's 201 file. Changes
                    stay in local page state only.
                </DialogDescription>
            </DialogHeader>

            <div class="grid gap-4">
                <div class="grid gap-2">
                    <Label>Document type</Label>
                    <Select v-model="documentForm.type">
                        <SelectTrigger class="w-full">
                            <SelectValue
                                placeholder="Select a document type"
                            />
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
                        ref="fileInput"
                        type="file"
                        class="hidden"
                        @change="emit('handle-file-selection', $event)"
                    />
                    <button
                        type="button"
                        class="flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/20 px-4 py-4 text-left transition-colors hover:bg-muted/35"
                        @click="emit('trigger-file-input')"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="rounded-xl border bg-background p-2 text-muted-foreground"
                            >
                                <Upload class="size-4" />
                            </div>
                            <div>
                                <p class="font-medium text-foreground">
                                    {{ documentForm.fileName || 'Choose a file' }}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    UI placeholder only. No real upload will
                                    be sent.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" class="rounded-full"
                            >UI only</Badge
                        >
                    </button>
                </div>

                <div class="grid gap-2">
                    <Label for="document-remarks">Remarks</Label>
                    <textarea
                        id="document-remarks"
                        v-model="documentForm.remarks"
                        :class="TEXTAREA_STYLES"
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
                        :disabled="!canSubmit"
                        @click="emit('persist', 'save')"
                    >
                        Save
                    </Button>
                    <Button
                        :disabled="!canSubmit"
                        @click="emit('persist', 'submit')"
                    >
                        Submit
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
