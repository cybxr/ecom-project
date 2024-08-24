import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Link } from "react-router-dom";
import { Star, StarHalf, StarFill } from 'react-bootstrap-icons';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axiosInstance.get("categories/").then((res) => {
            setCategories(res.data);
        });
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
        fetchProducts();
    }, [category, sort]);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const getStockStatus = (quantity) => {
        if (quantity > 10) {
            return <span className="text-success">In Stock</span>;
        } else if (quantity > 0) {
            return <span className="text-danger">Low Stock: {quantity}</span>;
        } else {
            return <span className="text-muted">Out of Stock</span>;
        }
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

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Products</h2>
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
                        <div className={`card h-100 ${product.inventory_quantity === 0 ? 'text-muted' : ''}`}>
                            <img 
                                src={`http://localhost:8000${product.image}`} 
                                className="card-img-top" 
                                alt={product.name} 
                                style={{ 
                                    objectFit: "contain", 
                                    height: "200px",
                                    filter: product.inventory_quantity === 0 ? 'grayscale(100%)' : 'none'
                                }} 
                            />
                            <div className="card-body">
                                <h5 className={`card-title ${product.inventory_quantity === 0 ? 'text-decoration-line-through' : ''}`}>
                                    {product.name}
                                </h5>
                                <p className="card-text">${product.price}</p>
                                <p className="card-text">{getStockStatus(product.inventory_quantity)}</p>
                                <div className="mb-2">
                                    {renderStars(product.average_rating)}
                                    <span className="ms-2">({product.review_count} reviews)</span>
                                </div>
                                <Link 
                                    to={`/products/${product.id}`} 
                                    className={`btn btn-primary ${product.inventory_quantity === 0 ? 'disabled' : ''}`}
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            
            </div>
        </div>
    );
}

export default ProductList;