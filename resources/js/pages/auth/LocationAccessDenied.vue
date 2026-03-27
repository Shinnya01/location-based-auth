<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import TextLink from '@/components/TextLink.vue';
import { home } from '@/routes';

defineOptions({
    layout: {
        title: 'Location unavailable',
        description: 'Your location could not be verified for access.',
    },
});
</script>

<template>
    <Head title="Location unavailable" />

    <div class="space-y-6 text-center">
        <div class="space-y-3">
            <h1 class="text-2xl font-semibold tracking-tight">
                Location unavailable
            </h1>
            <p class="text-sm text-muted-foreground">
                Your location could not be verified within the required area.
                Try again later from the approved location.
            </p>
        </div>

        <div class="text-sm text-muted-foreground">
            <TextLink :href="home()">Return home</TextLink>
        </div>
    </div>
</template>
