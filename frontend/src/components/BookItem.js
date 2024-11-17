import React, { useState } from "react";
import "./BookItem.css";
import ExchangeRequestForm from "./ExchangeRequestForm";

const BookItem = ({ book, onDelete }) => {
    const [showRequestForm, setShowRequestForm] = useState(false);

    const loggedInUserId = parseInt(localStorage.getItem("user_id")); // Ensure user_id is stored on login

    return (
        <div className="book-item">
            <h3>{book.title}</h3>
            <p><strong>Author:</strong> {book.author}</p>
            {book.genre && <p><strong>Genre:</strong> {book.genre}</p>}
            {book.condition && <p><strong>Condition:</strong> {book.condition}</p>}
            <p><strong>Status:</strong> {book.availability_status}</p>

            <div className="book-actions">
                <>
                    <button onClick={() => onDelete(book.id)} className="delete-button">Delete</button>
                    <button className="edit-button">Edit</button>

                    <button onClick={() => setShowRequestForm(!showRequestForm)} className="request-button">
                        {showRequestForm ? "Cancel Request" : "Request Exchange"}
                    </button>
                    {showRequestForm && (
                        <ExchangeRequestForm
                            bookId={book.id}
                            receiverUserId={book.user_id}
                            onRequestSent={() => setShowRequestForm(false)}
                        />
                    )}
                </>
            </div>
        </div>
    );
};

export default BookItem;

