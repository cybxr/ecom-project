import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance.get(`products/${id}/`).then((res) => {
            setProduct(res.data);
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
                alert("Error adding to cart. Make sure you are logged in.");
            });
    };

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" max={product.inventory_quantity} />
            <button onClick={addToCart}>Add to Cart</button>
        </div>
    );
}

export default ProductDetail;
