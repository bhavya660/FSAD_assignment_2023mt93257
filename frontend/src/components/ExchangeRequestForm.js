import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ExchangeRequestForm.css";

const ExchangeRequestForm = ({ bookId, receiverUserId, onRequestSent }) => {
    const [deliveryMethod, setDeliveryMethod] = useState("");
    const [deliveryDuration, setDeliveryDuration] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/exchange-request",
                {
                    book_id: bookId,
                    receiver_user_id: receiverUserId,
                    delivery_method: deliveryMethod,
                    delivery_duration: deliveryDuration,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message);

            const exchangeRequestId = response.data.exchangeRequestId;

            await axios.post(
                "http://localhost:5000/api/messages",
                {
                    exchange_request_id: exchangeRequestId,
                    receiver_user_id: receiverUserId,
                    message: "Your book has been submitted for exchange",
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

        } catch (err) {
            console.error(err);
            alert("Failed to send exchange request.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="exchange-request-form">
            <label>
                Delivery Method:
                <input
                    type="text"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    required
                />
            </label>
            <label>
                Delivery Duration:
                <input
                    type="text"
                    value={deliveryDuration}
                    onChange={(e) => setDeliveryDuration(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Send Request</button>
        </form>
    );
};

export default ExchangeRequestForm;
