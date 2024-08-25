import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function Account() {
    const [accountInfo, setAccountInfo] = useState({ user: {}, billing_address: "", shipping_address: "", credit_card_info: "" });
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openOrderId, setOpenOrderId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountRes, orderRes] = await Promise.all([axiosInstance.get("account/"), axiosInstance.get("orders/")]);
                setAccountInfo(accountRes.data);
                setOrderHistory(orderRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load account information. Please try again.");
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    navigate("/login");
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleUpdate = async () => {
        const updateData = {
            billing_address: accountInfo.billing_address,
            shipping_address: accountInfo.shipping_address,
            credit_card_info: accountInfo.credit_card_info,
        };
        try {
            await axiosInstance.put("account/", updateData);
            alert("Account updated successfully.");
        } catch (err) {
            alert("Failed to update account. Please try again.");
        }
    };

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    const toggleOrderDetails = (orderId) => {
        if (openOrderId === orderId) {
            setOpenOrderId(null);
        } else {
            setOpenOrderId(orderId);
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
                    <p className="card-text">
                        <strong>Username:</strong> {accountInfo.user.username}
                    </p>
                    <p className="card-text">
                        <strong>Email:</strong> {accountInfo.user.email}
                    </p>
                </div>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate();
                }}
            >
                <div className="mb-3">
                    <label htmlFor="billingAddress" className="form-label">
                        Billing Address
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="billingAddress"
                        value={accountInfo.billing_address}
                        onChange={(e) => setAccountInfo({ ...accountInfo, billing_address: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="shippingAddress" className="form-label">
                        Shipping Address
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="shippingAddress"
                        value={accountInfo.shipping_address}
                        onChange={(e) => setAccountInfo({ ...accountInfo, shipping_address: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="creditCardInfo" className="form-label">
                        Credit Card Info
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="creditCardInfo"
                        value={accountInfo.credit_card_info}
                        onChange={(e) => setAccountInfo({ ...accountInfo, credit_card_info: e.target.value })}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Update Account
                </button>
            </form>

            <h2 className="mt-5 mb-4">Order History</h2>
            {orderHistory.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderHistory.map((order) => (
                                <React.Fragment key={order.id}>
                                    <tr>
                                        <td>{order.id}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>${formatPrice(order.total_price)}</td>
                                        <td>{order.status}</td>
                                        <td>
                                            <button className="btn btn-sm btn-info" onClick={() => toggleOrderDetails(order.id)}>
                                                {openOrderId === order.id ? "Hide Details" : "View Details"}
                                            </button>
                                        </td>
                                    </tr>
                                    {openOrderId === order.id && (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="p-3 bg-light">
                                                    <h4>Order Details</h4>
                                                    <p>
                                                        <strong>Order ID:</strong> {order.id}
                                                    </p>
                                                    <p>
                                                        <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        <strong>Total Price:</strong> ${formatPrice(order.total_price)}
                                                    </p>
                                                    <p>
                                                        <strong>Status:</strong> {order.status}
                                                    </p>
                                                    <p>
                                                        <strong>Items:</strong>
                                                    </p>
                                                    <ul>
                                                        {order.items.map(
                                                            (item) => (
                                                                console.log(item),
                                                                (
                                                                    <li key={item.id}>
                                                                        {item.product.name} - Quantity: {item.quantity} - Price: ${formatPrice(item.product.price)}
                                                                    </li>
                                                                )
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No order history available.</p>
            )}
        </div>
    );
}

export default Account;
