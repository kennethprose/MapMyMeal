import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";

import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router";

export function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	let navigate = useNavigate();

	const handleSignIn = async (e) => {
		e.preventDefault();

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			setErrorMessage(error.message);
		} else {
			setErrorMessage("");
			window.location.reload(); // Reload the app to reflect sign-in status
		}
	};

	const handlePasswordReset = async (e) => {
		e.preventDefault();
		setMessage("");
		setErrorMessage("");

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "https://mapmymeal.netlify.app/reset",
		});

		if (error) {
			setErrorMessage(error.message);
		} else {
			setMessage("Password reset email sent. Check your inbox!");
		}
	};

	return (
		<div>
			<Form id="sign-in-form" onSubmit={handleSignIn}>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						placeholder="Enter email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Enter password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Form.Text className="text-muted" onClick={handlePasswordReset}>
						Reset password
					</Form.Text>
					<br />
					<Form.Text className="text-muted" onClick={() => navigate("/signup")}>
						Sign Up
					</Form.Text>
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
				{message && <p style={{ color: "green" }}>{message}</p>}
				{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			</Form>
		</div>
	);
}
