'use client';
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add'; // Correct import for AddIcon
import RemoveIcon from '@mui/icons-material/Remove'; // Correct import for RemoveIcon
import { Button, Grid, IconButton, InputAdornment, TextField, Alert } from "@mui/material";

export default function AddBook() {
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [bookData, setBookData] = React.useState({
    id: '',
    isbn13: '',
    authors: [''],
    publication_year: '',
    original_title: '',
    title: '',
    rating_avg: 0,
    rating_count: 0,
    rating_1_star: 0,
    rating_2_star: 0,
    rating_3_star: 0,
    rating_4_star: 0,
    rating_5_star: 0,
    image_url: "https://picsum.photos/500",
    image_small_url: "https://picsum.photos/200"
  });

  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...bookData.authors];
    newAuthors[index] = value;
    setBookData({ ...bookData, authors: newAuthors });
  };

  const addAuthorField = () => {
    setBookData({ ...bookData, authors: [...bookData.authors, ''] });
  };

  const removeAuthorField = (index: number) => {
    const newAuthors = [...bookData.authors];
    newAuthors.splice(index, 1);
    setBookData({ ...bookData, authors: newAuthors });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Combine authors into a single string
    const authorsString = bookData.authors.filter(author => author.trim() !== '').join(' '); // Remove empty entries and join with spaces

    if (authorsString === '') {
      setError("At least one author is required.");
      setSuccess(null);
      return;
    }

    const dataToSend = { ...bookData, authors: authorsString, original_title: bookData.title };




    try {
      const response = await fetch('http://localhost:4000/books/addBook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Use dataToSend here
      });
      if (response.ok) {
        setSuccess('Book added successfully');
        setError(null);
        // Optionally, clear the form or redirect to another page
      } else {
        console.error('Failed to add book: ', response.statusText); // Log the error to the console
        setError('Failed to add book!' + response.statusText);
        setSuccess(null);
      }
    } catch (error) {
      console.error('Error adding book:', error); // Log any network or other errors
      setError('An error occurred while adding the book.');
      setSuccess(null);
    }
  };

  const generateRandomIsbn = () => {
    let isbn13 = '';
    for (let i = 0; i < 13; i++) {
      isbn13 += Math.floor(Math.random() * 10); // Generate random digits
    }
    return isbn13;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Container>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Add a Book</h1>

          <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2}>
              {/* ISBN-13, Authors, Publication Year */}
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  label="ISBN-13"
                  variant="outlined"
                  type="number"
                  value={bookData.isbn13}
                  onChange={(e) => setBookData({ ...bookData, isbn13: e.target.value })}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  required
                />
              </Grid>

              <Grid item xs={2}>
                <Button variant="contained" color="secondary" onClick={() => setBookData({ ...bookData, isbn13: generateRandomIsbn() })}>
                  Generate
                </Button>
              </Grid>

              {/* Authors section */}
              {bookData.authors.map((author, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    fullWidth
                    label={`Author ${index + 1}`}
                    variant="outlined"
                    value={author}
                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => removeAuthorField(index)}
                            disabled={bookData.authors.length === 1}
                            edge="end"  // Align to the end of the input field
                          >
                            <RemoveIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}
              {/* Add Author button */}
              <Grid item xs={12}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addAuthorField}>
                  Add Author
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  variant="outlined"
                  inputProps={{ maxLength: 255 }}
                  value={bookData.title}
                  onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Publication Year"
                  variant="outlined"
                  type="number"
                  value={bookData.publication_year}
                  onChange={(e) => setBookData({ ...bookData, publication_year: e.target.value })}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  variant="outlined"
                  type="url"
                  value={bookData.image_url}
                  onChange={(e) => setBookData({ ...bookData, image_url: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Small Image URL"
                  variant="outlined"
                  type="url"
                  value={bookData.image_small_url}
                  onChange={(e) => setBookData({ ...bookData, image_small_url: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Book
          </Button>
        </Container>
      </form>

      {(error != null && success == null) && <Alert severity="error">{error}</Alert>}
      {(error == null && success != null) && <Alert severity="success">{success}</Alert>}
    </div>
  );
}