import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AllMessages.css";

const AllMessages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/messages", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch messages.");
        }
    };

    return (
        <div className="all-messages">
            <h2>All Messages</h2>
            {messages.length === 0 ? (
                <p>No messages to display.</p>
            ) : (
                <ul>
                    {messages.map((message) => (
                        <li key={message.id}>
                            <div className="message-preview">
                                <p>
                                    <strong>Exchange Request ID:</strong> {message.exchange_request_id}
                                </p>
                                <p>
                                    <strong>Sender User ID:</strong> {message.sender_user_id}
                                </p>
                                <p>
                                    <strong>Receiver User ID:</strong> {message.receiver_user_id}
                                </p>
                                <p>
                                    <strong>Message:</strong> {message.message}
                                </p>
                                <p>
                                    <strong>Created At:</strong>{" "}
                                    {new Date(message.created_at).toLocaleString()}
                                </p>
                                <Link to={`/messages/${message.id}`}>
                                    View Conversation
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AllMessages;
