import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function Checkout() {
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [creditCardInfo, setCreditCardInfo] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");
    const [saveDetails, setSaveDetails] = useState(false);
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
        axiosInstance
            .get("account/")
            .then((res) => {
                setShippingAddress(res.data.shipping_address || "");
                setBillingAddress(res.data.billing_address || "");
                setCreditCardInfo({
                    cardNumber: res.data.credit_card_info?.cardNumber || "",
                    expiryDate: res.data.credit_card_info?.expiryDate || "",
                    cvv: res.data.credit_card_info?.cvv || "",
                });
            })
            .catch((err) => {
                console.error("Error fetching user details:", err);
                setError("Failed to load user details. Please try again.");
            });
    };

    const handleBackToShopping = () => {
        navigate("/");
    };

    const fetchCart = () => {
        axiosInstance
            .get("cart/")
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
            credit_card_info: creditCardInfo,
        };

        const saveUserDetails = async () => {
            if (saveDetails) {
                const updateData = {
                    shipping_address: shippingAddress,
                    billing_address: billingAddress,
                    credit_card_info: creditCardInfo.cardNumber,
                };
                try {
                    await axiosInstance.put("account/", updateData);
                    console.log("User details saved successfully.");
                } catch (err) {
                    console.error("Failed to save user details:", err);
                }
            }
        };

        axiosInstance
            .post("checkout/", orderData)
            .then((res) => {
                const orderSummary = {
                    ...res.data,
                    cart_items: cartItems,
                    total_price: total,
                    credit_card_info: {
                        ...res.data.credit_card_info,
                        cardNumber: creditCardInfo.cardNumber,
                    },
                };
                saveUserDetails();
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
                        <label htmlFor="shippingAddress" className="form-label">
                            Shipping Address
                        </label>
                        <textarea id="shippingAddress" className="form-control" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="billingAddress" className="form-label">
                            Billing Address
                        </label>
                        <textarea id="billingAddress" className="form-control" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} required />
                    </div>
                    <h2>Payment Information</h2>
                    <div className="mb-3">
                        <label htmlFor="cardNumber" className="form-label">
                            Card Number
                        </label>
                        <input
                            type="text"
                            id="cardNumber"
                            className="form-control"
                            value={creditCardInfo.cardNumber}
                            onChange={(e) => setCreditCardInfo({ ...creditCardInfo, cardNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="expiryDate" className="form-label">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                id="expiryDate"
                                className="form-control"
                                value={creditCardInfo.expiryDate}
                                onChange={(e) => setCreditCardInfo({ ...creditCardInfo, expiryDate: e.target.value })}
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="cvv" className="form-label">
                                CVV
                            </label>
                            <input type="text" id="cvv" className="form-control" value={creditCardInfo.cvv} onChange={(e) => setCreditCardInfo({ ...creditCardInfo, cvv: e.target.value })} required />
                        </div>
                    </div>
                    <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="saveDetails" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} />
                        <label className="form-check-label" htmlFor="saveDetails">
                            Save these details for future purchases
                        </label>
                    </div>
                </div>
                <div className="col-md-6">
                    <h2>Order Summary</h2>
                    <ul className="list-group mb-3">
                        {cartItems.map((item, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between lh-sm">
                                <div>
                                    <h6 className="my-0">{item.product.name}</h6>
                                    <small className="text-muted">Quantity: {item.quantity}</small>
                                </div>
                                <span className="text-muted">${(item.quantity * item.product.price).toFixed(2)}</span>
                            </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Total (USD)</span>
                            <strong>${total}</strong>
                        </li>
                    </ul>
                    <button onClick={handleCheckout} className="btn btn-primary btn-lg btn-block">
                        Complete Purchase
                    </button>
                    <button onClick={handleBackToShopping} className="btn btn-secondary btn-lg btn-block mt-3">
                        Back to Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
