import React from "react";
import MessageList from "./MessageList";

const ExchangeRequestDetails = ({ exchangeRequestId }) => {
    return (
        <div>
            <h2>Exchange Request Details</h2>
            <MessageList exchangeRequestId={exchangeRequestId} />
        </div>
    );
};

export default ExchangeRequestDetails;
