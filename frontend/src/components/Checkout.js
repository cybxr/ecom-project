import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Checkout() {
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [userDetails, setUserDetails] = useState({ username: "", password: "", email: "" });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            axiosInstance.get("account/").then((res) => {
                setShippingAddress(res.data.shipping_address);
                setBillingAddress(res.data.billing_address);
                setIsLoggedIn(true);
            });
        }
    }, []);

    const handleCheckout = () => {
        axiosInstance
            .post("register_or_login_and_checkout/", { ...userDetails, shipping_address: shippingAddress, billing_address: billingAddress })
            .then((res) => {
                navigate("/order-summary", { state: { order: res.data } });
            })
            .catch((err) => {
                if (err.response.status === 402) {
                    alert("Credit Card Authorization Failed.");
                }
            });
    };

    return (
        <div>
            <h1>Checkout</h1>
            {!isLoggedIn && (
                <div>
                    <h2>Register or Login</h2>
                    <input type="text" placeholder="Username" value={userDetails.username} onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })} />
                    <input type="password" placeholder="Password" value={userDetails.password} onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })} />
                    <input type="email" placeholder="Email" value={userDetails.email} onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })} />
                </div>
            )}
            <input type="text" placeholder="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
            <input type="text" placeholder="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
            <button onClick={handleCheckout}>Confirm Order</button>
        </div>
    );
}

export default Checkout;
