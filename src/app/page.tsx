'use client'
import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Pagination from '@mui/material/Pagination';

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

    const checkboxLabel = {
        inputProps: { 'aria-label': 'Checkbox for search queries' }
    };

    const handleSearch = async (page = 1, limit = 15) => {
        try {
            let url = `http://localhost:4000/books/search?page=${page}&offset=1000000`;
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
            console.log(url);
            
            // Fetch data based on the constructed URL
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const tPages = Math.ceil(data.books.length / limit);
                setTotalPages(tPages);
                console.log(tPages);
                handlePageChangeSearch(page, limit);
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

    // Function to handle search with pagination
    const handlePageChangeSearch = async (page = 1, limit = 15) => {
        try {
            let url = `http://localhost:4000/books/search?page=${page}&offset=${limit}`;
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
            console.log(url);
            
            // Fetch data based on the constructed URL
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.books);
                console.log(data.books);
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

    // Debug Function, can be deleted
    useEffect(() => {
        console.log('Updated searchResults:', searchResults);
        console.log('Current page', currentPage)
        console.log('Total pages', totalPages)
        
    }, [searchResults]);

    // Function to handle checkbox selection
    const handleCheckboxChange = (criteria) => {
        setSelectedCriteria({
            ...selectedCriteria,
            [criteria]: !selectedCriteria[criteria]
        });
    };

    // Function to handle pagination
    const handlePagination = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        handlePageChangeSearch(page);
    };

    return (
        <div>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Welcome to the Home Page</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                        <FormLabel component="legend">Search for Keywords in:</FormLabel>
                        <FormGroup sx={{ flexDirection: 'row' }}>
                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedCriteria.author}
                                    onChange={() => handleCheckboxChange('author')}
                                />}
                                label="Author"
                                labelPlacement="bottom"
                            />
                            
                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedCriteria.isbn}
                                    onChange={() => handleCheckboxChange('isbn')}
                                />}
                                label="ISBN"
                                labelPlacement="bottom"
                            />

                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedCriteria.title}
                                    onChange={() => handleCheckboxChange('title')}
                                />}
                                label="Title"
                                labelPlacement="bottom"
                            />
                        </FormGroup>
                        <FormHelperText sx={{color: 'red'}}>Check 1 or more:</FormHelperText>
                    </FormControl>
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
            </div>
            {searchResults.length !== 0 && (
                    <div>
                        <h2>Search Results:</h2>
                        <ul>
                            {searchResults
                                .slice(0, 15)
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
                <Pagination count={totalPages} color="primary" onChange={handlePagination} />
            </div>
            )}
        
            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default Home;