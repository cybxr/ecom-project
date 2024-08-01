import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleRegister = () => {
        axiosInstance.post("register/", { username, password, email }).then(() => {
            navigate("/login");
        });
    };

    return (
        <div>
            <h1>Register</h1>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;
