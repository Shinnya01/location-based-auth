<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useAuthLocationAccess } from '@/composables/useAuthLocationAccess';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    forgotPasswordUrl: string | null;
    registerUrl: string | null;
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

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    captured_at: string | null;
};

const props = defineProps<Props>();

const form = useForm<LoginForm>({
    email: '',
    password: '',
    remember: false,
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
        locatingMessage: 'Checking your current location before signing you in...',
        insideMessage: 'Location verified. Finishing sign-in now.',
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
    <Head title="Log in" />

    <div class="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div class="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div class="space-y-2">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Location Auth
                </p>
                <h1 class="text-3xl font-semibold text-slate-950">Log in</h1>
                <p class="text-sm text-slate-600">
                    Sign in with your account and verify your location when required.
                </p>
            </div>

            <div
                v-if="status"
                class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
                {{ status }}
            </div>

            <form class="mt-8 space-y-5" @submit.prevent="submit">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="email">Email address</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required
                        autofocus
                        autocomplete="email"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="email@example.com"
                    />
                    <p v-if="form.errors.email" class="text-sm text-red-600">
                        {{ form.errors.email }}
                    </p>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-4">
                        <label class="text-sm font-medium text-slate-800" for="password">Password</label>
                        <Link
                            v-if="canResetPassword && forgotPasswordUrl"
                            :href="forgotPasswordUrl"
                            class="text-sm text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        autocomplete="current-password"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="Password"
                    />
                    <p v-if="form.errors.password" class="text-sm text-red-600">
                        {{ form.errors.password }}
                    </p>
                </div>

                <label class="flex items-center gap-3 text-sm text-slate-700">
                    <input
                        v-model="form.remember"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    <span>Remember me</span>
                </label>

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
                    {{ form.processing || isResolvingLocation ? 'Checking...' : 'Log in' }}
                </button>
            </form>

            <p
                v-if="canRegister && registerUrl"
                class="mt-6 text-center text-sm text-slate-600"
            >
                Don't have an account?
                <Link :href="registerUrl" class="font-medium text-slate-950 underline-offset-4 hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    </div>
</template>
