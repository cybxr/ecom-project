import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { Star, StarHalf, StarFill } from 'react-bootstrap-icons';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartQuantity, setCartQuantity] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axiosInstance.get(`products/${id}/`),
            axiosInstance.get('cart/')
        ])
            .then(([productRes, cartRes]) => {
                if (productRes.data.inventory_quantity === 0) {
                    navigate("/"); // Redirect to home if out of stock
                } else {
                    setProduct(productRes.data);
                    const cartItem = cartRes.data.find(item => item.product.id === parseInt(id));
                    setCartQuantity(cartItem ? cartItem.quantity : 0);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load product or cart data. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    const addToCart = () => {
        const availableQuantity = product.inventory_quantity - cartQuantity;
        if (quantity > availableQuantity) {
            setError(`Sorry, you can only add ${availableQuantity} more of this item to your cart.`);
            return;
        }

        axiosInstance.post("cart/add/", { product_id: id, quantity })
            .then(() => {
                navigate("/cart");
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    setError("You must be logged in to add items to the cart.");
                } else if (err.response && err.response.data.detail) {
                    setError(`Error: ${err.response.data.detail}`);
                } else {
                    setError("An error occurred. Please try again.");
                }
            });
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarFill key={i} className="text-warning" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half" className="text-warning" />);
        }

        while (stars.length < 5) {
            stars.push(<Star key={`empty-${stars.length}`} className="text-warning" />);
        }

        return stars;
    };

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
    if (!product) return null;

    const availableQuantity = product.inventory_quantity - cartQuantity;

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <img 
                        src={`http://localhost:8000${product.image}`} 
                        alt={product.name} 
                        className="product-image"
                    />
                </div>
                <div className="col-md-6">
                    <h1 className="mb-4">{product.name}</h1>
                    <p className="lead mb-4">{product.description}</p>
                    <h2 className="mb-4">${product.price}</h2>
                    <div className="mb-2">
                        {renderStars(product.average_rating)}
                        <span className="ms-2">({product.review_count} reviews)</span>
                    </div>
                    <p className="mb-3">
                        Stock: 
                        <span className={`ms-2 ${availableQuantity > 10 ? 'text-success' : 'text-danger'}`}>
                            {availableQuantity > 10 ? `${availableQuantity} left` : `Only ${availableQuantity} left`}
                        </span>
                    </p>
                    {cartQuantity > 0 && (
                        <p className="mb-3">In your cart: {cartQuantity}</p>
                    )}
                    <div className="mb-4">
                        <label htmlFor="quantity" className="form-label">Quantity:</label>
                        <input 
                            type="number" 
                            id="quantity"
                            className="form-control" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), availableQuantity)))}
                            min="1" 
                            max={availableQuantity} 
                        />
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={addToCart} disabled={availableQuantity === 0}>
                        {availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;