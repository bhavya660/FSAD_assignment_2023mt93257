import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MessageList.css";

const MessageList = ({ exchangeRequestId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
    }, [exchangeRequestId]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/messages/${exchangeRequestId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch messages.");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const receiverUserId = messages[0]?.receiver_user_id || messages[0]?.sender_user_id;

            await axios.post(
                "http://localhost:5000/api/messages",
                {
                    exchange_request_id: exchangeRequestId,
                    receiver_user_id: receiverUserId,
                    message: newMessage,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.error(err);
            alert("Failed to send message.");
        }
    };

    return (
        <div className="message-list">
            <h3>Messages</h3>
            <div className="messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.sender_user_id === parseInt(localStorage.getItem("user_id")) ? "sent" : "received"}`}
                    >
                        <strong>{msg.sender_name}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default MessageList;
