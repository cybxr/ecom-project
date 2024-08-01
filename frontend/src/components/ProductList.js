import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Link } from "react-router-dom";

function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axiosInstance.get("products/").then((res) => {
            setProducts(res.data);
        });
    }, []);

    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <img src={`http://localhost:8000${product.image}`} alt={product.name} style={{ width: "100px", height: "100px" }} />
                            {product.name} - ${product.price}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;
