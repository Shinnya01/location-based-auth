import type { InertiaLinkProps } from '@inertiajs/vue3';
import type { LucideIcon } from 'lucide-vue-next';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon;
    isActive?: boolean;
    disabled?: boolean;
    children?: NavItem[];
};

export type SidebarNavItem = Omit<NavItem, 'href' | 'children'> & {
    href?: NonNullable<InertiaLinkProps['href']>;
    children?: SidebarNavItem[];
};
