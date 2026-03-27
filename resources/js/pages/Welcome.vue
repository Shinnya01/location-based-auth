<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowRight, MapPinned, Radar, ShieldCheck } from 'lucide-vue-next';
import { dashboard, login, register } from '@/routes';

withDefaults(
    defineProps<{
        canRegister: boolean;
    }>(),
    {
        canRegister: true,
    },
);

const highlights = [
    {
        title: 'Geofence Login',
        description: 'Allow access only inside the approved radius.',
    },
    {
        title: 'Simple Admin Setup',
        description: 'Set one location, adjust meters, save, done.',
    },
    {
        title: 'Clear Access Rules',
        description: 'Login and registration follow the same boundary.',
    },
] as const;
</script>

<template>
    <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
            href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap"
            rel="stylesheet"
        />
    </Head>

    <div
        class="h-screen overflow-hidden bg-[#f1eadc] text-[#182218]"
        style="font-family: 'Manrope', sans-serif;"
    >
        <div
            class="relative mx-auto flex h-full max-w-[120rem] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
        >
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute left-[-8rem] top-[-10rem] h-64 w-64 rounded-full bg-[#d8c38b]/35 blur-3xl" />
                <div class="absolute right-[-10rem] bottom-[-8rem] h-72 w-72 rounded-full bg-[#2a6a4b]/15 blur-3xl" />
            </div>

            <div
                class="relative grid h-full overflow-hidden rounded-[2rem] border border-[#182218]/10 bg-[#fbf7ef]/85 shadow-[0_32px_90px_rgba(24,34,24,0.08)] lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]"
            >
                <section class="flex min-h-0 flex-col px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
                    <header class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#182218] text-[#f6f0e7]"
                            >
                                <MapPinned class="size-5" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b735f]">
                                    Sitebound Access
                                </p>
                                <p class="text-sm text-[#667061]">
                                    Location-based access control
                                </p>
                            </div>
                        </div>

                        <nav class="flex items-center gap-3">
                            <Link
                                v-if="$page.props.auth.user"
                                :href="dashboard()"
                                class="inline-flex items-center gap-2 rounded-full bg-[#182218] px-5 py-2.5 text-sm font-semibold text-[#f6f0e7] transition hover:bg-[#101710]"
                            >
                                Dashboard
                                <ArrowRight class="size-4" />
                            </Link>
                            <template v-else>
                                <Link
                                    :href="login()"
                                    class="inline-flex items-center gap-2 rounded-full border border-[#182218]/10 bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#182218] transition hover:border-[#182218]/20"
                                >
                                    Log in
                                </Link>
                                <Link
                                    v-if="canRegister"
                                    :href="register()"
                                    class="hidden items-center gap-2 rounded-full bg-[#182218] px-5 py-2.5 text-sm font-semibold text-[#f6f0e7] transition hover:bg-[#101710] sm:inline-flex"
                                >
                                    Register
                                </Link>
                            </template>
                        </nav>
                    </header>

                    <div class="flex flex-1 items-center">
                        <div class="grid gap-8 lg:max-w-3xl">
                            <div class="grid gap-4">
                                <div
                                    class="inline-flex w-fit items-center gap-2 rounded-full border border-[#182218]/10 bg-white/75 px-4 py-2 text-sm font-medium text-[#30513a]"
                                >
                                    <Radar class="size-4" />
                                    One place. One rule. One clean entry flow.
                                </div>

                                <div class="grid gap-4">
                                    <h1
                                        class="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-[#182218] sm:text-6xl xl:text-7xl"
                                        style="font-family: 'Space Grotesk', sans-serif;"
                                    >
                                        Access begins at the right location.
                                    </h1>
                                    <p class="max-w-2xl text-lg leading-8 text-[#566254] xl:text-xl">
                                        Let admins define one approved center point and radius, then
                                        allow only nearby users to continue through login or
                                        registration.
                                    </p>
                                </div>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">
                                <Link
                                    v-if="$page.props.auth.user"
                                    :href="dashboard()"
                                    class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#182218] px-6 py-3.5 text-base font-semibold text-[#f6f0e7] transition hover:bg-[#101710]"
                                >
                                    Open dashboard
                                    <ArrowRight class="size-4" />
                                </Link>
                                <template v-else>
                                    <Link
                                        :href="login()"
                                        class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#182218] px-6 py-3.5 text-base font-semibold text-[#f6f0e7] transition hover:bg-[#101710]"
                                    >
                                        Start sign in
                                        <ArrowRight class="size-4" />
                                    </Link>
                                    <Link
                                        v-if="canRegister"
                                        :href="register()"
                                        class="inline-flex items-center justify-center rounded-2xl border border-[#182218]/12 bg-white/85 px-6 py-3.5 text-base font-semibold text-[#182218] transition hover:border-[#182218]/22"
                                    >
                                        Create account
                                    </Link>
                                </template>
                            </div>

                            <div class="grid gap-3 lg:grid-cols-3">
                                <article
                                    v-for="highlight in highlights"
                                    :key="highlight.title"
                                    class="rounded-[1.5rem] border border-[#182218]/8 bg-white/75 px-4 py-4 shadow-[0_14px_30px_rgba(24,34,24,0.05)]"
                                >
                                    <h2 class="text-base font-semibold text-[#182218]">
                                        {{ highlight.title }}
                                    </h2>
                                    <p class="mt-2 text-sm leading-6 text-[#5a6558]">
                                        {{ highlight.description }}
                                    </p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="hidden min-h-0 items-center justify-center p-6 lg:flex lg:p-8">
                    <div
                        class="relative flex h-full max-h-[46rem] w-full items-center justify-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#1e5c40_0%,#315f9d_100%)]"
                    >
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_35%)]" />
                        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />

                        <div class="relative flex h-96 w-96 items-center justify-center rounded-full bg-white/6">
                            <div class="absolute h-72 w-72 rounded-full border border-white/12" />
                            <div class="absolute h-52 w-52 rounded-full border border-white/16" />
                            <div class="absolute h-32 w-32 rounded-full border border-white/20" />

                            <div
                                class="absolute top-14 flex h-22 w-22 items-center justify-center rounded-full bg-white/18 text-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                            >
                                <ShieldCheck class="size-10" />
                            </div>

                            <div class="text-center text-white">
                                <p
                                    class="text-4xl font-semibold tracking-[-0.05em]"
                                    style="font-family: 'Space Grotesk', sans-serif;"
                                >
                                    Approved Zone
                                </p>
                                <p class="mt-4 text-2xl font-medium text-white/85">
                                    Your Workspace
                                </p>
                                <p class="mt-4 max-w-xs text-lg leading-8 text-white/72">
                                    Secure entry for people who are actually at the right place.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>
