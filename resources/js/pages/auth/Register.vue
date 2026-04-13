<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLocationAccess } from '@/composables/useAuthLocationAccess';
import { login } from '@/routes';
import { store } from '@/routes/register';

defineOptions({
    layout: {
        title: 'Create an account',
        description: 'Enter your details below to create your account',
    },
});

type Props = {
    locationAccess: {
        isEnabled: boolean;
        latitude: number | null;
        longitude: number | null;
        radiusMeters: number;
        maxAgeSeconds: number;
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

const form = useForm<RegisterForm>(store(), {
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

    form.submit({
        preserveScroll: true,
    });
};
</script>

<template>
    <Head title="Register" />

    <form class="flex flex-col gap-6" @submit.prevent="submit">
        <div class="grid gap-6">
            <div class="grid gap-2">
                <Label for="name">Full name</Label>
                <Input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    autofocus
                    :tabindex="1"
                    autocomplete="name"
                    placeholder="Jane Doe"
                />
                <InputError :message="form.errors.name" />
            </div>

            <div class="grid gap-2">
                <Label for="email">Email address</Label>
                <Input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    :tabindex="2"
                    autocomplete="email"
                    placeholder="email@example.com"
                />
                <InputError :message="form.errors.email" />
            </div>

            <div class="grid gap-2">
                <Label for="password">Password</Label>
                <PasswordInput
                    id="password"
                    v-model="form.password"
                    required
                    :tabindex="3"
                    autocomplete="new-password"
                    placeholder="Password"
                />
                <InputError :message="form.errors.password" />
            </div>

            <div class="grid gap-2">
                <Label for="password_confirmation">Confirm password</Label>
                <PasswordInput
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    required
                    :tabindex="4"
                    autocomplete="new-password"
                    placeholder="Confirm password"
                />
                <InputError :message="form.errors.password_confirmation" />
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
                :tabindex="5"
                :disabled="form.processing || isResolvingLocation || !hasResolvedLocation"
            >
                <Spinner v-if="form.processing || isResolvingLocation" />
                Create account
            </Button>
        </div>

        <div class="text-center text-sm text-muted-foreground">
            Already have an account?
            <TextLink :href="login()" :tabindex="6">Log in</TextLink>
        </div>
    </form>
</template>
