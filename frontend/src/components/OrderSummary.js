import React from "react";
import { useLocation } from "react-router-dom";

function OrderSummary() {
    const { state } = useLocation();
    const { order } = state || {};

    if (!order) {
        return <p>No order summary available.</p>;
    }

    return (
        <div>
            <h1>Order Summary</h1>
            <p>Order ID: {order.id}</p>
            <p>Total Price: ${order.total_price}</p>
            <p>Shipping Address: {order.shipping_address}</p>
            <p>Billing Address: {order.billing_address}</p>
            <h2>Items</h2>
            <ul>
                {order.items.map((item) => (
                    <li key={item.id}>
                        {item.quantity} x {item.product.name} - ${item.product.price}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default OrderSummary;
