import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';


function Navbar({ isLoggedIn, setIsLoggedIn }) {
    const navigate = useNavigate();
    const [showLogoutMessage, setShowLogoutMessage] = useState(false);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await axiosInstance.post('logout/', { refresh_token: refreshToken });
            }
            // Clear tokens from local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Update logged in state
            setIsLoggedIn(false);
            
            // Reset axiosInstance default headers
            axiosInstance.defaults.headers['Authorization'] = null;
            
            // Show logout message
            setShowLogoutMessage(true);
            
            // Hide message after 10 seconds
            setTimeout(() => {
                setShowLogoutMessage(false);
                // Navigate to home page after hiding the message
                // navigate('/');
            }, 10000);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">Mint Storefront</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/"><i className="bi bi-house-door"></i> Home</Link>
                            </li>
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/cart"><i className="bi bi-cart"></i> Cart</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/account"><i className="bi bi-person"></i> Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link btn btn-link" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login"><i className="bi bi-box-arrow-in-right"></i> Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/register"><i className="bi bi-person-plus"></i> Signup</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
            {showLogoutMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    You have been successfully logged out.
                    <button type="button" className="btn-close" onClick={() => setShowLogoutMessage(false)} aria-label="Close"></button>
                </div>
            )}
        </>
    );
}

export default Navbar;