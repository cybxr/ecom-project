import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get("cart/")
            .then((res) => {
                setCartItems(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const checkout = () => {
        navigate("/checkout");
    };

    return (
        <div>
            <h1>Your Cart</h1>
            {cartItems.length ? (
                <ul>
                    {cartItems.map((item) => (
                        <li key={item.id}>
                            <img src={`http://localhost:8000${item.product.image}`} alt={item.product.name} style={{ width: "100px", height: "100px" }} />
                            {item.quantity} x {item.product.name} - ${item.product.price}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Cart is empty.</p>
            )}
            {cartItems.length > 0 && <button onClick={checkout}>Checkout</button>}
        </div>
    );
}

export default Cart;
