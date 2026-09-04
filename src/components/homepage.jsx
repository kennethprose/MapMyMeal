import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../config/supabaseClient";
import { Offcanvas, ListGroup, Button, Dropdown } from "react-bootstrap";
import { List, BoxArrowRight, GeoAltFill } from "react-bootstrap-icons";
import { getDistanceInMiles } from "../utils/distance";
import { cuisines } from "./cuisines";

import Map from "./map";

export function Homepage() {
	const [show, setShow] = useState(false);
	const [sortOrder, setSortOrder] = useState("distance");
	const [filterCategory, setFilterCategory] = useState("all");
	const [userLocation, setUserLocation] = useState(null);
	const [locationMessage, setLocationMessage] = useState("");
	const mapRef = useRef();
	const locationRequestId = useRef(0);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			console.log("User logged out successfully");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	const [markers, setMarkers] = useState([]);

	const loadMarkers = async () => {
		const { data, error } = await supabase.from("markers").select("*");

		if (error) console.error("Error fetching markers:", error);
		else setMarkers(data);
	};

	useEffect(() => {
		loadMarkers();

		const channel = supabase
			.channel("schema-db-changes")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public" },
				(payload) => {
					setMarkers((prevMarkers) => [...prevMarkers, payload.new]);
				}
			)
			.subscribe();

		// Cleanup the subscription when the component unmounts
		return () => {
			channel.unsubscribe();
		};
	}, []);

	const moveToMarker = useCallback((lat, lng, zoom = 13) => {
		if (mapRef.current) {
			mapRef.current.flyTo([lat, lng], zoom);
			handleClose();
		}
	}, []);

	const getUserLocation = useCallback(async () => {
		const requestId = ++locationRequestId.current;
		console.log("Attempting to get user's location...");

		if (!window.isSecureContext) {
			const message = "Location requires HTTPS (or localhost).";
			console.error(message);
			setLocationMessage(message);
			return;
		}

		if (!navigator.geolocation) {
			const message = "Geolocation is not supported by this browser.";
			console.error(message);
			setLocationMessage(message);
			return;
		}

		console.log("Geolocation is supported by this browser.");

		let permissionState;
		if (navigator.permissions) {
			try {
				const permission = await navigator.permissions.query({
					name: "geolocation",
				});
				permissionState = permission.state;
				console.log(`Geolocation permission state: ${permission.state}`);
			} catch (error) {
				console.debug("Could not query geolocation permission state.", error);
			}
		}

		// A button click may supersede a page-load request that is still pending.
		if (requestId !== locationRequestId.current) return;

		setLocationMessage(
			permissionState === "prompt"
				? "Allow location access in your browser to show your position."
				: "Finding your location..."
		);
		let requestFinished = false;

		navigator.geolocation.getCurrentPosition(
			// On success
			(position) => {
				requestFinished = true;
				if (requestId !== locationRequestId.current) return;

				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
				setUserLocation([latitude, longitude]);
				setLocationMessage("");
				moveToMarker(latitude, longitude, 14);
			},
			// On failure
			(error) => {
				requestFinished = true;
				if (requestId !== locationRequestId.current) return;

				let message;
				switch (error.code) {
					case 1:
						message =
							"Location access was denied. Allow it in your browser settings and try again.";
						break;
					case 2:
						message =
							"Your device could not determine its location. Check your device's location settings.";
						break;
					case 3:
						message = "The request to get your location timed out.";
						break;
					default:
						message = "An unexpected location error occurred.";
				}

				console.error(`${message} (${error.code}: ${error.message})`);
				setLocationMessage(message);
			},
			{
				enableHighAccuracy: false,
				//maximumAge: 300000,
			}
		);
	}, [moveToMarker]);

	useEffect(() => {
		// Scheduling the request avoids React Strict Mode issuing it twice in development.
		const initialLocationTimer = window.setTimeout(getUserLocation, 0);

		return () => {
			window.clearTimeout(initialLocationTimer);
			locationRequestId.current += 1;
		};
	}, [getUserLocation]);

	const handleSortChange = (order) => setSortOrder(order);
	const handleFilterChange = (category) => setFilterCategory(category);

	const markersWithDistance = markers.map((marker) => ({
		...marker,
		distanceMiles: userLocation
			? getDistanceInMiles(
					userLocation[0],
					userLocation[1],
					marker.latitude,
					marker.longitude
				)
			: null,
	}));

	const sortedMarkers = [...markersWithDistance].sort((a, b) => {
		if (sortOrder === "distance") {
			if (a.distanceMiles === null && b.distanceMiles === null) return 0;
			if (a.distanceMiles === null) return 1;
			if (b.distanceMiles === null) return -1;

			return a.distanceMiles - b.distanceMiles;
		}

		if (sortOrder === "alphabetical") {
			return a.name.localeCompare(b.name);
		}
		return 0;
	});

	const filteredMarkers = sortedMarkers.filter((marker) => {
		if (filterCategory === "all") {
			return true;
		}
		return cuisines.find(
			(cuisine) =>
				cuisine.id === Number(marker.cuisine) &&
				cuisine.label === filterCategory
		);
	});

	return (
		<>
			<Button
				variant="light"
				id="offcanvas-btn"
				className="overlay"
				onClick={handleShow}
			>
				<List color="black" size={30} />
			</Button>
			<Offcanvas show={show} onHide={handleClose}>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Markers</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<div style={{ marginBottom: "10px", display: "flex" }}>
						<Dropdown onSelect={handleSortChange}>
							<Dropdown.Toggle variant="secondary" id="dropdown-sort">
								Sort
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item
									eventKey="distance"
									active={sortOrder === "distance"}
								>
									Distance
								</Dropdown.Item>
								<Dropdown.Item
									eventKey="alphabetical"
									active={sortOrder === "alphabetical"}
								>
									Alphabetical
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						<Dropdown
							onSelect={handleFilterChange}
							style={{ marginLeft: "10px" }}
						>
							<Dropdown.Toggle variant="secondary" id="dropdown-filter">
								Cuisine
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item eventKey="all" active={filterCategory === "all"}>
									All
								</Dropdown.Item>
								{cuisines.map((cuisine) => (
									<Dropdown.Item
										key={cuisine.id}
										eventKey={cuisine.label}
										active={filterCategory === cuisine.label}
									>
										{cuisine.label}
									</Dropdown.Item>
								))}
							</Dropdown.Menu>
						</Dropdown>
					</div>
					<ListGroup>
						{filteredMarkers &&
							filteredMarkers.map((marker) => (
								<ListGroup.Item
									key={marker.id}
									onClick={() =>
										moveToMarker(marker.latitude, marker.longitude, 15)
									}
									style={{
										marginBottom: "10px",
										border: "1px solid #ddd",
										borderRadius: "5px",
										padding: "10px",
										cursor: "pointer",
										boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									}}
								>
									<h2 style={{ margin: "0 0 5px 0" }}>{marker.name}</h2>
									<p style={{ margin: "0 0 5px 0", color: "#555" }}>
										{marker.description}
									</p>
									<div className="marker-list-meta">
										<p>
											{cuisines.find(
												(cuisine) => cuisine.id === Number(marker.cuisine)
											)?.label ?? "Other"}
										</p>
										{marker.distanceMiles !== null && (
											<p className="marker-list-distance">
												{marker.distanceMiles.toFixed(1)} mi
											</p>
										)}
									</div>
								</ListGroup.Item>
							))}
					</ListGroup>
				</Offcanvas.Body>
			</Offcanvas>
			<Button
				variant="light"
				id="logout-btn"
				className="overlay"
				onClick={handleLogout}
			>
				<BoxArrowRight color="black" size={30} />
			</Button>
			<Button
				type="button"
				variant="light"
				id="location-btn"
				className="overlay"
				onClick={getUserLocation}
				aria-label="Center map on your location"
				title="Center map on your location"
			>
				<GeoAltFill color="black" size={30} />
			</Button>
			{locationMessage && (
				<div id="location-status" role="status" aria-live="polite">
					{locationMessage}
				</div>
			)}
			<Map
				id="map"
				ref={mapRef}
				markers={markers}
				userLocation={userLocation}
			/>
		</>
	);
}
