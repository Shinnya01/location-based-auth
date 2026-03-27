<script setup lang="ts">
import 'leaflet/dist/leaflet.css';

import { Head, useForm } from '@inertiajs/vue3';
import type { Circle, LatLngExpression, Map as LeafletMap, Marker } from 'leaflet';
import L from 'leaflet';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import LocationAccessController from '@/actions/App/Http/Controllers/Settings/LocationAccessController';
import Heading from '@/components/Heading.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatDistance } from '@/lib/locationAccess';
import { edit } from '@/routes/location-access';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

type Props = {
    locationAccess: {
        isEnabled: boolean;
        latitude: number | null;
        longitude: number | null;
        radiusMeters: number;
        maxRadiusMeters: number;
        updatedAt: string | null;
    };
};

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Location access settings',
                href: edit(),
            },
        ],
    },
});

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

const form = useForm<LocationAccessForm>(LocationAccessController.update(), {
    is_enabled: props.locationAccess.isEnabled,
    latitude: formatCoordinate(props.locationAccess.latitude),
    longitude: formatCoordinate(props.locationAccess.longitude),
    radius_meters: props.locationAccess.radiusMeters,
});

const mapContainer = ref<HTMLDivElement | null>(null);
const isMapDialogOpen = ref<boolean>(false);
const isLocatingCurrentPosition = ref<boolean>(false);
const currentLocationFeedback = ref<CurrentLocationFeedback | null>(null);

let map: LeafletMap | null = null;
let marker: Marker | null = null;
let circle: Circle | null = null;
let resizeObserver: ResizeObserver | null = null;
let hasCenteredMap = false;

const parsedLatitude = computed<number | null>(() => parseCoordinate(form.latitude));
const parsedLongitude = computed<number | null>(() => parseCoordinate(form.longitude));
const parsedRadius = computed<number>(() => {
    const numericRadius = Number(form.radius_meters);

    return Number.isFinite(numericRadius) && numericRadius > 0 ? numericRadius : 0;
});

const hasCoordinates = computed<boolean>(
    () => parsedLatitude.value !== null && parsedLongitude.value !== null,
);
const canToggleLocationRequirement = computed<boolean>(
    () => hasCoordinates.value || form.is_enabled,
);
const locationRequirement = computed<boolean>({
    get: () => form.is_enabled,
    set: (value) => {
        if (value === true && !hasCoordinates.value) {
            currentLocationFeedback.value = {
                kind: 'error',
                message: 'Set the geofence center first, then enable location-based access.',
            };

            return;
        }

        form.is_enabled = value === true;
    },
});
const locationSummary = computed<string>(() =>
    hasCoordinates.value
        ? `${form.latitude}, ${form.longitude}`
        : 'Click the map or enter coordinates to place the center point.',
);
const maxRadiusMeters = computed<number>(() => props.locationAccess.maxRadiusMeters);
const currentLocationFeedbackClass = computed<string>(() =>
    currentLocationFeedback.value?.kind === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700',
);
const lastUpdated = computed<string | null>(() => {
    if (!props.locationAccess.updatedAt) {
        return null;
    }

    return new Date(props.locationAccess.updatedAt).toLocaleString();
});

const submit = (): void => {
    form.submit(LocationAccessController.update(), {
        preserveScroll: true,
        preserveState: true,
    });
};

watch(
    isMapDialogOpen,
    async (isOpen) => {
        if (!isOpen) {
            destroyMap();

            return;
        }

        await nextTick();
        initializeMap();
    },
    {
        flush: 'post',
    },
);

onUnmounted(() => {
    destroyMap();
});

watch([parsedLatitude, parsedLongitude, parsedRadius], () => {
    syncMapLayers();
});

function syncMapLayers(): void {
    if (!map) {
        return;
    }

    if (!hasCoordinates.value) {
        marker?.remove();
        circle?.remove();
        marker = null;
        circle = null;

        return;
    }

    const center: LatLngExpression = [
        parsedLatitude.value as number,
        parsedLongitude.value as number,
    ];

    if (!marker) {
        marker = L.marker(center, {
            draggable: true,
        }).addTo(map);

        marker.on('moveend', () => {
            if (!marker) {
                return;
            }

            const position = marker.getLatLng();

            applyCoordinates(position.lat, position.lng);
        });
    } else {
        marker.setLatLng(center);
    }

    if (!circle) {
        circle = L.circle(center, {
            radius: parsedRadius.value,
            color: '#0f766e',
            fillColor: '#14b8a6',
            fillOpacity: 0.18,
            weight: 2,
        }).addTo(map);
    } else {
        circle.setLatLng(center);
        circle.setRadius(parsedRadius.value);
    }

    if (!hasCenteredMap) {
        hasCenteredMap = true;
        map.setView(center, 17);
    }
}

function applyCoordinates(latitude: number, longitude: number): void {
    form.latitude = formatCoordinate(latitude);
    form.longitude = formatCoordinate(longitude);
}

function initialMapCenter(): LatLngExpression {
    return hasCoordinates.value
        ? [parsedLatitude.value as number, parsedLongitude.value as number]
        : [0, 0];
}

function initialMapZoom(): number {
    return hasCoordinates.value ? 17 : 2;
}

function parseCoordinate(value: string): number | null {
    if (value.trim() === '') {
        return null;
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : null;
}

function formatCoordinate(value: number | null): string {
    return value === null ? '' : value.toFixed(7);
}

function configureLeafletIcons(): void {
    delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
        _getIconUrl?: unknown;
    })._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2xUrl,
        iconUrl: markerIconUrl,
        shadowUrl: markerShadowUrl,
    });
}

function invalidateMapSize(): void {
    requestAnimationFrame(() => {
        map?.invalidateSize();
    });
}

function initializeMap(): void {
    if (!mapContainer.value) {
        return;
    }

    configureLeafletIcons();

    map = L.map(mapContainer.value, {
        zoomControl: true,
    }).setView(initialMapCenter(), initialMapZoom());

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    map.on('click', (event) => {
        applyCoordinates(event.latlng.lat, event.latlng.lng);
        hasCenteredMap = true;
        map?.setView(event.latlng, Math.max(map.getZoom(), 17));
    });

    resizeObserver = new ResizeObserver(() => {
        invalidateMapSize();
    });
    resizeObserver.observe(mapContainer.value);

    syncMapLayers();
    invalidateMapSize();
}

function destroyMap(): void {
    resizeObserver?.disconnect();
    resizeObserver = null;
    map?.remove();
    map = null;
    marker = null;
    circle = null;
    hasCenteredMap = false;
}

function useCurrentLocation(): void {
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
            const { latitude, longitude, accuracy } = position.coords;

            applyCoordinates(latitude, longitude);
            hasCenteredMap = true;
            map?.setView([latitude, longitude], Math.max(map?.getZoom() ?? 2, 17));

            currentLocationFeedback.value = {
                kind: 'success',
                message: `Current location loaded with ${formatDistance(accuracy)} accuracy.`,
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

    <h1 class="sr-only">Location access settings</h1>

    <div class="space-y-6 flex-1 w-full">
        <Heading variant="small" title="Location-based access"
            description="Manage the single geofence that controls who can sign in or register in the app." />

        <form class="space-y-6" @submit.prevent="submit">
            <Card>
                <CardHeader>
                    <div class="flex w-full items-start justify-between gap-4">
                        <div class="min-w-0 space-y-1.5">
                            <CardTitle>Access controls</CardTitle>
                            <CardDescription>
                                Set the geofence center and radius here, then open the map editor
                                only when you need it.
                            </CardDescription>
                        </div>

                        <Button type="button" variant="outline" class="shrink-0" @click="isMapDialogOpen = true">
                            Open map editor
                        </Button>
                    </div>
                </CardHeader>

                <CardContent class="space-y-6">
                    <div class="grid gap-4 sm:grid-cols-3">
                        <div class="rounded-2xl border bg-muted/30 px-4 py-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Status
                            </p>
                            <p class="mt-3 text-2xl font-semibold text-foreground">
                                {{ form.is_enabled ? 'Enabled' : 'Disabled' }}
                            </p>
                            <p class="mt-2 text-sm text-muted-foreground">
                                {{ form.is_enabled ? 'Users must be inside the allowed area.' : 'Location checks stay off until you enable them.' }}
                            </p>
                        </div>

                        <div class="rounded-2xl border bg-muted/30 px-4 py-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Radius
                            </p>
                            <p class="mt-3 text-2xl font-semibold text-foreground">
                                {{ Number(form.radius_meters || 0) }}m
                            </p>
                            <p class="mt-2 text-sm text-muted-foreground">
                                The map circle will follow this radius live in the editor.
                            </p>
                        </div>

                        <div class="rounded-2xl border bg-muted/30 px-4 py-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Last updated
                            </p>
                            <p class="mt-3 text-lg font-semibold text-foreground">
                                {{ lastUpdated ?? 'Not saved yet' }}
                            </p>
                            <p class="mt-2 text-sm text-muted-foreground">
                                Saved settings apply to both login and registration.
                            </p>
                        </div>
                    </div>

                    <div class="rounded-2xl border bg-muted/25 p-4">
                        <div class="flex items-start gap-3">
                            <Checkbox v-model="locationRequirement" :disabled="!canToggleLocationRequirement"
                                class="mt-1" />
                            <div class="grid gap-1">
                                <p class="text-sm font-medium text-foreground">
                                    Require location for access
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    Applies to login and registration for every user.
                                </p>
                                <p v-if="!hasCoordinates && !form.is_enabled" class="text-xs text-amber-700">
                                    Pick a location first using the map or Use my location.
                                </p>
                            </div>
                            <InputError :message="form.errors.is_enabled" />
                        </div>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="grid gap-2">
                            <Label for="latitude">Latitude</Label>
                            <Input id="latitude" v-model="form.latitude" name="latitude" type="number"
                                step="0.0000001" placeholder="e.g. 14.5995123" />
                            <InputError :message="form.errors.latitude" />
                        </div>

                        <div class="grid gap-2">
                            <Label for="longitude">Longitude</Label>
                            <Input id="longitude" v-model="form.longitude" name="longitude" type="number"
                                step="0.0000001" placeholder="e.g. 120.9842222" />
                            <InputError :message="form.errors.longitude" />
                        </div>
                    </div>

                    <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
                        <div class="grid gap-2">
                            <Label for="radius_meters">Radius in meters</Label>
                            <Input id="radius_meters" v-model="form.radius_meters" name="radius_meters"
                                type="number" min="1" :max="maxRadiusMeters" />
                            <InputError :message="form.errors.radius_meters" />
                        </div>

                        <div class="grid gap-2">
                            <Label>Quick actions</Label>
                            <Button type="button" variant="outline" class="sm:w-auto"
                                :disabled="isLocatingCurrentPosition" @click="useCurrentLocation">
                                <Spinner v-if="isLocatingCurrentPosition" />
                                {{ isLocatingCurrentPosition ? 'Finding your location...' : 'Use my location' }}
                            </Button>
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <Button type="submit" :disabled="form.processing">
                            Save location access
                        </Button>

                        <Transition enter-active-class="transition ease-in-out" enter-from-class="opacity-0"
                            leave-active-class="transition ease-in-out" leave-to-class="opacity-0">
                            <p v-show="form.recentlySuccessful" class="text-sm text-neutral-600">
                                Saved.
                            </p>
                        </Transition>
                    </div>
                </CardContent>
            </Card>
        </form>

        <Dialog :open="isMapDialogOpen" @update:open="isMapDialogOpen = $event">
            <DialogContent
                class="w-full max-w-[calc(100vw-1rem)] overflow-hidden p-0 sm:max-w-[calc(100vw-2rem)] xl:max-w-[min(94vw,96rem)]"
            >
                <div class="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div class="space-y-5 border-b p-6 xl:border-r xl:border-b-0">
                        <DialogHeader class="space-y-3 text-left">
                            <DialogTitle>Geofence map editor</DialogTitle>
                            <DialogDescription>
                                Drag the marker or click anywhere on the map to reposition the geofence.
                                The circle updates live as the radius changes.
                            </DialogDescription>
                        </DialogHeader>

                        <div class="space-y-4">
                            <div class="rounded-2xl border bg-muted/30 px-4 py-4 text-sm">
                                <p class="font-medium text-foreground">Center point</p>
                                <p class="mt-2 text-muted-foreground">
                                    {{ locationSummary }}
                                </p>
                            </div>

                            <div class="rounded-2xl border bg-muted/30 px-4 py-4 text-sm">
                                <p class="font-medium text-foreground">Radius preview</p>
                                <p class="mt-2 text-muted-foreground">
                                    {{ Number(form.radius_meters || 0) }} meters
                                </p>
                            </div>

                            <Button type="button" variant="outline" class="w-full justify-center"
                                :disabled="isLocatingCurrentPosition" @click="useCurrentLocation">
                                <Spinner v-if="isLocatingCurrentPosition" />
                                {{ isLocatingCurrentPosition ? 'Finding your location...' : 'Use my location' }}
                            </Button>

                            <Button type="button" class="w-full justify-center" :disabled="form.processing"
                                @click="submit">
                                <Spinner v-if="form.processing" />
                                Save location access
                            </Button>

                            <Transition enter-active-class="transition ease-in-out" enter-from-class="opacity-0"
                                leave-active-class="transition ease-in-out" leave-to-class="opacity-0">
                                <p v-show="form.recentlySuccessful" class="text-sm text-emerald-700">
                                    Saved without closing the map editor.
                                </p>
                            </Transition>

                            <div v-if="currentLocationFeedback" :class="[
                                'rounded-xl border px-4 py-3 text-sm',
                                currentLocationFeedbackClass,
                            ]">
                                {{ currentLocationFeedback.message }}
                            </div>

                            <p class="text-xs leading-6 text-muted-foreground">
                                Tip: click the map to drop the center instantly, or use your browser
                                location to move the marker to your current position.
                            </p>
                        </div>
                    </div>

                    <div class="p-4 sm:p-5 xl:p-6">
                        <div
                            ref="mapContainer"
                            class="h-[min(54vh,26rem)] w-full rounded-[1.75rem] border bg-muted sm:h-[min(60vh,34rem)] xl:h-[min(76vh,48rem)]"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
