'use client'
import React, { useState } from 'react';
import Upd from "src/app/update/page";
import { Book } from '../../core/model/book';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import { Box, Typography, Card, CardMedia, CardContent, Rating, TextField, Button, Alert } from '@mui/material';
import styles from 'static/css/app/layout.css'
function Home() {
    const [searchText, setSearchText] = useState({ author: '', isbn: '', title: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [showUpdateComponent, setShowUpdateComponent] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book>();
    const sanitizeTitle = (title) => {
        return title.replace(/#/g, '');
    };


    const handleSearch = async () => {
        try {
            const { author, isbn, title } = searchText;

            if (author.trim() === '' || isbn.trim() === '' || title.trim() === '') {
                setError('All fields are required!');
                return;
            }
            const sanitizedTitle = sanitizeTitle(searchText.title);
            let url = `http://localhost:4000/books/search?page=1&limit=15`;
            url += `&author=${author}&isbn=${isbn}&title=${sanitizedTitle}`;

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

    const isSearchButtonDisabled = !(
        searchText.author.trim() !== '' &&
        searchText.isbn.trim() !== '' &&
        searchText.title.trim() !== ''
    );

    return (
        <div>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Single Book</h1>
            <FormGroup style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TextField
                        type="text"
                        name="author"
                        placeholder="Search by author..."
                        value={searchText.author}
                        onChange={handleInputChange}
                    />
                    <TextField
                        type="text"
                        name="isbn"
                        placeholder="Search by ISBN..."
                        value={searchText.isbn}
                        onChange={handleInputChange}
                    />
                    <TextField
                        type="text"
                        name="title"
                        placeholder="Search by title..."
                        value={searchText.title}
                        onChange={handleInputChange}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        sx={{ padding: "25px" }}
                        onClick={handleSearch}
                        disabled={isSearchButtonDisabled}
                    >
                        Submit
                    </Button>
                </div>
                {isSearchButtonDisabled && <FormHelperText sx={{color: 'red'}}>Search using all 3 parameters!</FormHelperText>}
            </FormGroup>

            {searchResults.length !== 0 && (
                <div>
                    {error && (
                        <Alert severity="warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {error}
                        </Alert>
                    )}
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
                        <button onClick={() => setShowUpdateComponent(!showUpdateComponent)}>Update Book</button>
                    )}
                    {showUpdateComponent && selectedBook && (
                        <div>
                            <Upd
                                defaultAuthor={selectedBook.authors}
                                defaultIsbn={selectedBook.isbn13}
                                defaultTitle={sanitizeTitle(selectedBook.title)}
                            />
                        </div>
                    )}

                    {deleteVisible && selectedBook && (
                        <button  className ={styles}  onClick={() => handleDelete()}>Delete Book</button>
                    )}

                </div>
            )}

            {error && <Alert severity="error">{error}</Alert>}
        </div>
    );
}

export default Home;
