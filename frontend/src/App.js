import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import IndexPage from "./components/IndexPage";
import Login from "./components/Login";
import Register from "./components/Register";
import BookList from "./components/BookList";
import AddBook from "./components/AddBook";
import EditBook from "./components/EditBook";
import About from "./components/About";
import ExchangeRequestForm from "./components/ExchangeRequestForm";
import ExchangeRequestList from "./components/ExchangeRequestList";
import AllMessages from "./components/AllMessages";
import ExchangeRequestDetails from "./components/ExchangeRequestDetails";

function App() {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Router>
            <div>
                <Navbar />
                <div className="container">
                    {/* Search bar */}
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <Routes>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/api/exchange-requests" element={<ExchangeRequestList/>} />
                        <Route
                            path="/books"
                            element={<BookList searchTerm={searchTerm} />}
                        />
                        <Route path="/add-book" element={<AddBook />} />
                        <Route path="/edit-book/:id" element={<EditBook />} />
                        <Route path="/exchange-requests" element={<ExchangeRequestList />} />
                        <Route path="/exchange-requests/:id" element={<ExchangeRequestDetails />} />
                        <Route path="/messages" element={<AllMessages />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
