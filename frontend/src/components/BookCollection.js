import React, { useState, useEffect } from "react";
import axios from "axios";

const BookCollection = () => {
    const [books, setBooks] = useState([]);
    const [bookTitle, setBookTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("own");

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/user/books", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/user/books",
                { book_title: bookTitle, author, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchBooks();
            setBookTitle("");
            setAuthor("");
            setStatus("own");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Book Collection</h1>
            <form onSubmit={handleAddBook}>
                <input
                    type="text"
                    placeholder="Book Title"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="own">Own</option>
                    <option value="wish">Wish</option>
                </select>
                <button type="submit">Add Book</button>
            </form>
            <ul>
                {books.map((book) => (
                    <li key={book.id}>
                        {book.book_title} by {book.author} ({book.status})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookCollection;
