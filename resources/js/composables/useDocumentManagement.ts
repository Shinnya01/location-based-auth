import { computed, ref } from 'vue';
import { documentTypeOptions, demoDateRange } from '@/lib/hrisData';
import type {
    DocumentCategory,
    DocumentStatus,
    DocumentType,
    EmployeeDocument,
    EmployeeRecordProfile,
} from '@/types';

type DocumentFormState = {
    category: DocumentCategory;
    type: DocumentType;
    title: string;
    remarks: string;
    fileName: string;
};

type DocumentDialogMode = 'add' | 'edit';
type DocumentAction = 'save' | 'submit';

export function useDocumentManagement() {
    const isDocumentDialogOpen = ref<boolean>(false);
    const documentDialogMode = ref<DocumentDialogMode>('add');
    const editingDocumentId = ref<string | null>(null);
    const documentForm = ref<DocumentFormState>(
        createEmptyDocumentForm('Personal'),
    );
    const documentFileInput = ref<HTMLInputElement | null>(null);

    const isDocumentViewOpen = ref<boolean>(false);
    const previewDocumentId = ref<string | null>(null);

    const documentDialogTitle = computed(() =>
        documentDialogMode.value === 'add' ? 'Add document' : 'Edit document',
    );

    const canSubmitDocument = computed(
        () => documentForm.value.title.trim().length > 0,
    );

    function createEmptyDocumentForm(
        category: DocumentCategory,
    ): DocumentFormState {
        return {
            category,
            type: documentTypeOptions[0],
            title: '',
            remarks: '',
            fileName: '',
        };
    }

    function openAddDocumentDialog(): void {
        documentDialogMode.value = 'add';
        editingDocumentId.value = null;
        documentForm.value = createEmptyDocumentForm('Personal');
        isDocumentDialogOpen.value = true;
    }

    function openEditDocumentDialog(document: EmployeeDocument): void {
        documentDialogMode.value = 'edit';
        editingDocumentId.value = document.id;
        documentForm.value = {
            category: document.category,
            type: document.type,
            title: document.title,
            remarks: document.remarks,
            fileName: `${document.type}.pdf`,
        };
        isDocumentDialogOpen.value = true;
    }

    function openDocumentPreview(document: EmployeeDocument): void {
        previewDocumentId.value = document.id;
        isDocumentViewOpen.value = true;
    }

    function triggerFileInput(): void {
        documentFileInput.value?.click();
    }

    function handleFileSelection(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        documentForm.value.fileName = file?.name ?? '';
    }

    function resolveDocumentStatus(
        currentStatus: DocumentStatus | null,
        action: DocumentAction,
    ): DocumentStatus {
        if (action === 'submit') {
            return 'Done';
        }

        if (currentStatus === 'Done') {
            return 'Done';
        }

        if (currentStatus === 'Missing' || currentStatus === null) {
            return 'Draft';
        }

        return currentStatus;
    }

    function persistDocument(
        action: DocumentAction,
        employeeProfile: EmployeeRecordProfile | null,
        selectedCategory: DocumentCategory,
    ): void {
        if (!employeeProfile || !canSubmitDocument.value) {
            return;
        }

        const existingDocument =
            editingDocumentId.value === null
                ? null
                : (employeeProfile.documents.find(
                      (document) => document.id === editingDocumentId.value,
                  ) ?? null);

        const nextStatus = resolveDocumentStatus(
            existingDocument?.status ?? null,
            action,
        );

        const nextDocument: EmployeeDocument = {
            id: existingDocument?.id ?? `document-${Date.now()}`,
            employeeId: employeeProfile.employeeId,
            category: documentForm.value.category,
            type: documentForm.value.type,
            documentName: documentForm.value.type,
            title: documentForm.value.title.trim(),
            status: nextStatus,
            uploadedBy: 'Records Admin, HRIS Demo',
            uploadedAt: demoDateRange.to,
            remarks:
                documentForm.value.remarks.trim() ||
                'Updated from the static HRIS timekeeping demo.',
        };

        if (existingDocument) {
            const targetDocument = employeeProfile.documents.find(
                (document) => document.id === existingDocument.id,
            );

            if (targetDocument) {
                targetDocument.category = nextDocument.category;
                targetDocument.type = nextDocument.type;
                targetDocument.documentName = nextDocument.documentName;
                targetDocument.title = nextDocument.title;
                targetDocument.status = nextDocument.status;
                targetDocument.uploadedBy = nextDocument.uploadedBy;
                targetDocument.uploadedAt = nextDocument.uploadedAt;
                targetDocument.remarks = nextDocument.remarks;
            }
        } else {
            employeeProfile.documents.unshift(nextDocument);
        }

        // Update selected category to the newly created/edited document's category
        // This will be used by the parent to update selectedDocumentCategory
        isDocumentDialogOpen.value = false;
    }

    return {
        isDocumentDialogOpen,
        documentDialogMode,
        editingDocumentId,
        documentForm,
        documentFileInput,
        isDocumentViewOpen,
        previewDocumentId,
        documentDialogTitle,
        canSubmitDocument,
        documentTypeOptions,
        openAddDocumentDialog,
        openEditDocumentDialog,
        openDocumentPreview,
        triggerFileInput,
        handleFileSelection,
        persistDocument,
        createEmptyDocumentForm,
    };
}
