import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExchangeRequestList.css";

const ExchangeRequestList = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/exchange-requests", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch exchange requests.");
        }
    };

    return (
        <div className="exchange-request-list">
            <h2>Exchange Requests</h2>
            {requests.length === 0 ? (
                <p>No exchange requests found.</p>
            ) : (
                <ul>
                    {requests.map((request) => (
                        <li key={request.id}>
                            <strong>Book:</strong> {request.book_title} by {request.book_author} <br />
                            <strong>From:</strong> {request.sender_name} <br />
                            <strong>To:</strong> {request.receiver_name} <br />
                            <strong>Status:</strong> {request.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ExchangeRequestList;
