import "./App.css";
import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { supabase } from "./config/supabaseClient";
import { SignIn } from "./components/signin";
import { Homepage } from "./components/homepage";
import { UpdatePassword } from "./components/updatePassword";

function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if the user is already signed in
		supabase.auth.getSession().then(({ data }) => {
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth state changes (sign in, sign out)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	if (loading) {
		return null;
	}

	return (
		<div className="App">
			<Router>
				<Routes>
					<Route
						path="/"
						element={
							user ? <Homepage id="homepage" /> : <Navigate to="/signin" />
						}
					/>
					<Route
						path="/signin"
						element={user ? <Navigate to="/" /> : <SignIn />}
					/>
					<Route
						path="/reset"
						element={user ? <UpdatePassword /> : <Navigate to="/signin" />}
					/>
				</Routes>
			</Router>
		</div>
	);
}

export default App;
