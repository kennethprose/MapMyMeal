import * as L from "leaflet";

// Icons from: https://www.flaticon.com/authors/dinosoft/circular?author_id=205&type=standard
const iconNames = ["burger", "cutlery"];
const icons = {};

iconNames.forEach((iconName) => {
	try {
		const iconUrl = require(`../icons/${iconName}.png`);

		icons[iconName] = L.icon({
			iconUrl: iconUrl,
			iconSize: [50, 50],
			iconAnchor: [25, 25],
			popupAnchor: [0, -35],
		});
	} catch (error) {
		console.error(`Error loading icon ${iconName}:`, error);
	}
});

export default icons;
