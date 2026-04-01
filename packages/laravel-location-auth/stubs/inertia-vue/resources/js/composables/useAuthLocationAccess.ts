import { router } from '@inertiajs/vue3';
import { computed, onMounted, ref, watch } from 'vue';
import { distanceInMeters, formatDistance } from '@/lib/locationAccess';

type LocationAccessConfig = {
    isEnabled: boolean;
    latitude: number | null;
    longitude: number | null;
    radiusMeters: number;
    deniedUrl: string;
};

type LocationAwareForm = {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    captured_at: string | null;
};

type LocationFeedback = {
    kind: 'idle' | 'locating' | 'inside' | 'outside' | 'error';
    message: string;
};

export function useAuthLocationAccess(
    locationAccess: LocationAccessConfig,
    form: LocationAwareForm,
) {
    const isResolvingLocation = ref<boolean>(false);
    const hasResolvedLocation = ref<boolean>(!locationAccess.isEnabled);
    const locationFeedback = ref<LocationFeedback | null>(null);

    const geofence = computed(() => {
        if (
            !locationAccess.isEnabled ||
            locationAccess.latitude === null ||
            locationAccess.longitude === null
        ) {
            return null;
        }

        return {
            latitude: locationAccess.latitude,
            longitude: locationAccess.longitude,
            radiusMeters: locationAccess.radiusMeters,
        };
    });

    const locationFeedbackClass = computed<string>(() => {
        if (!locationFeedback.value) {
            return 'border-slate-200 bg-slate-50 text-slate-700';
        }

        switch (locationFeedback.value.kind) {
            case 'inside':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'outside':
            case 'error':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'locating':
                return 'border-sky-200 bg-sky-50 text-sky-700';
            default:
                return 'border-slate-200 bg-slate-50 text-slate-700';
        }
    });

    watch(
        geofence,
        (value) => {
            if (!value) {
                hasResolvedLocation.value = true;
                locationFeedback.value = null;

                return;
            }

            hasResolvedLocation.value = false;
            locationFeedback.value = {
                kind: 'idle',
                message: `Access is restricted to users within ${value.radiusMeters} meters of the approved point.`,
            };
        },
        {
            immediate: true,
        },
    );

    onMounted(() => {
        if (geofence.value) {
            void ensureAllowedLocation({
                locatingMessage: 'Checking your current location before continuing...',
                insideMessage: 'Location verified. You can continue.',
            });
        }
    });

    async function ensureAllowedLocation(messages?: {
        locatingMessage?: string;
        insideMessage?: string;
    }): Promise<boolean> {
        if (!geofence.value) {
            hasResolvedLocation.value = true;

            return true;
        }

        if (!navigator.geolocation) {
            redirectToDeniedPage();

            return false;
        }

        isResolvingLocation.value = true;
        locationFeedback.value = {
            kind: 'locating',
            message:
                messages?.locatingMessage ??
                'Checking your current location before continuing...',
        };

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    const allowedLocation = {
                        latitude: geofence.value?.latitude as number,
                        longitude: geofence.value?.longitude as number,
                    };
                    const distanceMeters = distanceInMeters(
                        currentLocation,
                        allowedLocation,
                    );
                    const accuracyMeters = position.coords.accuracy;
                    const isInsideFence =
                        distanceMeters + accuracyMeters <=
                        (geofence.value?.radiusMeters as number);

                    form.latitude = currentLocation.latitude;
                    form.longitude = currentLocation.longitude;
                    form.accuracy = accuracyMeters;
                    form.captured_at = new Date().toISOString();

                    if (!isInsideFence) {
                        redirectToDeniedPage();
                        resolve(false);

                        return;
                    }

                    hasResolvedLocation.value = true;
                    isResolvingLocation.value = false;
                    locationFeedback.value = {
                        kind: 'inside',
                        message:
                            messages?.insideMessage ??
                            `Location verified at ${formatDistance(distanceMeters)} from the approved point.`,
                    };
                    resolve(true);
                },
                () => {
                    redirectToDeniedPage();
                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000,
                },
            );
        });
    }

    function redirectToDeniedPage(): void {
        isResolvingLocation.value = false;
        hasResolvedLocation.value = false;
        router.visit(locationAccess.deniedUrl, {
            replace: true,
        });
    }

    return {
        hasResolvedLocation,
        isResolvingLocation,
        locationFeedback,
        locationFeedbackClass,
        ensureAllowedLocation,
    };
}
