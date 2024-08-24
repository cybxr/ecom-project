import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Account() {
    const [accountInfo, setAccountInfo] = useState({ user: {}, billing_address: "", shipping_address: "", credit_card_info: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                const res = await axiosInstance.get("account/");
                setAccountInfo(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching account info:", err);
                setError("Failed to load account information. Please try again.");
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchAccountInfo();
    }, [navigate]);

    const handleUpdate = async () => {
        const updateData = {
            billing_address: accountInfo.billing_address,
            shipping_address: accountInfo.shipping_address,
            credit_card_info: accountInfo.credit_card_info,
        };
        try {
            const response = await axiosInstance.put("account/", updateData);
            alert("Account updated successfully.");
        } catch (err) {
            alert("Failed to update account. Please try again.");
        }
    };

    if (loading) {
        return <div className="container mt-5">Loading...</div>;
    }

    if (error) {
        return <div className="container mt-5 alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Account Information</h1>
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="card-title">User Details</h2>
                    <p className="card-text"><strong>Username:</strong> {accountInfo.user.username}</p>
                    <p className="card-text"><strong>Email:</strong> {accountInfo.user.email}</p>
                </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <div className="mb-3">
                    <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="billingAddress"
                        value={accountInfo.billing_address} 
                        onChange={(e) => setAccountInfo({ ...accountInfo, billing_address: e.target.value })} 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="shippingAddress" className="form-label">Shipping Address</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="shippingAddress"
                        value={accountInfo.shipping_address} 
                        onChange={(e) => setAccountInfo({ ...accountInfo, shipping_address: e.target.value })} 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="creditCardInfo" className="form-label">Credit Card Info</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="creditCardInfo"
                        value={accountInfo.credit_card_info} 
                        onChange={(e) => setAccountInfo({ ...accountInfo, credit_card_info: e.target.value })} 
                    />
                </div>
                <button type="submit" className="btn btn-primary">Update Account</button>
            </form>
        </div>
    );
}

export default Account;