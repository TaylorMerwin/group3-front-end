'use client'
import React, { useState, useEffect } from 'react';
import { Book } from '../core/model/book';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Pagination from '@mui/material/Pagination';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Rating, Alert, TextField, MenuItem, Button } from '@mui/material';


function Home() {
    // State to manage search input, search results, selected criteria, error, and pagination
    const [searchText, setSearchText] = useState('');
    const [searchMin, setSearchMin] = useState<String>('0');
    const [searchMax, setSearchMax] = useState<String>('5');
    const [searchPageSize, setPageSize] = useState<Number>(15);
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [selectedCriteria, setSelectedCriteria] = useState({
        author: false,
        isbn: false,
        title: false,
        range:false
    });
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const options = [
        { value: "N/A", label: "N/A" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" }
    ];

    const pageSizeOptions = [
        { value: 3, label: "3" },
        { value: 9, label: "9" },
        { value: 15, label: "15" },
        { value: 30, label: "30" },
        { value: 60, label: "60" }
    ];

    const checkboxLabel = {
        inputProps: { 'aria-label': 'Checkbox for search queries' }
    };

    const handleSearch = async (page = 1, limit = searchPageSize) => {
        try {
            let url = `http://localhost:4000/books/search?page=${page}&offset=1000000`;
            let criteria = [];
            setCurrentPage(1);
            
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
            
            criteria.push(`min=${searchMin}`);
            criteria.push(`max=${searchMax}`);

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
    const handlePageChangeSearch = async (page = 1, limit = searchPageSize) => {
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
            
            criteria.push(`min=${searchMin}`);
            criteria.push(`max=${searchMax}`);

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
        console.log('Min Rating', searchMin)
        console.log('Max Rating', searchMax)
        console.log('Page Size', searchPageSize)
                
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

    const handleMin = (event) => {
        if (event.target.value != "N/A") {
            setSearchMin(event.target.value);
        } else {
            setSearchMin("1");
        }
    }

    const handleMax = (event) => {
        if (event.target.value != "N/A") {
            setSearchMax(event.target.value);
        } else {
            setSearchMax("5");
        }
    }

    const handlePageSize = (event) => {
        setPageSize(event.target.value);
    }

    return (
        <div>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Welcome to the Home Page</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>

                    <TextField id="outlined-basic" label="Search..." variant="outlined" onChange={(e) => setSearchText(e.target.value)} />
                    
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

                    <TextField
                        id="outlined-select-min"
                        select
                        label="Select"
                        helperText="Select a minimum rating"
                        defaultValue="N/A"
                        onChange={handleMin}
                    >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                    </TextField>

                    <TextField
                        id="outlined-select-max"
                        select
                        label="Select"
                        helperText="Select a maximum rating"
                        defaultValue="N/A"
                        onChange={handleMax}
                        sx={{ paddingRight: "25px" }}
                    >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                    </TextField>

                    <TextField
                        id="outlined-select-page-size"
                        select
                        label="Select"
                        helperText="Select the number of books per page"
                        defaultValue={15}
                        onChange={handlePageSize}
                        sx={{ paddingRight: "25px" }}
                    >
                    {pageSizeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                    </TextField>

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
            </div>
            {searchResults.length !== 0 && (
                    <div>
                        <h2>Search Results:</h2>
                        <ul>
                            <Grid container spacing={3}>
                                {searchResults.map((book) => (
                                <Grid item xs={12} sm={6} md={4} key={book.id}>
                                    <Card sx={{ display: 'flex', height: '100%' }}> 
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            objectFit: 'cover',
                                            width: '75px',
                                            height: '50%',
                                        }}
                                        image={book.icons.small}
                                        alt={book.title}
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
                                            {book.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {book.authors}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Published: {book.publication}
                                        </Typography>
                                        <Rating name="read-only" value={book.ratings.average} readOnly />
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {book.ratings.count} ratings
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            1-Star: {book.ratings.rating_1}, 2-Star: {book.ratings.rating_2}, 
                                            3-Star: {book.ratings.rating_3}, 4-Star: {book.ratings.rating_4}, 5-Star: {book.ratings.rating_5}
                                        </Typography>
                                        <br/>
                                        </CardContent>
                                    </Box>
                                    </Card>
                                </Grid>
                                ))}
                            </Grid>
                        </ul>
                    </div>
            )}
            <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                <Pagination count={totalPages} color="primary" onChange={handlePagination} page={currentPage}/>
            </div>
        
            {error && <Alert severity="error">{error}</Alert>}
        </div>
    );
}

export default Home;