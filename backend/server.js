const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const cors = require("cors");
const { promisify } = require("util");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database.");
});

const dbQuery = promisify(db.query).bind(db);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Access Token Required" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

app.get("/api/exchange-requests", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT er.*, b.title AS book_title, b.author AS book_author, 
                   su.name AS sender_name, ru.name AS receiver_name
            FROM exchange_requests er
            JOIN books b ON er.book_id = b.id
            JOIN users su ON er.sender_user_id = su.id
            JOIN users ru ON er.receiver_user_id = ru.id
            WHERE er.sender_user_id = ? OR er.receiver_user_id = ?
        `;
        const results = await dbQuery(query, [userId, userId]);

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch exchange requests." });
    }
});


app.post("/api/exchange-request", authenticateToken, async (req, res) => {
    const { book_id, receiver_user_id, delivery_method, delivery_duration } = req.body;
    const sender_user_id = req.user.id;

    try {
        const query = `
            INSERT INTO exchange_requests (sender_user_id, receiver_user_id, book_id, delivery_method, delivery_duration)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await dbQuery(query, [sender_user_id, receiver_user_id, book_id, delivery_method, delivery_duration]);

        const exchangeRequestId = result.insertId;

        const initialMessage = `Hi! I have sent an exchange request for your book. Let's discuss the details!`;
        const messageQuery = `
            INSERT INTO messages (exchange_request_id, sender_user_id, receiver_user_id, message)
            VALUES (?, ?, ?, ?)
        `;
        await dbQuery(messageQuery, [exchangeRequestId, sender_user_id, receiver_user_id, initialMessage]);

        res.status(201).json({ message: "Exchange request sent successfully.", exchangeRequestId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send exchange request." });
    }
});

app.get("/api/books/all", authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.name AS owner_name, u.id AS owner_id 
            FROM books b
            JOIN users u ON b.user_id = u.id
            WHERE b.availability_status = 'Available'
        `;
        const books = await dbQuery(query);
        const loggedInUserId = req.user.id;

        
        const booksWithOwnershipFlag = books.map(book => ({
            ...book,
            isMyBook: book.owner_id === loggedInUserId,
        }));

        res.status(200).json(booksWithOwnershipFlag);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch books." });
    }
});

app.post("/api/messages", authenticateToken, async (req, res) => {
    const { exchange_request_id, receiver_user_id, message } = req.body;
    const sender_user_id = req.user.id;

    try {
        const query = `
            INSERT INTO messages (exchange_request_id, sender_user_id, receiver_user_id, message)
            VALUES (?, ?, ?, ?)
        `;
        await dbQuery(query, [exchange_request_id, sender_user_id, receiver_user_id, message]);

        res.status(201).json({ message: "Message sent successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send message." });
    }
});

app.get("/api/messages/:exchange_request_id", authenticateToken, async (req, res) => {
    const exchangeRequestId = req.params.exchange_request_id;

    try {
        const query = `
            SELECT m.*, u.name AS sender_name
            FROM messages m
            JOIN users u ON m.sender_user_id = u.id
            WHERE m.exchange_request_id = ?
            ORDER BY m.created_at ASC
        `;
        const messages = await dbQuery(query, [exchangeRequestId]);

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch messages." });
    }
});

app.get("/api/messages", authenticateToken, async (req, res) => {
    const exchangeRequestId = req.params.exchange_request_id;

    try {
        const query = `
            SELECT m.*, u.name AS sender_name
            FROM messages m
            JOIN users u ON m.sender_user_id = u.id
            ORDER BY m.created_at ASC
        `;
        const messages = await dbQuery(query, [exchangeRequestId]);

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch messages." });
    }
});

app.get("/api/user-messages", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT er.id AS exchange_request_id, b.title AS book_title,
                   u.name AS other_user_name,
                   (CASE WHEN er.sender_user_id = ? THEN er.receiver_user_id ELSE er.sender_user_id END) AS other_user_id,
                   m.message AS last_message, m.created_at AS last_message_time
            FROM exchange_requests er
            JOIN messages m ON m.exchange_request_id = er.id
            JOIN books b ON er.book_id = b.id
            JOIN users u ON u.id = (CASE WHEN er.sender_user_id = ? THEN er.receiver_user_id ELSE er.sender_user_id END)
            WHERE er.sender_user_id = ? OR er.receiver_user_id = ?
            GROUP BY er.id
            ORDER BY m.created_at DESC;
        `;
        const results = await dbQuery(query, [userId, userId, userId, userId]);

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user messages." });
    }
});


app.put("/api/exchange-request/:id", authenticateToken, async (req, res) => {
    const { status, delivery_method, delivery_duration } = req.body;
    const exchangeRequestId = req.params.id;

    try {
        const query = `
            UPDATE exchange_requests 
            SET status = ?, delivery_method = ?, delivery_duration = ?
            WHERE id = ?
        `;
        await dbQuery(query, [status, delivery_method, delivery_duration, exchangeRequestId]);

        res.status(200).json({ message: "Exchange request updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update exchange request" });
    }
});

app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await dbQuery(query, [name, email, hashedPassword]);
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists." });
        }
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = "SELECT * FROM users WHERE email = ?";
        const results = await dbQuery(query, [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});


app.post("/api/books", authenticateToken, async (req, res) => {
    const { title, author, genre, condition, availability_status } = req.body;
    const user_id = req.user.id;

    if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required." });
    }

    try {
        const query = "INSERT INTO books (user_id, title, author, genre, `condition`, availability_status) VALUES (?, ?, ?, ?, ?, ?)";
        console.log(query);
        const result = await dbQuery(query, [user_id, title, author, genre, condition, availability_status]);
        res.status(201).json({ message: "Book listed successfully.", bookId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


app.get("/api/books", authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const query = "SELECT * FROM books WHERE user_id = ?";
        const books = await dbQuery(query, [user_id]);
        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


app.get("/api/books/:id", authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const bookId = req.params.id;

    try {
        const query = "SELECT * FROM books WHERE id = ? AND user_id = ?";
        const books = await dbQuery(query, [bookId, user_id]);

        if (books.length === 0) {
            return res.status(404).json({ message: "Book not found." });
        }

        res.status(200).json(books[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


app.put("/api/books/:id", authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const bookId = req.params.id;
    const { title, author, genre, condition, availability_status } = req.body;

    try {
        
        const checkQuery = "SELECT * FROM books WHERE id = ? AND user_id = ?";
        const books = await dbQuery(checkQuery, [bookId, user_id]);

        if (books.length === 0) {
            return res.status(404).json({ message: "Book not found." });
        }

        
        const updateQuery = "UPDATE books SET title = ?, author = ?, genre = ?, condition = ?, availability_status = ? WHERE id = ?";
        await dbQuery(updateQuery, [title, author, genre, condition, availability_status, bookId]);

        res.status(200).json({ message: "Book updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


app.delete("/api/books/:id", authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const bookId = req.params.id;

    try {
        
        const checkQuery = "SELECT * FROM books WHERE id = ? AND user_id = ?";
        const books = await dbQuery(checkQuery, [bookId, user_id]);

        if (books.length === 0) {
            return res.status(404).json({ message: "Book not found." });
        }

        
        const deleteQuery = "DELETE FROM books WHERE id = ?";
        await dbQuery(deleteQuery, [bookId]);

        res.status(200).json({ message: "Book deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


app.get("/api/books/search", authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { title, author, genre, condition, availability_status } = req.query;

    try {
        
        let query = "SELECT * FROM books WHERE user_id = ?";
        let queryParams = [user_id];

        if (title) {
            query += " AND title LIKE ?";
            queryParams.push(`%${title}%`);
        }
        if (author) {
            query += " AND author LIKE ?";
            queryParams.push(`%${author}%`);
        }
        if (genre) {
            query += " AND genre LIKE ?";
            queryParams.push(`%${genre}%`);
        }
        if (condition) {
            query += " AND `condition` LIKE ?";
            queryParams.push(`%${condition}%`);
        }
        if (availability_status) {
            query += " AND availability_status = ?";
            queryParams.push(availability_status);
        }

        const books = await dbQuery(query, queryParams);

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found matching the search criteria." });
        }

        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});
