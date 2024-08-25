import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function Checkout() {
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [creditCardInfo, setCreditCardInfo] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setIsLoggedIn(true);
            fetchUserDetails();
        }
        fetchCart();
    }, []);

    const fetchUserDetails = () => {
        axiosInstance.get("account/")
            .then((res) => {
                setShippingAddress(res.data.shipping_address || "");
                setBillingAddress(res.data.billing_address || "");
                setCreditCardInfo({
                    cardNumber: res.data.credit_card_info?.cardNumber || "",
                    expiryDate: res.data.credit_card_info?.expiryDate || "",
                    cvv: res.data.credit_card_info?.cvv || ""
                });
            })
            .catch((err) => {
                console.error("Error fetching user details:", err);
                setError("Failed to load user details. Please try again.");
            });
    };

    const handleBackToShopping = () => {
        navigate("/"); // Assuming "/" is your main product listing page
    };

    const fetchCart = () => {
        axiosInstance.get("cart/")
            .then((res) => {
                setCartItems(res.data);
                const sum = res.data.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
                setTotal(sum.toFixed(2));
            })
            .catch((err) => {
                console.error("Error fetching cart:", err);
                setError("Failed to load cart. Please try again.");
            });
    };

    const handleCheckout = () => {
        const orderData = {
            shipping_address: shippingAddress,
            billing_address: billingAddress,
            credit_card_info: creditCardInfo
        };

        axiosInstance.post("checkout/", orderData)
            .then((res) => {
                const orderSummary = {
                    ...res.data,
                    cart_items: cartItems,
                    total_price: total,
                    credit_card_info: {
                        ...res.data.credit_card_info,
                        cardNumber: creditCardInfo.cardNumber // Include the card number
                    }
                };
                navigate("/order-summary", { state: { order: orderSummary } });
            })
            .catch((err) => {
                console.error("Checkout error:", err);
                if (err.response && err.response.status === 402) {
                    setError("Credit Card Authorization Failed.");
                } else {
                    setError("An error occurred during checkout. Please try again.");
                }
            });
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Checkout</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                <div className="col-md-6">
                    <h2>Shipping Information</h2>
                    <div className="mb-3">
                        <label htmlFor="shippingAddress" className="form-label">Shipping Address</label>
                        <textarea
                            id="shippingAddress"
                            className="form-control"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                        <textarea
                            id="billingAddress"
                            className="form-control"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            required
                        />
                    </div>
                    <h2>Payment Information</h2>
                    <div className="mb-3">
                        <label htmlFor="cardNumber" className="form-label">Card Number</label>
                        <input
                            type="text"
                            id="cardNumber"
                            className="form-control"
                            value={creditCardInfo.cardNumber}
                            onChange={(e) => setCreditCardInfo({...creditCardInfo, cardNumber: e.target.value})}
                            required
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                            <input
                                type="text"
                                id="expiryDate"
                                className="form-control"
                                value={creditCardInfo.expiryDate}
                                onChange={(e) => setCreditCardInfo({...creditCardInfo, expiryDate: e.target.value})}
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="cvv" className="form-label">CVV</label>
                            <input
                                type="text"
                                id="cvv"
                                className="form-control"
                                value={creditCardInfo.cvv}
                                onChange={(e) => setCreditCardInfo({...creditCardInfo, cvv: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <h2>Order Summary</h2>
                    {cartItems.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between mb-2">
                            <span>{item.product.name} - {item.quantity}</span>
                            <span>${(item.quantity * item.product.price).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                        <strong>Total:</strong>
                        <strong>${total}</strong>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-lg flex-grow-1" onClick={handleCheckout}>Place Order</button>
                        <button className="btn btn-secondary btn-lg" onClick={handleBackToShopping}>Back to Shopping</button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default Checkout;