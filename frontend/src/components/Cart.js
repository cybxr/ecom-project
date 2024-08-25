import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { Trash, PlusCircle, DashCircle } from 'react-bootstrap-icons';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [cartItems]);

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
        if (quantity > 0) {
            axiosInstance.put(`cart/update/${itemId}/`, { quantity }).then(() => {
                fetchCartItems();
            });
        }
    };

    const calculateTotal = () => {
        const sum = cartItems.reduce((acc, item) => acc + item.quantity * parseFloat(item.product.price), 0);
        setTotal(sum.toFixed(2));
    };

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    const checkout = () => {
        navigate("/checkout");
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Your Cart</h2>
            {cartItems.length ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{width: '40%'}}>Product</th>
                                    <th style={{width: '15%'}}>Price</th>
                                    <th style={{width: '20%'}}>Quantity</th>
                                    <th style={{width: '15%'}}>Subtotal</th>
                                    <th style={{width: '10%'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <img 
                                                src={`http://localhost:8000${item.product.image}`} 
                                                alt={item.product.name} 
                                                className="img-thumbnail me-2" 
                                                style={{ width: "50px", height: "50px", objectFit: "contain" }} 
                                            />
                                            {item.product.name}
                                        </td>
                                        <td>${formatPrice(item.product.price)}</td>
                                        <td>
                                            <div className="btn-group" role="group">
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm" 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <DashCircle />
                                                </button>
                                                <span className="btn btn-outline-secondary btn-sm disabled" style={{minWidth: '40px'}}>
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm" 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.inventory_quantity}
                                                >
                                                    <PlusCircle />
                                                </button>
                                            </div>
                                        </td>
                                        <td>${formatPrice(item.quantity * item.product.price)}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)}>
                                                <Trash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-end">
                        <h4>Total: ${total}</h4>
                        <button className="btn btn-primary" onClick={checkout}>Proceed to Checkout</button>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info" role="alert">
                    Your cart is empty.
                </div>
            )}
        </div>
    );
}

export default Cart;