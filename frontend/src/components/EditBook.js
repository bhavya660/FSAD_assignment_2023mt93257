import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditBook.css";

const EditBook = () => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");
    const [condition, setCondition] = useState("");
    const [availability_status, setAvailabilityStatus] = useState("Available");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchBook();
    }, []);

    const fetchBook = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const book = response.data;
            setTitle(book.title);
            setAuthor(book.author);
            setGenre(book.genre || "");
            setCondition(book.condition || "");
            setAvailabilityStatus(book.availability_status || "Available");
        } catch (err) {
            console.error(err);
            alert("Failed to fetch the book details.");
            navigate("/books");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !author) {
            alert("Title and Author are required.");
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/books/${id}`, {
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
            alert(err.response?.data?.message || "Failed to update the book.");
        }
    };

    return (
        <div className="edit-book-container">
            <h2>Edit Book</h2>
            <form onSubmit={handleSubmit} className="edit-book-form">
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
                <button type="submit">Update Book</button>
            </form>
        </div>
    );
};

export default EditBook;
