'use client'
import React, { useState } from 'react';

function Home() {
    // State to manage search input, search results, selected criteria, and error
    const [isbn, setIsbn] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [ratingType, setRatingType] = useState('rating_1_star'); // Default value
    const [changeType, setChangeType] = useState('increaseby'); // Default value
    const [value, setValue] = useState('5'); // Default value
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);

    // Function to handle search
    const handleSearch = async () => {
        try {
            let url = 'http://localhost:4000/books/update?';
            let criteria = [];

            if (isbn) criteria.push(`isbn=${isbn}`);
            if (title) criteria.push(`title=${title}`);
            if (author) criteria.push(`author=${author}`);
            if (ratingType) criteria.push(`ratingtype=${ratingType}`);
            if (changeType) criteria.push(`changetype=${changeType}`);
            if (value) criteria.push(`value=${value}`);

            // If no criteria selected, return
            if (criteria.length === 0) {
                setError('Please fill in at least one field.');
                return;
            }

            // Joining criteria with '&'
            url += criteria.join('&');

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(criteria)
            };

            // Fetch data based on the constructed URL and request options
            const response = await fetch(url, requestOptions);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
                setError(null);
            } else {
                setError("Invalid");
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again later.');
            setSearchResults([]);
        }
    };

    return (
        <div>
            <h1>Update</h1>
            <div>
                <label>ISBN:</label>
                <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                />
            </div>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label>Author:</label>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
            </div>
            <div>
                <label>Rating Type:</label>
                <input
                    type="text"
                    value={ratingType}
                    onChange={(e) => setRatingType(e.target.value)}
                />
            </div>
            <div>
                <label>Change Type:</label>
                <input
                    type="text"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                />
            </div>
            <div>
                <label>Value:</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            <button onClick={handleSearch}>Submit</button>
            {searchResults.length !== 0 && (
                <div>
                   Updated successfully
                </div>
            )}
            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default Home;
