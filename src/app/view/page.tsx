'use client'
import React, { useState, useEffect } from 'react';
import Upd from "src/app/update/page";
import { Book } from '../../core/model/book';
import { Box, Typography, Card, CardMedia, CardContent, Rating, FormControl, FormLabel, FormGroup, FormControlLabel, FormHelperText, Checkbox, TextField, Button, Alert} from '@mui/material';

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
    const [selectedBook, setSelectedBook] = useState<Book>();

    const checkboxLabel = {
        inputProps: { 'aria-label': 'Checkbox for search queries' }
    };

    const handleSearch = async () => {
        try {
            if (count < 0) {
                setError('Requires at least one search parameter!');
                return;
            }
           
            let url = `http://localhost:4000/books/search?page=1&limit=15`;
            let options = [];

            if (selectedOptions.author) options.push(`author=${searchText.author}`);
            if (selectedOptions.isbn) options.push(`isbn=${searchText.isbn}`);
            if (selectedOptions.title) options.push(`title=${searchText.title}`);
            if(searchText.author.trim()!=='' || searchText.isbn.trim()!=='' || searchText.title.trim()!==''){
                url += '&' + options.join('&');
            } else {
                setError('Requires at least one non-blank search parameter!');
                return;
            }
            console.log(url);
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
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Single Book</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                    type="text"
                    name="author"
                    placeholder="Search by author..."
                    value={searchText.author}
                    onChange={handleInputChange}
                    disabled={!selectedOptions.author}
                />
                <TextField
                    type="text"
                    name="isbn"
                    placeholder="Search by ISBN..."
                    value={searchText.isbn}
                    onChange={handleInputChange}
                    disabled={!selectedOptions.isbn}
                />
                <TextField
                    type="text"
                    name="title"
                    placeholder="Search by title..."
                    value={searchText.title}
                    onChange={handleInputChange}
                    disabled={!selectedOptions.title}
                />
                <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                        <FormLabel component="legend">Search for Keywords in:</FormLabel>
                        <FormGroup sx={{ flexDirection: 'row' }}>
                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedOptions.author}
                                    onChange={() => handleCheckboxChange('author')}
                                />}
                                label="Author"
                                labelPlacement="bottom"
                            />
                            
                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedOptions.isbn}
                                    onChange={() => handleCheckboxChange('isbn')}
                                />}
                                label="ISBN"
                                labelPlacement="bottom"
                            />

                            <FormControlLabel control={<Checkbox {...checkboxLabel}
                                    checked={selectedOptions.title}
                                    onChange={() => handleCheckboxChange('title')}
                                />}
                                label="Title"
                                labelPlacement="bottom"
                            />
                        </FormGroup>
                        <FormHelperText sx={{color: 'red'}}>Check 1 or more:</FormHelperText>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ padding: "25px" }}
                        onClick={() => handleSearch()}
                        >
                        Submit
                    </Button>
            </div>

            {searchResults.length !== 0 && (
                <div>
                    {count !== 3 && <Alert severity="warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        Partial Search Performed: Please fill out all options to ensure you've selected the right book!
                                    </Alert>}
                    <h2>Search Result:</h2>
                    <ul>
                        {selectedBook &&
                        <Card sx={{ display: 'flex', height: '100%' }}> 
                            <CardMedia
                                component="img"
                                sx={{
                                    objectFit: 'cover',
                                    width: '150px',
                                    height: '100%',
                                }}
                                image={selectedBook.icons.large}
                                alt={selectedBook.title}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <CardContent>
                                <Typography 
                                gutterBottom 
                                variant="h5" 
                                component="div"
                                sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box', // Enable multiline truncation
                                WebkitLineClamp: 2, // Number of lines to show
                                WebkitBoxOrient: 'vertical', // Vertical orientation for the lines
                                }}
                            >
                                    {selectedBook.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedBook.authors}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Published: {selectedBook.publication}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ISBN: {selectedBook.isbn13}
                                </Typography>
                                <Rating name="read-only" value={selectedBook.ratings.average} readOnly />
                                <Typography variant="subtitle2" color="text.secondary">
                                    {selectedBook.ratings.count} ratings
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    1-Star: {selectedBook.ratings.rating_1}, 2-Star: {selectedBook.ratings.rating_2}, 
                                    3-Star: {selectedBook.ratings.rating_3}, 4-Star: {selectedBook.ratings.rating_4}, 5-Star: {selectedBook.ratings.rating_5}
                                </Typography>
                                <br/>
                                </CardContent>
                            </Box>
                        </Card>
                        }
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


            {error && <Alert severity="error">{error}</Alert>}
        </div>
    );
}

export default Home;
