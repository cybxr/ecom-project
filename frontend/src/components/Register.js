import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Register({ setIsLoggedIn }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear any previous errors
        try {
            const response = await axiosInstance.post("register/", { username, password, email });
            console.log("Registration successful:", response.data);
            
            // Automatically log in the user after successful registration
            const loginResponse = await axiosInstance.post("login/", { username, password });
            localStorage.setItem("access_token", loginResponse.data.access);
            localStorage.setItem("refresh_token", loginResponse.data.refresh);
            setIsLoggedIn(true);
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.data.username) {
                    setError(err.response.data.username[0]);
                } else if (err.response.data.email) {
                    setError(err.response.data.email[0]);
                } else if (err.response.data.password) {
                    setError(err.response.data.password[0]);
                } else {
                    setError(err.response.data.detail || "An error occurred during registration");
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError("No response from server. Please try again later.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
}

export default Register;