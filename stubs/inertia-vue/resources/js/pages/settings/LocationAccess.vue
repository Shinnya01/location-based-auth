<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { formatDistance } from '@/lib/locationAccess';

type Props = {
    updateUrl: string;
    locationAccess: {
        isEnabled: boolean;
        latitude: number | null;
        longitude: number | null;
        radiusMeters: number;
        maxRadiusMeters: number;
        updatedAt: string | null;
    };
};

type LocationAccessForm = {
    is_enabled: boolean;
    latitude: string;
    longitude: string;
    radius_meters: number | string;
};

type CurrentLocationFeedback = {
    kind: 'success' | 'error';
    message: string;
};

const props = defineProps<Props>();

const form = useForm<LocationAccessForm>({
    is_enabled: props.locationAccess.isEnabled,
    latitude: formatCoordinate(props.locationAccess.latitude),
    longitude: formatCoordinate(props.locationAccess.longitude),
    radius_meters: props.locationAccess.radiusMeters,
});

const isLocatingCurrentPosition = ref<boolean>(false);
const currentLocationFeedback = ref<CurrentLocationFeedback | null>(null);

const lastUpdated = computed<string | null>(() => {
    if (!props.locationAccess.updatedAt) {
        return null;
    }

    return new Date(props.locationAccess.updatedAt).toLocaleString();
});

const canEnableLocationRequirement = computed<boolean>(() => {
    return form.latitude.trim() !== '' && form.longitude.trim() !== '';
});

const currentLocationFeedbackClass = computed<string>(() => {
    return currentLocationFeedback.value?.kind === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';
});

const submit = (): void => {
    form.put(props.updateUrl, {
        preserveScroll: true,
    });
};

const useCurrentLocation = (): void => {
    currentLocationFeedback.value = null;

    if (!navigator.geolocation) {
        currentLocationFeedback.value = {
            kind: 'error',
            message: 'This browser cannot access your current location.',
        };

        return;
    }

    isLocatingCurrentPosition.value = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            form.latitude = formatCoordinate(position.coords.latitude);
            form.longitude = formatCoordinate(position.coords.longitude);

            currentLocationFeedback.value = {
                kind: 'success',
                message: `Current location loaded with ${formatDistance(position.coords.accuracy)} accuracy.`,
            };

            isLocatingCurrentPosition.value = false;
        },
        (error) => {
            currentLocationFeedback.value = {
                kind: 'error',
                message: geolocationErrorMessage(error),
            };

            isLocatingCurrentPosition.value = false;
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
        },
    );
};

function formatCoordinate(value: number | null): string {
    return value === null ? '' : value.toFixed(7);
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location permission was denied.';
        case error.POSITION_UNAVAILABLE:
            return 'Your current location could not be determined.';
        case error.TIMEOUT:
            return 'Finding your current location took too long. Please try again.';
        default:
            return 'Your current location could not be retrieved.';
    }
}
</script>

<template>
    <Head title="Location access settings" />

    <div class="mx-auto w-full max-w-4xl px-6 py-10">
        <div class="space-y-3">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Location Auth
            </p>
            <h1 class="text-3xl font-semibold text-slate-950">Location access settings</h1>
            <p class="text-sm leading-7 text-slate-600">
                Save the center point and radius that control who may sign in or register.
            </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="submit">
            <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Status
                    </p>
                    <p class="mt-3 text-2xl font-semibold text-slate-950">
                        {{ form.is_enabled ? 'Enabled' : 'Disabled' }}
                    </p>
                </div>

                <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Radius
                    </p>
                    <p class="mt-3 text-2xl font-semibold text-slate-950">
                        {{ Number(form.radius_meters || 0) }}m
                    </p>
                </div>

                <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Last updated
                    </p>
                    <p class="mt-3 text-lg font-semibold text-slate-950">
                        {{ lastUpdated ?? 'Not saved yet' }}
                    </p>
                </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <label class="flex items-start gap-3">
                    <input
                        v-model="form.is_enabled"
                        type="checkbox"
                        class="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                        :disabled="!canEnableLocationRequirement && !form.is_enabled"
                    />
                    <span class="space-y-1">
                        <span class="block text-sm font-medium text-slate-900">
                            Require location for access
                        </span>
                        <span class="block text-sm text-slate-600">
                            Applies to login and registration for every user.
                        </span>
                        <span
                            v-if="!canEnableLocationRequirement && !form.is_enabled"
                            class="block text-xs text-amber-700"
                        >
                            Add both coordinates first before enabling location checks.
                        </span>
                    </span>
                </label>
                <p v-if="form.errors.is_enabled" class="mt-2 text-sm text-red-600">
                    {{ form.errors.is_enabled }}
                </p>
            </div>

            <div class="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="latitude">Latitude</label>
                    <input
                        id="latitude"
                        v-model="form.latitude"
                        type="number"
                        step="0.0000001"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="e.g. 14.5995123"
                    />
                    <p v-if="form.errors.latitude" class="text-sm text-red-600">
                        {{ form.errors.latitude }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="longitude">Longitude</label>
                    <input
                        id="longitude"
                        v-model="form.longitude"
                        type="number"
                        step="0.0000001"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                        placeholder="e.g. 120.9842222"
                    />
                    <p v-if="form.errors.longitude" class="text-sm text-red-600">
                        {{ form.errors.longitude }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-800" for="radius_meters">Radius in meters</label>
                    <input
                        id="radius_meters"
                        v-model="form.radius_meters"
                        type="number"
                        min="1"
                        :max="locationAccess.maxRadiusMeters"
                        class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                    />
                    <p v-if="form.errors.radius_meters" class="text-sm text-red-600">
                        {{ form.errors.radius_meters }}
                    </p>
                </div>

                <div class="space-y-2">
                    <span class="block text-sm font-medium text-slate-800">Quick actions</span>
                    <button
                        type="button"
                        class="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-500"
                        :disabled="isLocatingCurrentPosition"
                        @click="useCurrentLocation"
                    >
                        {{ isLocatingCurrentPosition ? 'Finding your location...' : 'Use my location' }}
                    </button>
                </div>
            </div>

            <div
                v-if="currentLocationFeedback"
                :class="['rounded-2xl border px-4 py-3 text-sm', currentLocationFeedbackClass]"
            >
                {{ currentLocationFeedback.message }}
            </div>

            <div class="flex items-center gap-4">
                <button
                    type="submit"
                    class="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    :disabled="form.processing"
                >
                    {{ form.processing ? 'Saving...' : 'Save location access' }}
                </button>

                <p v-if="form.recentlySuccessful" class="text-sm text-emerald-700">
                    Saved.
                </p>
            </div>
        </form>
    </div>
</template>
