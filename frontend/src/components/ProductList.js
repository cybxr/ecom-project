import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Link, useNavigate } from "react-router-dom";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [categories, setCategories] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance.get("categories/").then((res) => {
            setCategories(res.data);
        });

        const token = localStorage.getItem("access_token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const fetchProducts = () => {
        let query = "products/filter/";
        let params = [];
        if (category) params.push(`category=${category}`);
        if (search) params.push(`search=${search}`);
        if (sort) params.push(`sort_by=${sort}`);
        if (params.length > 0) query += "?" + params.join("&");

        axiosInstance.get(query).then((res) => {
            setProducts(res.data);
        });
    };

    useEffect(() => {
        fetchProducts(); // Fetch products whenever category or sort changes
    }, [category, sort]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setCategory(""); // Reset category to default
        setSort(""); // Reset sort to default
        fetchProducts();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-4">
                {isLoggedIn ? (
                    <button className="btn btn-primary" onClick={() => navigate("/account")}>View Profile</button>
                ) : (
                    <>
                        <button className="btn btn-primary me-2" onClick={() => navigate("/login")}>Login</button>
                        <button className="btn btn-secondary" onClick={() => navigate("/register")}>Signup</button>
                    </>
                )}
            </div>

            <h1 className="mb-4">Products</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="">Sort By</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                            <option value="name_desc">Name: Z-A</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100">Search</button>
                    </div>
                </div>
            </form>
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {products.map((product) => (
                    <div key={product.id} className="col">
                        <div className="card h-100">
                            <img src={`http://localhost:8000${product.image}`} className="card-img-top" alt={product.name} style={{ objectFit: "contain", height: "200px" }} />
                            <div className="card-body">
                                <h5 className="card-title">{product.name}</h5>
                                <p className="card-text">${product.price}</p>
                                <Link to={`/products/${product.id}`} className="btn btn-primary">View Details</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
