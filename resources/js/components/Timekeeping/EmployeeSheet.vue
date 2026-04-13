<script setup lang="ts">
import { Eye, IdCard, Pencil, Mail, Phone, Building2, MapPin, FileText } from 'lucide-vue-next';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/composables/useInitials';
import type { DocumentCategory, EmployeeRecordProfile } from '@/types';

interface Employee {
    id: string;
    name: string;
    position: string;
    departmentName: string;
    employeeCode: string;
    status: string;
    avatarHue: number;
}

interface Props {
    isOpen: boolean;
    selectedEmployee: Employee | null;
    selectedEmployeeProfile: EmployeeRecordProfile | null;
    selectedEmployeeAttendance: any;
    selectedDocumentCategory: DocumentCategory;
    selectedCategoryDocuments: any[];
    previewDocument: any;
    isDocumentViewOpen: boolean;
    documentTypeOptions: string[];
}

defineProps<Props>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    'update:selectedDocumentCategory': [value: DocumentCategory];
    'open-document-dialog': [];
    'open-edit-document-dialog': [document: any];
    'open-document-preview': [document: any];
}>();

function avatarStyle(hue: number) {
    return {
        backgroundColor: `hsl(${hue} 85% 94%)`,
        color: `hsl(${hue} 45% 28%)`,
    };
}

function formatDisplayDate(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`));
}
</script>

<template>
    <Sheet :open="isOpen" @update:open="emit('update:isOpen', $event)">
        <SheetContent
            side="right"
            class="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[92vw] lg:max-w-4xl"
        >
            <div
                v-if="selectedEmployee && selectedEmployeeProfile"
                class="flex h-full flex-col"
            >
                <SheetHeader class="border-b px-6 pt-6 pb-5 text-left">
                    <div
                        class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                    >
                        <div class="flex items-start gap-4">
                            <Avatar class="size-14 rounded-2xl">
                                <AvatarFallback
                                    class="rounded-2xl text-base font-semibold"
                                    :style="avatarStyle(selectedEmployee.avatarHue)"
                                >
                                    {{ getInitials(selectedEmployee.name) }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="space-y-2">
                                <div>
                                    <SheetTitle class="text-2xl">
                                        {{ selectedEmployee.name }}
                                    </SheetTitle>
                                    <SheetDescription class="mt-1 text-sm">
                                        {{ selectedEmployee.position }} ·
                                        {{
                                            selectedEmployee.departmentName
                                        }}
                                    </SheetDescription>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-border bg-background"
                                    >
                                        <IdCard class="size-3.5" />
                                        {{ selectedEmployee.employeeCode }}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        class="rounded-full"
                                        :class="{
                                            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300':
                                                selectedEmployee.status ===
                                                'On Site',
                                            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300':
                                                selectedEmployee.status ===
                                                'Field Duty',
                                            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300':
                                                selectedEmployee.status ===
                                                'Sick Leave',
                                        }"
                                    >
                                        {{ selectedEmployee.status }}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs
                    :model-value="
                        ['profile', 'attendance', 'file'][
                            ['profile', 'attendance', 'file'].indexOf(
                                selectedDocumentCategory.toLowerCase(),
                            ) > -1
                                ? ['profile', 'attendance', 'file'].indexOf(
                                      selectedDocumentCategory.toLowerCase(),
                                  )
                                : 2
                        ]
                    "
                    class="flex flex-1 flex-col"
                >
                    <TabsList class="w-full justify-start gap-1 rounded-2xl p-1.5">
                        <TabsTrigger value="profile" class="gap-2 px-4">
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="attendance" class="gap-2 px-4">
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger value="file" class="gap-2 px-4">
                            201 File
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" class="mt-5 flex-1 space-y-5">
                        <Card class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>Personal information</CardTitle>
                                <CardDescription>
                                    Static profile data for this HRIS demo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="rounded-2xl border bg-muted/20 p-4">
                                    <div
                                        class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"
                                    >
                                        <MapPin
                                            class="size-4 text-muted-foreground"
                                        />
                                        Personal details
                                    </div>
                                    <dl class="space-y-3 text-sm">
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Birth date
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    formatDisplayDate(
                                                        selectedEmployeeProfile.birthDate,
                                                    )
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Civil status
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.civilStatus
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Nationality
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.nationality
                                                }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div class="rounded-2xl border bg-muted/20 p-4">
                                    <div
                                        class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"
                                    >
                                        <Mail
                                            class="size-4 text-muted-foreground"
                                        />
                                        Contact details
                                    </div>
                                    <dl class="space-y-3 text-sm">
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Email
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.email
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Phone
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.phone
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Address
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.address
                                                }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div class="rounded-2xl border bg-muted/20 p-4">
                                    <div
                                        class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"
                                    >
                                        <Building2
                                            class="size-4 text-muted-foreground"
                                        />
                                        Employment
                                    </div>
                                    <dl class="space-y-3 text-sm">
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Hire date
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    formatDisplayDate(
                                                        selectedEmployeeProfile.hireDate,
                                                    )
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Supervisor
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.supervisor
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Work location
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.workLocation
                                                }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div class="rounded-2xl border bg-muted/20 p-4">
                                    <div
                                        class="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"
                                    >
                                        <Phone
                                            class="size-4 text-muted-foreground"
                                        />
                                        Emergency contact
                                    </div>
                                    <dl class="space-y-3 text-sm">
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Name
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.emergencyContact
                                                }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-muted-foreground">
                                                Mobile
                                            </dt>
                                            <dd class="font-medium text-foreground">
                                                {{
                                                    selectedEmployeeProfile.emergencyPhone
                                                }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" class="mt-5 flex-1 space-y-5">
                        <Card class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>Recent attendance history</CardTitle>
                                <CardDescription>
                                    Five-day snapshot linked to this employee record.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="overflow-x-auto p-0">
                                <table class="min-w-full text-sm">
                                    <thead
                                        class="bg-muted/35 text-left text-xs tracking-[0.18em] text-muted-foreground uppercase"
                                    >
                                        <tr>
                                            <th class="px-6 py-4">Date</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4">Time in</th>
                                            <th class="px-6 py-4">Time out</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="history in selectedEmployeeProfile.attendanceHistory"
                                            :key="history.id"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td
                                                class="px-6 py-4 font-medium text-foreground"
                                            >
                                                {{
                                                    formatDisplayDate(
                                                        history.date,
                                                    )
                                                }}
                                            </td>
                                            <td class="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                >
                                                    {{ history.status }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">
                                                {{ history.timeIn ?? 'No log' }}
                                            </td>
                                            <td class="px-6 py-4">
                                                {{ history.timeOut ?? 'No log' }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="file" class="mt-5 flex-1 space-y-5">
                        <Card class="rounded-3xl shadow-none">
                            <CardHeader>
                                <CardTitle>201 File</CardTitle>
                                <CardDescription>
                                    Document category management for employee record.
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="overflow-x-auto p-0">
                                <table class="min-w-full text-sm">
                                    <thead
                                        class="bg-muted/35 text-left text-xs tracking-[0.18em] text-muted-foreground uppercase"
                                    >
                                        <tr>
                                            <th class="px-6 py-4">Document</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="document in selectedCategoryDocuments"
                                            :key="document.id"
                                            class="border-b hover:bg-muted/20"
                                        >
                                            <td class="px-6 py-4">
                                                <div class="space-y-1">
                                                    <p
                                                        class="font-medium text-foreground"
                                                    >
                                                        {{
                                                            document.title
                                                        }}
                                                    </p>
                                                    <p
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        {{
                                                            document.documentName
                                                        }}
                                                        ·
                                                        {{
                                                            document.type
                                                        }}
                                                    </p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    class="rounded-full"
                                                >
                                                    {{ document.status }}
                                                </Badge>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div
                                                    class="flex justify-end gap-2"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click="
                                                            emit(
                                                                'open-document-preview',
                                                                document,
                                                            )
                                                        "
                                                    >
                                                        <Eye
                                                            class="size-4"
                                                        />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        class="rounded-full"
                                                        @click="
                                                            emit(
                                                                'open-edit-document-dialog',
                                                                document,
                                                            )
                                                        "
                                                    >
                                                        <Pencil
                                                            class="size-4"
                                                        />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <Button class="w-full" @click="emit('open-document-dialog')">
                            <FileText class="size-4" />
                            Add document
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>
        </SheetContent>
    </Sheet>
</template>
