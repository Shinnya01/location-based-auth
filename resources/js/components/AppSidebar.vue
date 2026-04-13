<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    BriefcaseBusiness,
    Clock3,
    DollarSign,
    FileArchive,
    FileBarChart2,
    LayoutGrid,
    Users,
} from 'lucide-vue-next';
import AppLogo from '@/components/AppLogo.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    dashboard,
    departments,
    employees,
    payroll,
    recordKeeping,
    salary,
    timekeeping,
} from '@/routes';
import { forms as recordKeepingForms } from '@/routes/record-keeping';
import type { SidebarNavItem } from '@/types';

const mainNavItems: SidebarNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Recruitment',
        href: '#',
        icon: BriefcaseBusiness,
        disabled: true,
    },
    {
        title: 'Timekeeping',
        href: timekeeping(),
        icon: Clock3,
    },
    {
        title: 'Payroll',
        icon: DollarSign,
        disabled: true,
        children: [
            {
                title: 'Payroll',
                href: payroll(),
            },
            {
                title: 'Salary & Compensation',
                href: salary(),
            },
        ],
    },
    {
        title: 'Document',
        icon: FileArchive,
        children: [
            {
                title: 'Record Keeping',
                href: recordKeeping(),
            },
            {
                title: 'Printable Form',
                href: recordKeepingForms(),
            },
        ],
    },
    {
        title: 'Organization',
        icon: Users,
        children: [
            {
                title: 'Employee',
                href: employees(),
            },
            {
                title: 'Department',
                href: departments(),
            },
        ],
    },
    {
        title: 'Reports',
        href: '#',
        icon: FileBarChart2,
        disabled: true,
    },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" label="HRIS" />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
