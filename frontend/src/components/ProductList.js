import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Link } from "react-router-dom";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        let query = "products/";
        let params = [];
        if (category) params.push(`category=${category}`);
        if (search) params.push(`search=${search}`);
        if (sort) params.push(`sort_by=${sort}`);
        if (params.length > 0) query += "?" + params.join("&");

        axiosInstance.get(query).then((res) => {
            setProducts(res.data);
        });
    }, [category, search, sort]);

    useEffect(() => {
        axiosInstance.get("categories/").then((res) => {
            setCategories(res.data);
        });
    }, []);

    return (
        <div>
            <h1>Products</h1>
            <div>
                <label>
                    Category:
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Search:
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
                </label>
                <label>
                    Sort By:
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="">None</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                        <option value="name_desc">Name: Z-A</option>
                    </select>
                </label>
            </div>
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
