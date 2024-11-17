import React, { useState } from "react";
import axios from "axios";

const Search = ({ setBooks }) => {
    const [searchParams, setSearchParams] = useState({
        title: "",
        author: "",
        genre: "",
        condition: "",
        availability_status: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/books/search", {
                params: searchParams,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBooks(response.data);
        } catch (error) {
            console.error("Error searching for books", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    name="title"
                    placeholder="Search by title"
                    value={searchParams.title}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="author"
                    placeholder="Search by author"
                    value={searchParams.author}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="genre"
                    placeholder="Search by genre"
                    value={searchParams.genre}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="condition"
                    placeholder="Search by condition"
                    value={searchParams.condition}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="availability_status"
                    placeholder="Search by availability status"
                    value={searchParams.availability_status}
                    onChange={handleInputChange}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    );
};

export default Search;
