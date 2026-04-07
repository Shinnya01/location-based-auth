<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    BriefcaseBusiness,
    Clock3,
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
import { dashboard, recordKeeping, timekeeping } from '@/routes';
import { forms as recordKeepingForms } from '@/routes/record-keeping';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
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
        title: 'Employees',
        href: '#',
        icon: Users,
        disabled: true,
    },
    {
        title: 'Timekeeping',
        href: timekeeping(),
        icon: Clock3,
    },
    {
        title: 'Record Keeping',
        href: recordKeeping(),
        icon: FileArchive,
        children: [
            {
                title: 'Printable Forms',
                href: recordKeepingForms(),
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
