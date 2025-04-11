import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";

import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router";

export function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	let navigate = useNavigate();

	const handleSignUp = async (e) => {
		e.preventDefault();

		if (password !== password2) {
			setErrorMessage("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setErrorMessage("Password must be at least 8 characters long");
			return;
		}

		const { error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				emailRedirectTo: "https://mapmymeal.netlify.app/signin",
			},
		});

		if (error) {
			setErrorMessage(error.message);
		} else {
			navigate("/signin");
		}
	};

	return (
		<div>
			<Form id="sign-up-form" onSubmit={handleSignUp}>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Form.Group>
				<Form.Group controlId="formBasicConfirmPassword">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Password"
						value={password2}
						onChange={(e) => setPassword2(e.target.value)}
					/>
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
				{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			</Form>
		</div>
	);
}
