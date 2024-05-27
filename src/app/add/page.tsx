'use client';
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { request } from "http";

export default function AddBook() {
  const [bookData, setBookData] = React.useState({
    id: 0,
    isbn13: "1111111111111",
    authors: "John Doe",
    publication_year: 2024,
    original_title: "Original Title",
    title: "Title",
    rating_avg: 2.5,
    rating_count: 100,
    rating_1_star: 50,
    rating_2_star: 0,
    rating_3_star: 0,
    rating_4_star: 0,
    rating_5_star: 50,
    image_url: "https://picsum.photos/500",
    image_small_url: "https://picsum.photos/200"
});
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:4000/books/addBook', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    if (response.ok) {
      alert('Book added successfully');
      // Optionally, clear the form or redirect to another page
    } else {
      console.error('Failed to add book: ', response.statusText); // Log the error to the console
      alert('Failed to add book!' + response.statusText);
    }
  } catch (error) {
    console.error('Error adding book:', error); // Log any network or other errors
    alert('An error occurred while adding the book.');
  }
};

return (
  <form onSubmit={handleSubmit}>
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Add a Book!!1!
      </Typography>
      <Box>
      <label>
          ID:
          <input
            type="text"
            value={bookData.id}
            onChange={(e) => setBookData({ ...bookData, id: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          ISBN13:
          <input
            type="text"
            value={bookData.isbn13}
            onChange={(e) => setBookData({ ...bookData, isbn13: e.target.value })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Authors:
          <input
            type="text"
            value={bookData.authors}
            onChange={(e) => setBookData({ ...bookData, authors: e.target.value })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Publication Year:
          <input
            type="number"
            value={bookData.publication_year}
            onChange={(e) => setBookData({ ...bookData, publication_year: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Original Title:
          <input
            type="text"
            value={bookData.original_title}
            onChange={(e) => setBookData({ ...bookData, original_title: e.target.value })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Title:
          <input
            type="text"
            value={bookData.title}
            onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating Average:
          <input
            type="number"
            value={bookData.rating_avg}
            onChange={(e) => setBookData({ ...bookData, rating_avg: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating Count:
          <input
            type="number"
            value={bookData.rating_count}
            onChange={(e) => setBookData({ ...bookData, rating_count: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating 1 Star:
          <input
            type="number"
            value={bookData.rating_1_star}
            onChange={(e) => setBookData({ ...bookData, rating_1_star: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating 2 Star:
          <input
            type="number"
            value={bookData.rating_2_star}
            onChange={(e) => setBookData({ ...bookData, rating_2_star: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating 3 Star:
          <input
            type="number"
            value={bookData.rating_3_star}
            onChange={(e) => setBookData({ ...bookData, rating_3_star: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating 4 Star:
          <input
            type="number"
            value={bookData.rating_4_star}
            onChange={(e) => setBookData({ ...bookData, rating_4_star: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Rating 5 Star:
          <input
            type="number"
            value={bookData.rating_5_star}
            onChange={(e) => setBookData({ ...bookData, rating_5_star: parseInt(e.target.value) })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Image Url:
          <input
            type="text"
            value={bookData.image_url}
            onChange={(e) => setBookData({ ...bookData, image_url: e.target.value })}
          />
        </label>
      </Box>
      <Box>
        <label>
          Small Image Url:
          <input
            type="text"
            value={bookData.image_small_url}
            onChange={(e) => setBookData({ ...bookData, image_small_url: e.target.value })}
          />
        </label>
      </Box>
      </Container>
      <button type="submit">Add Book</button>
    </form> 
);  
}