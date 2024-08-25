import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { Star, StarHalf, StarFill } from 'react-bootstrap-icons';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [totalCartItems, setTotalCartItems] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, review: "" });
    const [reviewError, setReviewError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        
        Promise.all([
            axiosInstance.get(`products/${id}/`),
            axiosInstance.get(`products/${id}/reviews/`),
            axiosInstance.get('cart/').catch(err => {
                if (err.response && err.response.status === 401) {
                    setIsAuthenticated(false);
                    return { data: [] };
                }
                throw err;
            })
        ])
        .then(([productRes, reviewsRes, cartRes]) => {
            setProduct(productRes.data);
            setReviews(reviewsRes.data);
            
            if (Array.isArray(cartRes.data)) {
                const cartItem = cartRes.data.find(item => item.product.id === parseInt(id));
                setCartQuantity(cartItem ? cartItem.quantity : 0);
                setTotalCartItems(cartRes.data.reduce((sum, item) => sum + item.quantity, 0));
            } else {
                setCartQuantity(0);
                setTotalCartItems(0);
            }
        })
        .catch((err) => {
            console.error(err);
            setError("Failed to load product data. Please try again later.");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [id, navigate]);

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setReviewError("You must be logged in to submit a review.");
            return;
        }

        axiosInstance.post("reviews/add/", {
            product_id: id,
            rating: newReview.rating,
            review: newReview.review
        })
        .then((res) => {
            setReviews([...reviews, res.data]);
            setNewReview({ rating: 5, review: "" });
            setReviewError(null);
        })
        .catch((err) => {
            console.error(err);
            setReviewError("Failed to submit review. Please try again.");
        });
    };

    const addToCart = () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/products/${id}` } });
            return;
        }

        const availableQuantity = product.inventory_quantity - cartQuantity;
        if (quantity > availableQuantity) {
            setError(`Sorry, you can only add ${availableQuantity} more of this item to your cart.`);
            return;
        }

        axiosInstance.post("cart/add/", { product_id: id, quantity })
            .then(() => {
                setCartQuantity(prevQuantity => prevQuantity + quantity);
                setTotalCartItems(prevTotal => prevTotal + quantity);
                setError(null);
                setShowOverlay(true);
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

    const goToCheckout = () => {
        navigate("/checkout");
    };

    const goToCart = () => {
        navigate("/cart");
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
        <div className="container mt-5 position-relative">
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
                    {isAuthenticated && cartQuantity > 0 && (
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
                    <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-primary btn-lg" onClick={addToCart} disabled={availableQuantity === 0}>
                            {availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        {isAuthenticated && totalCartItems > 0 && (
                            <button className="btn btn-success btn-lg" onClick={goToCheckout}>
                                Checkout ({totalCartItems})
                            </button>
                        )}
                    </div>
                    {!isAuthenticated && (
                        <p className="mt-2">
                            <Link to="/login" state={{ from: `/products/${id}` }}>Log in</Link> to add this item to your cart.
                        </p>
                    )}
                </div>
            </div>
        </div>
        <hr></hr>
        <div className="row mt-5">
                <div className="col-md-6">
                    <h3>Customer Reviews</h3>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="mb-3">
                                <div>{renderStars(review.rating)}</div>
                                <p>{review.review}</p>
                                <small>By {review.customer.user.username} on {new Date(review.created_at).toLocaleDateString()}</small>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet. Be the first to review this product!</p>
                    )}
                </div>
                <div className="col-md-6">
                    <h3>Write a Review</h3>
                    {isAuthenticated ? (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-3">
                                <label htmlFor="rating" className="form-label">Rating</label>
                                <select 
                                    id="rating" 
                                    className="form-select"
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                                >
                                    {[5, 4, 3, 2, 1].map((num) => (
                                        <option key={num} value={num}>{num} stars</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="review" className="form-label">Review</label>
                                <textarea
                                    id="review"
                                    className="form-control"
                                    rows="3"
                                    value={newReview.review}
                                    onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit Review</button>
                            {reviewError && <div className="alert alert-danger mt-3">{reviewError}</div>}
                        </form>
                    ) : (
                        <p>Please <Link to="/login" state={{ from: `/products/${id}` }}>log in</Link> to write a review.</p>
                    )}
                </div>
            </div>

        {showOverlay && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white p-4 rounded">
                        <h4>Item added to cart!</h4>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-secondary" onClick={() => setShowOverlay(false)}>Continue Shopping</button>
                            <button className="btn btn-primary" onClick={goToCart}>View Cart</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;