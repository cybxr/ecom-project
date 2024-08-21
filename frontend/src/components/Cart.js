import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = () => {
        axiosInstance
            .get("cart/")
            .then((res) => {
                setCartItems(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleRemove = (itemId) => {
        axiosInstance.delete(`cart/remove/${itemId}/`).then(() => {
            fetchCartItems();
        });
    };

    const handleQuantityChange = (itemId, quantity) => {
        axiosInstance.put(`cart/update/${itemId}/`, { quantity }).then(() => {
            fetchCartItems();
        });
    };

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
                            <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} min="1" max={item.product.inventory_quantity} />
                            <button onClick={() => handleRemove(item.id)}>Remove</button>
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
