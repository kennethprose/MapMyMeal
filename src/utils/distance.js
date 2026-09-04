const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}

export function getDistanceInMiles(lat1, lon1, lat2, lon2) {
	const coordinates = [lat1, lon1, lat2, lon2].map(Number);

	if (!coordinates.every(Number.isFinite)) return null;

	const [startLat, startLon, endLat, endLon] = coordinates;
	const latitudeDifference = toRadians(endLat - startLat);
	const longitudeDifference = toRadians(endLon - startLon);

	const a =
		Math.sin(latitudeDifference / 2) ** 2 +
		Math.cos(toRadians(startLat)) *
			Math.cos(toRadians(endLat)) *
			Math.sin(longitudeDifference / 2) ** 2;
	const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS_MILES * centralAngle;
}
