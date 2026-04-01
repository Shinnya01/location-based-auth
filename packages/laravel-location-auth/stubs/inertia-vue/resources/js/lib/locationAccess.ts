export type Coordinates = {
    latitude: number;
    longitude: number;
};

export function distanceInMeters(
    from: Coordinates,
    to: Coordinates,
): number {
    const earthRadiusMeters = 6371000;
    const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
    const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
    const fromLatitudeRadians = degreesToRadians(from.latitude);
    const toLatitudeRadians = degreesToRadians(to.latitude);

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(fromLatitudeRadians) *
            Math.cos(toLatitudeRadians) *
            Math.sin(longitudeDelta / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
}

export function formatDistance(distanceMeters: number): string {
    return distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(2)} km`
        : `${Math.round(distanceMeters)} m`;
}

function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
