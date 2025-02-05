import { useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabaseClient";
import { Offcanvas, ListGroup, Button, Dropdown } from "react-bootstrap";
import { List, BoxArrowRight } from "react-bootstrap-icons";
import { cuisines } from "./cuisines";

import Map from "./map";

export function Homepage() {
	const [show, setShow] = useState(false);
	const [sortOrder, setSortOrder] = useState("none");
	const [filterCategory, setFilterCategory] = useState("all");
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

	const handleSortChange = (order) => setSortOrder(order);
	const handleFilterChange = (category) => setFilterCategory(category);

	const sortedMarkers = [...markers].sort((a, b) => {
		if (sortOrder === "alphabetical") {
			return a.name.localeCompare(b.name);
		}
		return 0;
	});

	const filteredMarkers = sortedMarkers.filter((marker) => {
		if (filterCategory === "all") {
			return true;
		}
		return (
			cuisines.find((cuisine) => cuisine.id === marker.cuisine).label ===
			filterCategory
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
								<Dropdown.Item eventKey="none" active={sortOrder === "none"}>
									None
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
								Filter
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
							filteredMarkers.map((marker, index) => (
								<ListGroup.Item
									key={index}
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
									<p style={{ margin: "0", color: "#888" }}>
										{
											cuisines.find((cuisine) => cuisine.id === marker.cuisine)
												.label
										}
									</p>
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
