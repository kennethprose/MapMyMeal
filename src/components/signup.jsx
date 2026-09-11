import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";

import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
				emailRedirectTo: `${window.location.origin}/signin`,
			},
		});

		if (error) {
			setErrorMessage(error.message);
		} else {
			navigate("/signin");
		}
	};

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="sign-up-title">
				<header className="auth-card-header">
					<p className="auth-eyebrow">Map My Meal</p>
					<h1 id="sign-up-title" className="auth-title">
						Create your account
					</h1>
					<p className="auth-subtitle">
						Start building your own map of places to try.
					</p>
				</header>
				<Form id="sign-up-form" className="auth-form" onSubmit={handleSignUp}>
				<Form.Group controlId="formBasicEmail" className="auth-field">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
					/>
				</Form.Group>
				<Form.Group controlId="formBasicPassword" className="auth-field">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="At least 8 characters"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="new-password"
					/>
				</Form.Group>
				<Form.Group
					controlId="formBasicConfirmPassword"
					className="auth-field"
				>
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Enter password again"
						value={password2}
						onChange={(e) => setPassword2(e.target.value)}
						autoComplete="new-password"
					/>
				</Form.Group>
				<Button className="auth-submit" type="submit">
					Create account
				</Button>
				{errorMessage && (
					<p className="auth-message auth-message-error" role="alert">
						{errorMessage}
					</p>
				)}
				<div className="auth-links auth-links-centered">
					<p>
						Already have an account?{" "}
						<button
							type="button"
							className="auth-link"
							onClick={() => navigate("/signin")}
						>
							Sign in
						</button>
					</p>
				</div>
				</Form>
			</section>
		</main>
	);
}
