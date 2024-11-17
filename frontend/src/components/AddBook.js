import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddBook.css";

const AddBook = () => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");
    const [condition, setCondition] = useState("");
    const [availability_status, setAvailabilityStatus] = useState("Available");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !author) {
            alert("Title and Author are required.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/books", {
                title,
                author,
                genre,
                condition,
                availability_status,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert(response.data.message);
            navigate("/books");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add the book.");
        }
    };

    return (
        <div className="add-book-container">
            <h2>Add New Book</h2>
            <form onSubmit={handleSubmit} className="add-book-form">
                <label>
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Author:
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Genre:
                    <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                </label>
                <label>
                    Condition:
                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option value="">Select Condition</option>
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>
                </label>
                <label>
                    Availability Status:
                    <select value={availability_status} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                    </select>
                </label>
                <button type="submit">Add Book</button>
            </form>
        </div>
    );
};

export default AddBook;
