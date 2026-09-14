export function getGoogleMapsDirectionsUrl(latitude, longitude) {
	const lat = Number(latitude);
	const lng = Number(longitude);

	if (
		!Number.isFinite(lat) ||
		!Number.isFinite(lng) ||
		lat < -90 ||
		lat > 90 ||
		lng < -180 ||
		lng > 180
	) {
		return null;
	}

	return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
