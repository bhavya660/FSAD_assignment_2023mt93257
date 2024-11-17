import React from "react";
import { Link } from "react-router-dom";
import "./IndexPage.css";

const IndexPage = () => {
    const token = localStorage.getItem("token");

    return (
        <div className="index-page">
            <header className="index-header">
                <h1>Welcome to the Book Exchange Platform</h1>
                <p>Discover, share, and exchange books with fellow book lovers!</p>
                {/* {!token && (
                    <div className="cta-buttons">
                        <Link to="/register" className="cta-button">Register</Link>
                        <Link to="/login" className="cta-button">Login</Link>
                    </div>
                )} */}
            </header>
            <section className="index-content">
                <p>Sign up today to explore our vast collection of books and connect with a community of book enthusiasts.</p>
            </section>
        </div>
    );
};

export default IndexPage;
