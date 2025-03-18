import {
	React,
	useState,
	forwardRef,
	useImperativeHandle,
	useRef,
} from "react";
import {
	MapContainer,
	TileLayer,
	useMapEvents,
	ZoomControl,
	Marker,
	Popup,
} from "react-leaflet";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import { supabase } from "../config/supabaseClient";
import icons from "./icons";
import { cuisines } from "./cuisines";

export const Map = forwardRef(({ markers }, ref) => {
	const [lastClick, setLastClick] = useState();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		cuisine: cuisines[0].id,
	});
	const [show, setShow] = useState(false);

	const mapRef = useRef();

	// Expose setView method to the parent component
	useImperativeHandle(ref, () => ({
		flyTo(latlng, zoom) {
			if (mapRef.current) {
				mapRef.current.flyTo(latlng, zoom);
			}
		},
	}));

	function UserClick() {
		const map = useMapEvents({
			async click(e) {
				map.setView(e.latlng);
				setLastClick(e.latlng);
				setShow(true);
			},
		});
	}

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prevData) => ({ ...prevData, [id]: value }));
	};

	async function handleSubmit() {
		if (!lastClick) return;

		const { /**data,*/ error } = await supabase.from("markers").insert({
			name: formData.name,
			description: formData.description,
			cuisine: formData.cuisine,
			latitude: lastClick.lat,
			longitude: lastClick.lng,
		});

		if (error) {
			console.error("Error adding marker:", error);
		} else {
			setFormData({ name: "", description: "", cuisine: cuisines[0].value });
			setShow(false);
		}
	}

	async function deleteMarker(e, id) {
		e.preventDefault();

		const { error } = await supabase.from("markers").delete().eq("id", id);

		if (error) {
			console.error("Error deleting marker:", error);
		}
	}

	function chooseIcon(category) {
		switch (category) {
			case "american":
				return icons.burger;
			default:
				return icons.cutlery;
		}
	}

	return (
		<div style={{ width: "100vw" }}>
			<MapContainer
				center={[41.7163979532581, -74.44136270539359]}
				zoom={13}
				style={{ height: "100vh", width: "100%" }}
				zoomControl={false}
				ref={mapRef}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				<UserClick />
				<ZoomControl position="bottomright" />
				{markers &&
					markers.map((marker) => (
						<Marker
							key={marker.id}
							position={[marker.latitude, marker.longitude]}
							icon={chooseIcon(marker.cuisine)}
						>
							<Popup>
								<h1>{marker.name}</h1>
								<h2>{marker.description}</h2>
								<button
									onClick={(e) => {
										console.log("Delete marker", marker.id);
										deleteMarker(e, marker.id);
									}}
								>
									Delete
								</button>
							</Popup>
						</Marker>
					))}
			</MapContainer>
			<Modal show={show} fullscreen={true} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Add Marker</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group controlId="name">
							<Form.Label>Name:</Form.Label>
							<Form.Control
								type="text"
								value={formData.name}
								onChange={handleChange}
							/>
						</Form.Group>
						<Form.Group controlId="description">
							<Form.Label>Description:</Form.Label>
							<Form.Control
								type="text"
								value={formData.description}
								onChange={handleChange}
							/>
						</Form.Group>
						<Form.Group controlId="cuisine">
							<Form.Label>Cuisine:</Form.Label>
							<Form.Select value={formData.cuisine} onChange={handleChange}>
								{cuisines.map((cuisineOption) => (
									<option key={cuisineOption.id} value={cuisineOption.id}>
										{cuisineOption.label}
									</option>
								))}
							</Form.Select>
						</Form.Group>
						<br />
						<Button onClick={handleSubmit}>Submit</Button>
					</Form>
				</Modal.Body>
			</Modal>
		</div>
	);
});

export default Map;
