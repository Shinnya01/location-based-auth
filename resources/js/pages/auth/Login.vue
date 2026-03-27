<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import type { CheckboxCheckedState } from 'reka-ui';
import { computed } from 'vue';
import InputError from '@/components/InputError.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { useAuthLocationAccess } from '@/composables/useAuthLocationAccess';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

defineOptions({
    layout: {
        title: 'Log in to your account',
        description: 'Enter your email and password below to log in',
    },
});

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    locationAccess: {
        isEnabled: boolean;
        latitude: number | null;
        longitude: number | null;
        radiusMeters: number;
        maxAgeSeconds: number;
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

const form = useForm<LoginForm>(store(), {
    email: '',
    password: '',
    remember: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    captured_at: null,
});
const rememberState = computed<CheckboxCheckedState>({
    get: () => form.remember,
    set: (value) => {
        form.remember = value === true;
    },
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

    form.submit({
        preserveScroll: true,
    });
};

</script>

<template>
    <Head title="Log in" />

    <div
        v-if="status"
        class="mb-4 text-center text-sm font-medium text-green-600"
    >
        {{ status }}
    </div>

    <form class="flex flex-col gap-6" @submit.prevent="submit">
        <div class="grid gap-6">
            <div class="grid gap-2">
                <Label for="email">Email address</Label>
                <Input
                    id="email"
                    type="email"
                    v-model="form.email"
                    required
                    autofocus
                    :tabindex="1"
                    autocomplete="email"
                    placeholder="email@example.com"
                />
                <InputError :message="form.errors.email" />
            </div>

            <div class="grid gap-2">
                <div class="flex items-center justify-between">
                    <Label for="password">Password</Label>
                    <TextLink
                        v-if="canResetPassword"
                        :href="request()"
                        class="text-sm"
                        :tabindex="5"
                    >
                        Forgot password?
                    </TextLink>
                </div>
                <PasswordInput
                    id="password"
                    v-model="form.password"
                    required
                    :tabindex="2"
                    autocomplete="current-password"
                    placeholder="Password"
                />
                <InputError :message="form.errors.password" />
            </div>

            <div class="flex items-center justify-between">
                <Label for="remember" class="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        v-model="rememberState"
                        :tabindex="3"
                    />
                    <span>Remember me</span>
                </Label>
            </div>

            <div
                v-if="locationFeedback"
                :class="['rounded-lg border px-4 py-3 text-sm', locationFeedbackClass]"
            >
                {{ locationFeedback.message }}
            </div>

            <Button
                type="submit"
                class="mt-4 w-full"
                :tabindex="4"
                :disabled="form.processing || isResolvingLocation || !hasResolvedLocation"
                data-test="login-button"
            >
                <Spinner v-if="form.processing || isResolvingLocation" />
                Log in
            </Button>
        </div>

        <div
            class="text-center text-sm text-muted-foreground"
            v-if="canRegister"
        >
            Don't have an account?
            <TextLink :href="register()" :tabindex="5">Sign up</TextLink>
        </div>
    </form>
</template>

