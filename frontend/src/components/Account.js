import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

function Account() {
    const [accountInfo, setAccountInfo] = useState({ user: {}, billing_address: "", shipping_address: "", credit_card_info: "" });

    useEffect(() => {
        axiosInstance.get("account/").then((res) => {
            setAccountInfo(res.data);
        });
    }, []);

    const handleUpdate = () => {
        axiosInstance.put("account/", accountInfo).then((res) => {
            alert("Account updated successfully.");
        });
    };

    return (
        <div>
            <h1>Account Information</h1>
            <h2>User Details</h2>
            <p>Username: {accountInfo.user.username}</p>
            <p>Email: {accountInfo.user.email}</p>
            <h2>Billing Address</h2>
            <input type="text" value={accountInfo.billing_address} onChange={(e) => setAccountInfo({ ...accountInfo, billing_address: e.target.value })} />
            <h2>Shipping Address</h2>
            <input type="text" value={accountInfo.shipping_address} onChange={(e) => setAccountInfo({ ...accountInfo, shipping_address: e.target.value })} />
            <h2>Credit Card Info</h2>
            <input type="text" value={accountInfo.credit_card_info} onChange={(e) => setAccountInfo({ ...accountInfo, credit_card_info: e.target.value })} />
            <button onClick={handleUpdate}>Update Account</button>
        </div>
    );
}

export default Account;
