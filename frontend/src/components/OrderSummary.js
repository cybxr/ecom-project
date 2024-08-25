import React from "react";
import { useLocation, Link } from "react-router-dom";

function OrderSummary() {
    const { state } = useLocation();
    const order = state?.order;

    if (!order) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    No order summary available. Please check your order history or contact customer support.
                </div>
                <Link to="/" className="btn btn-primary">Return to Home</Link>
            </div>
        );
    }

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Order Summary</h1>
            <div className="row">
                <div className="col-md-6">
                    <h2>Order Details</h2>
                    <div className="mb-3">
                        <strong>Order ID:</strong> {order.id || 'N/A'}
                    </div>
                    <div className="mb-3">
                        <strong>Order Status:</strong> {order.status || 'Processing'}
                    </div>
                    <h2>Shipping Information</h2>
                    <div className="mb-3">
                        <label className="form-label">Shipping Address</label>
                        <p className="form-control">{order.shipping_address || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Billing Address</label>
                        <p className="form-control">{order.billing_address || 'N/A'}</p>
                    </div>
                    <h2>Payment Information</h2>
                    <div className="mb-3">
                        <label className="form-label">Payment Method</label>
                        <p className="form-control">
                            Credit Card (ending in {order.credit_card_info?.cardNumber?.slice(-4) || 'XXXX'})
                        </p>
                    </div>
                </div>
                <div className="col-md-6">
                    <h2>Order Items</h2>
                    {order.cart_items && order.cart_items.length > 0 ? (
                        <>
                            {order.cart_items.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.product.name} x {item.quantity}</span>
                                    <span>${formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <strong>Total:</strong>
                                <strong>${formatPrice(order.total_price)}</strong>
                            </div>
                        </>
                    ) : (
                        <p className="alert alert-info">No items found in this order.</p>
                    )}
                    <Link to="/" className="btn btn-primary btn-lg w-100">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;