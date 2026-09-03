import * as L from "leaflet";
import burgerIconUrl from "../icons/burger.png";
import cutleryIconUrl from "../icons/cutlery.png";

// Icons from: https://www.flaticon.com/authors/dinosoft/circular?author_id=205&type=standard
const createIcon = (iconUrl) =>
	L.icon({
		iconUrl,
		iconSize: [50, 50],
		iconAnchor: [25, 25],
		popupAnchor: [0, -35],
	});

const icons = {
	burger: createIcon(burgerIconUrl),
	cutlery: createIcon(cutleryIconUrl),
};

export default icons;
