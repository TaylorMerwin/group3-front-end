'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Book } from '../../core/model/book';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Rating } from '@mui/material';

export default function Books2() {
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch("http://localhost:4000/books/all");

                if (!res.ok) {
                    throw new Error(`Failed to fetch books: ${res.statusText}`);
                }

                const data = await res.json();
                setBooks(data.books);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBooks();
    }, []);

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            All Books
          </Typography>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card sx={{ display: 'flex', height: '100%' }}> 
                  <CardMedia
                    component="img"
                    sx={{
                        objectFit: 'cover',
                        width: '150px',
                        height: '100%',
                    }}
                    image={book.icons.large}
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
                      <br/>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
    