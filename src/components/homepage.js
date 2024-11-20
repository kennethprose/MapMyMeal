import { useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabaseClient";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import ListGroup from "react-bootstrap/ListGroup";
import { List, BoxArrowRight } from "react-bootstrap-icons";

import Map from "./map";

export function Homepage() {
	const [show, setShow] = useState(false);
	const mapRef = useRef();

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

	const moveToMarker = (lat, lng, zoom = 13) => {
		if (mapRef.current) {
			mapRef.current.flyTo([lat, lng], zoom);
			handleClose();
		}
	};

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
					<ListGroup>
						{markers &&
							markers.map((marker) => (
								<ListGroup.Item
									onClick={() =>
										moveToMarker(marker.latitude, marker.longitude, 15)
									}
								>
									<h1>{marker.name}</h1>
									<h3>{marker.description}</h3>
									<h3>{marker.cuisine}</h3>
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
			<Map id="map" ref={mapRef} markers={markers} />
		</>
	);
}
