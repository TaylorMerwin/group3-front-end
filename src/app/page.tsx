'use client'
import React, { useState } from 'react';
function Home() {
    // State to manage search input, search results, selected criteria, error, and pagination
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCriteria, setSelectedCriteria] = useState({
        author: false,
        isbn: false,
        title: false,
        range:false
    });
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Function to handle search with pagination
    const handleSearch = async (page = 1, limit = 15) => {
        try {
            let url = `http://localhost:4000/books/search?page=${page}&limit=${limit}`;
            let criteria = [];
            
            // Constructing the URL based on selected criteria
            if (selectedCriteria.author) criteria.push(`author=${searchText}`);
            if (selectedCriteria.isbn) criteria.push(`isbn=${searchText}`);
            if (selectedCriteria.title) criteria.push(`title=${searchText}`);
            if (selectedCriteria.range) criteria.push(`${searchText}`);
            // If no criteria selected, return
            if (criteria.length === 0) {
                setError('Please select one of the options to search.');
                return;
            }
            
            // Joining criteria with '&'
            url += '&' + criteria.join('&');
            
            // Fetch data based on the constructed URL
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.books);



                setTotalPages(data.totalPages);
                setCurrentPage(page);
                setError("");

                const book = data.books[0];
                if(book){

                }
                else{
                    setError("");
                }
            } else {
                const errorMessage = await response.text();
                setError("Invalid");
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again later.');
            setSearchResults([]);
        }
    };

    // Function to handle checkbox selection
    const handleCheckboxChange = (criteria) => {
        setSelectedCriteria({
            ...selectedCriteria,
            [criteria]: !selectedCriteria[criteria]
        });
    };

    // Function to handle pagination
    const handlePagination = (page) => {
        handleSearch(page);
    };

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <div>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <label>
                    Author
                    <input
                        type="checkbox"
                        checked={selectedCriteria.author}
                        onChange={() => handleCheckboxChange('author')}
                    />
                </label>
                <label>
                    ISBN
                    <input
                        type="checkbox"
                        checked={selectedCriteria.isbn}
                        onChange={() => handleCheckboxChange('isbn')}
                    />
                </label>
                <label>
                    Title
                    <input
                        type="checkbox"
                        checked={selectedCriteria.title}
                        onChange={() => handleCheckboxChange('title')}
                    />
                </label>
                <label>
                    Range (Type offset=?&min=?)
                    <input
                        type="checkbox"
                        checked={selectedCriteria.range}
                        onChange={() => handleCheckboxChange('range')}
                    />
                </label>
            </div>
            <button onClick={() => handleSearch()}>Submit</button>
            {searchResults.length !== 0 && (
    <div>
        <h2>Search Results:</h2>
        <ul>
            {searchResults
                .slice((currentPage - 1) * 15, currentPage * 15)
                .map((book, index) => (
                    <li key={book.id || index}>
                       
                        ISBN13: {book.isbn13} -
                        Title: {book.title} - Authors: {book.authors} - Publication: {book.publication} - 
                        Average Rating: {book.ratings.average} - 
                        Rating Count: {book.ratings.count} - Rating_star_1: {book.ratings.rating_1} - Rating_star_2: {book.ratings.rating_2} - 
                        Rating_star_3: {book.ratings.rating_3} - Rating_star_4: {book.ratings.rating_4} - Rating_star_5: {book.ratings.rating_5}
                        <br />
                        <img src={book.icons.large} alt={book.title} />
                    </li>
                ))}
        </ul>
    </div>
)}

            {searchResults.length > 5 && (
    <div>
        <button onClick={() => handlePagination(currentPage - 1)} disabled={currentPage === 1}>
            Previous 
        </button>
        <span>Page {currentPage} of {Math.ceil(searchResults.length /15)}</span>
        <button onClick={() => handlePagination(currentPage + 1)} disabled={currentPage === Math.ceil(searchResults.length / 15)}>
            Next 
        </button>
    </div>
)}
     
            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default Home;