'use client'
import React, { useState, useEffect } from 'react';
import Upd from "src/app/update/page";

function Home() {
    const [searchText, setSearchText] = useState({ author: '', isbn: '', title: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({
        author: false,
        isbn: false,
        title: false,
    });
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [showUpdateComponent, setShowUpdateComponent] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const handleSearch = async () => {
        try {
            if (count < 3) {
                setError('Please fill out all options to display a single book.');
                return;
            }
           
            let url = `http://localhost:4000/books/search?page=1&limit=15`;
            let options = [];

            if (selectedOptions.author) options.push(`author=${searchText.author}`);
            if (selectedOptions.isbn) options.push(`isbn=${searchText.isbn}`);
            if (selectedOptions.title) options.push(`title=${searchText.title}`);
            if(searchText.author.trim()!==''&&searchText.isbn.trim()!==''&&searchText.title.trim()!==''){
            url += '&' + options.join('&');
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const book = data.books[0];
                if (book) {
                    setSearchResults([book]);
                    setError(null);
                    setUpdateVisible(true);
                    setDeleteVisible(true);
                    setSelectedBook(book);
                } else {
                    setError('No books found.');
                    setSearchResults([]);
                    setUpdateVisible(false);
                    setDeleteVisible(false);
                }
            } else {
                const errorMessage = await response.text();
                setError(errorMessage);
                setSearchResults([]);
                setUpdateVisible(false);
                setDeleteVisible(false);
            }
        
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again later.');
            setSearchResults([]);
            setUpdateVisible(false);
            setDeleteVisible(false);
        }
    };

    const handleCheckboxChange = (criteria) => {
        const newValue = !selectedOptions[criteria];
        setSelectedOptions({
            ...selectedOptions,
            [criteria]: newValue
        });

        setCount(prevCount => newValue ? prevCount + 1 : prevCount - 1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchText({
            ...searchText,
            [name]: value
        });
    };

    const handleCloseUpdate = () => {
        setShowUpdateComponent(false);
    };

    const handleDelete = async () => {
        if (selectedBook) {
            console.log(`Deleting book with ISBN: ${selectedBook.isbn13}`);
            let url = `http://localhost:4000/books/deleteIsbn?isbn=${selectedBook.isbn13}`;
            console.log(url);
            setDeleteVisible(false);
            await fetch(url, { method: 'DELETE' });
            // Hide book from results
            setSearchResults(searchResults.filter(book => book.isbn13 !== selectedBook.isbn13));
        }
    };

    return (
        <div>
            <h1>Single Book</h1>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={selectedOptions.author}
                        onChange={() => handleCheckboxChange('author')}
                    />
                    Author
                </label>
                
                {selectedOptions.author && (
                    <input
                        type="text"
                        name="author"
                        placeholder="Search by author..."
                        value={searchText.author}
                        onChange={handleInputChange}
                    />
                )}
                <br />
                <label>
                    <input
                        type="checkbox"
                        checked={selectedOptions.isbn}
                        onChange={() => handleCheckboxChange('isbn')}
                    />
                    ISBN
                </label>
                {selectedOptions.isbn && (
                    <input
                        type="text"
                        name="isbn"
                        placeholder="Search by ISBN..."
                        value={searchText.isbn}
                        onChange={handleInputChange}
                    />
                )}
                <br />
                <label>
                    <input
                        type="checkbox"
                        checked={selectedOptions.title}
                        onChange={() => handleCheckboxChange('title')}
                    />
                    Title
                </label>
                {selectedOptions.title && (
                    <input
                        type="text"
                        name="title"
                        placeholder="Search by title..."
                        value={searchText.title}
                        onChange={handleInputChange}
                    />
                )}
            </div>
            <button onClick={handleSearch}>Submit</button>

            {searchResults.length !== 0 && (
                <div>
                    {count !== 3 && <p>Please fill out all options to display a single book.</p>}
                    <h2>Search Result:</h2>
                    <ul>
                        {searchResults.map((book, index) => (
                            <li key={book.id || index}>
                                {book.isbn13 && <p>ISBN13: {book.isbn13}</p>}
                                {book.title && <p>Title: {book.title}</p>}
                                {book.authors && <p>Authors: {book.authors}</p>}
                                
                                {book.publication && <p>Publication: {book.publication}</p>}
                                {book.ratings && (
                                    <p>
                                        Average Rating: {book.ratings.average} - 
                                        Rating Count: {book.ratings.count} - 
                                        Rating_star_1: {book.ratings.rating_1}
                                    </p>
                                )}
                                {book.icons && book.icons.large && <img src={book.icons.large} alt={book.title} />}
                            </li>
                        ))}
                    </ul>
                    {updateVisible && (
                        <button onClick={() => setShowUpdateComponent(true)}>Open Update</button>
                    )}
                    {showUpdateComponent && selectedBook && (
                        <div>
                            <Upd
                                defaultAuthor={selectedBook.authors}
                                defaultIsbn={selectedBook.isbn13}
                                defaultTitle={selectedBook.title}
                            />
                            <button onClick={handleCloseUpdate}>Close Update</button>
                        </div>
                    )}

                    {deleteVisible && selectedBook && (
                        <button onClick={() => handleDelete()}>Delete Book</button>
                    )}

                </div>
            )}


            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default Home;
