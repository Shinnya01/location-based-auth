<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { Badge } from '@/components/ui/badge';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenuAction,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/composables/useCurrentUrl';
import type { NavItem } from '@/types';

const props = defineProps<{
    items: NavItem[];
    label?: string;
}>();

const { currentUrl, isCurrentOrParentUrl } = useCurrentUrl();
const expandedItems = ref<Record<string, boolean>>({});

function itemHasChildren(item: NavItem): boolean {
    return Boolean(item.children?.length);
}

function itemHasActiveBranch(item: NavItem): boolean {
    return Boolean(
        isCurrentOrParentUrl(item.href) ||
            item.children?.some((child) => isCurrentOrParentUrl(child.href)),
    );
}

function itemIsExpanded(item: NavItem): boolean {
    return Boolean(itemHasChildren(item) && expandedItems.value[item.title]);
}

function toggleChildren(item: NavItem): void {
    if (!itemHasChildren(item)) {
        return;
    }

    expandedItems.value[item.title] = !itemIsExpanded(item);
}

watch(
    currentUrl,
    () => {
        props.items.forEach((item) => {
            if (itemHasChildren(item) && itemHasActiveBranch(item)) {
                expandedItems.value[item.title] = true;
            }
        });
    },
    { immediate: true },
);
</script>

<template>
    <SidebarGroup class="px-2 py-0">
        <SidebarGroupLabel>{{ label ?? 'Platform' }}</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in props.items" :key="item.title">
                <template v-if="!item.disabled">
                    <SidebarMenuButton
                        as-child
                        :is-active="itemHasActiveBranch(item)"
                        :tooltip="item.title"
                    >
                        <Link :href="item.href">
                            <component :is="item.icon" v-if="item.icon" />
                            <span>{{ item.title }}</span>
                        </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                        v-if="itemHasChildren(item)"
                        :aria-label="itemIsExpanded(item) ? `Collapse ${item.title}` : `Expand ${item.title}`"
                        @click.stop.prevent="toggleChildren(item)"
                    >
                        <component :is="itemIsExpanded(item) ? ChevronUp : ChevronDown" />
                    </SidebarMenuAction>
                </template>
                <SidebarMenuButton
                    v-else
                    disabled
                    :tooltip="`${item.title} (Coming soon)`"
                    class="opacity-80"
                >
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                    <Badge
                        variant="outline"
                        class="ml-auto border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/70"
                    >
                        Soon
                    </Badge>
                </SidebarMenuButton>

                <SidebarMenuSub v-if="itemHasChildren(item) && itemIsExpanded(item)">
                    <SidebarMenuSubItem
                        v-for="child in item.children"
                        :key="`${item.title}-${child.title}`"
                    >
                        <SidebarMenuSubButton
                            v-if="!child.disabled"
                            as-child
                            :is-active="isCurrentOrParentUrl(child.href)"
                        >
                            <Link :href="child.href">
                                <span>{{ child.title }}</span>
                            </Link>
                        </SidebarMenuSubButton>
                        <SidebarMenuSubButton v-else disabled>
                            <span>{{ child.title }}</span>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
