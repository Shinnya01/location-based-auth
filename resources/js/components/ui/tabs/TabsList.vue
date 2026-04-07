<script setup lang="ts">
import type { TabsListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TabsList, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="forwardedProps"
    :class="cn(
      'inline-flex h-auto min-h-10 items-center justify-center rounded-xl bg-muted/70 p-1 text-muted-foreground',
      props.class,
    )"
  >
    <slot />
  </TabsList>
</template>
