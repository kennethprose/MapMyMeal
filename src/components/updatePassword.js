import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";

export function UpdatePassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const navigate = useNavigate();

	const handleUpdatePassword = async (e) => {
		e.preventDefault();
		setMessage("");
		setErrorMessage("");

		if (password !== confirmPassword) {
			setErrorMessage("Passwords do not match.");
			return;
		}

		const { error } = await supabase.auth.updateUser({
			password,
		});

		if (error) {
			setErrorMessage(error.message);
		} else {
			setMessage("Your password has been updated successfully.");
			navigate("/");
		}
	};

	return (
		<div>
			<Form id="update-password-form" onSubmit={handleUpdatePassword}>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>New Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Enter new password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Form.Group>
				<Form.Group controlId="formConfirmPassword">
					<Form.Label>Confirm New Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Confirm new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</Form.Group>
				<Button variant="primary" type="submit">
					Update Password
				</Button>
				{message && <p style={{ color: "green" }}>{message}</p>}
				{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			</Form>
		</div>
	);
}
