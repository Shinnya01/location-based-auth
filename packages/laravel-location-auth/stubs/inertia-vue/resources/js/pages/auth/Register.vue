<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useAuthLocationAccess } from '@/composables/useAuthLocationAccess';

type Props = {
    loginUrl: string;
    submitUrl: string;
    locationAccess: {
        isEnabled: boolean;
        latitude: number | null;
        longitude: number | null;
        radiusMeters: number;
        maxAgeSeconds: number;
        deniedUrl: string;
    };
};

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    captured_at: string | null;
};

const props = defineProps<Props>();

const form = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    latitude: null,
    longitude: null,
    accuracy: null,
    captured_at: null,
});

const {
    hasResolvedLocation,
    isResolvingLocation,
    locationFeedback,
    locationFeedbackClass,
    ensureAllowedLocation,
} = useAuthLocationAccess(props.locationAccess, form);

const submit = async (): Promise<void> => {
    const isAllowedLocation = await ensureAllowedLocation({
        locatingMessage: 'Checking your current location before creating your account...',
        insideMessage: 'Location verified. Creating your account now.',
    });

    if (!isAllowedLocation) {
        return;
    }

    form.post(props.submitUrl, {
        preserveScroll: true,
    });
};
</script>

<template>
    <Head title="Register" />

    <div class="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div class="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div class="space-y-2">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Location Auth
                </p>
                <h1 class="text-3xl font-semibold text-slate-950">Create account</h1>
                <p class="text-sm text-slate-600">
                    Create your account and verify your location when access control is enabled.
                </p>
            </div>

            <form class="mt-8 space-y-5" @submit.prevent="submit">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="name">Full name</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        required
                        autofocus
                        autocomplete="name"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="Jane Doe"
                    />
                    <p v-if="form.errors.name" class="text-sm text-red-600">
                        {{ form.errors.name }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="email">Email address</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required
                        autocomplete="email"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="email@example.com"
                    />
                    <p v-if="form.errors.email" class="text-sm text-red-600">
                        {{ form.errors.email }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="password">Password</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        autocomplete="new-password"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="Password"
                    />
                    <p v-if="form.errors.password" class="text-sm text-red-600">
                        {{ form.errors.password }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="password_confirmation">
                        Confirm password
                    </label>
                    <input
                        id="password_confirmation"
                        v-model="form.password_confirmation"
                        type="password"
                        required
                        autocomplete="new-password"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="Confirm password"
                    />
                    <p v-if="form.errors.password_confirmation" class="text-sm text-red-600">
                        {{ form.errors.password_confirmation }}
                    </p>
                </div>

                <div
                    v-if="locationFeedback"
                    :class="['rounded-2xl border px-4 py-3 text-sm', locationFeedbackClass]"
                >
                    {{ locationFeedback.message }}
                </div>

                <button
                    type="submit"
                    class="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    :disabled="form.processing || isResolvingLocation || !hasResolvedLocation"
                >
                    {{ form.processing || isResolvingLocation ? 'Checking...' : 'Create account' }}
                </button>
            </form>

            <p class="mt-6 text-center text-sm text-slate-600">
                Already have an account?
                <Link :href="loginUrl" class="font-medium text-slate-950 underline-offset-4 hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    </div>
</template>
