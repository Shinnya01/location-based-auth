<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';

type Props = {
    loginUrl?: string | null;
    registerUrl?: string | null;
};

defineProps<Props>();
</script>

<template>
    <Head title="Location access denied" />

    <div class="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
        <div class="w-full rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Access denied
            </p>
            <h1 class="mt-3 text-3xl font-semibold text-slate-950">
                Your location could not be verified.
            </h1>
            <p class="mt-4 text-sm leading-7 text-slate-600">
                Try again later from the approved area, or ask an administrator to review the saved
                location settings.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
                <Link
                    v-if="loginUrl"
                    :href="loginUrl"
                    class="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    Back to login
                </Link>

                <Link
                    v-if="registerUrl"
                    :href="registerUrl"
                    class="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-500"
                >
                    Try registration
                </Link>
            </div>
        </div>
    </div>
</template>
