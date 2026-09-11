import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";

import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
			redirectTo: `${window.location.origin}/reset`,
		});

		if (error) {
			setErrorMessage(error.message);
		} else {
			setMessage("Password reset email sent. Check your inbox!");
		}
	};

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="sign-in-title">
				<header className="auth-card-header">
					<p className="auth-eyebrow">Map My Meal</p>
					<h1 id="sign-in-title" className="auth-title">
						Welcome back
					</h1>
					<p className="auth-subtitle">
						Sign in to revisit your saved places.
					</p>
				</header>
				<Form id="sign-in-form" className="auth-form" onSubmit={handleSignIn}>
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
						placeholder="Enter password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
					/>
				</Form.Group>
				<Button className="auth-submit" type="submit">
					Sign in
				</Button>
				{message && (
					<p className="auth-message auth-message-success" role="status">
						{message}
					</p>
				)}
				{errorMessage && (
					<p className="auth-message auth-message-error" role="alert">
						{errorMessage}
					</p>
				)}
				<div className="auth-links">
					<button
						type="button"
						className="auth-link"
						onClick={handlePasswordReset}
					>
						Forgot password?
					</button>
					<p>
						New here?{" "}
						<button
							type="button"
							className="auth-link"
							onClick={() => navigate("/signup")}
						>
							Create an account
						</button>
					</p>
				</div>
				</Form>
			</section>
		</main>
	);
}
