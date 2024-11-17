
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import BookItem from "./BookItem";
import "./BookList.css";

const BookList = ({ searchTerm }) => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchBooks();
    }, [token, navigate]);


    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/books/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch books.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(books.filter(book => book.id !== id));
            alert("Book deleted successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete the book.");
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    return (
        <div className="book-list-container">
            <h2>My Book Listings</h2>
            <Link to="/add-book" className="add-book-button">Add New Book</Link>
            {filteredBooks.length === 0 ? (
                <p>No books found for the search term.</p>
            ) : (
                <div className="book-list">
                    {filteredBooks.map(book => (
                        <BookItem key={book.id} book={book} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookList;