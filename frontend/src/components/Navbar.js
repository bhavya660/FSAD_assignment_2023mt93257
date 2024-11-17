import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token"); 

    const handleLogout = () => {
        localStorage.removeItem("token"); 
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <h1>Book Exchange</h1>
            </div>
            <ul className="navbar-links">
                {!token ? (
                    <>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/books">My Books</Link>
                        </li>
                        <li>
                            <Link to="/api/exchange-requests">My Exchange</Link>
                        </li>
                        <li>
                            <Link to="/messages">Messages</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
