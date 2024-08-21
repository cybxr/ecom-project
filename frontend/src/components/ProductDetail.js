import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get(`products/${id}/`)
            .then((res) => {
                setProduct(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [id]);

    const addToCart = () => {
        axiosInstance
            .post("cart/add/", { product_id: id, quantity })
            .then(() => {
                navigate("/cart");
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    alert("You must be logged in to add items to the cart.");
                } else if (err.response && err.response.data.detail) {
                    alert(`Error: ${err.response.data.detail}`);
                } else {
                    alert("An error occurred. Please try again.");
                }
            });
    };

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <img src={`http://localhost:8000${product.image}`} alt={product.name} style={{ width: "300px", height: "300px" }} />
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" max={product.inventory_quantity} />
            <button onClick={addToCart}>Add to Cart</button>
        </div>
    );
}

export default ProductDetail;
