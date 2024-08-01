import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Checkout() {
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const navigate = useNavigate();

    const handleCheckout = () => {
        axiosInstance
            .post("process_payment/", { shipping_address: shippingAddress, billing_address: billingAddress })
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
            <input type="text" placeholder="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
            <input type="text" placeholder="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
            <button onClick={handleCheckout}>Submit Payment</button>
        </div>
    );
}

export default Checkout;
