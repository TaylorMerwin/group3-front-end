'use client';
import React, { useState, useEffect } from 'react';
import { Book } from '../../core/model/book';

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
        <div>
          <h1>Books</h1>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                ISBN13: {book.isbn13} - 
                Title: {book.title} - 
                Authors: {book.authors} - 
                Publication Year: {book.publication_year} - 
                Average Rating: {book.ratings.average} - 
                Rating Count: {book.ratings.count} - 
                Rating_star_1: {book.ratings.rating_1} -  
                Rating_star_2: {book.ratings.rating_2} - 
                Rating_star_3: {book.ratings.rating_3} - 
                Rating_star_4: {book.ratings.rating_4} - 
                Rating_star_5: {book.ratings.rating_5}
                <br />
                <img src={book.icons.image_url} alt={book.title} />
              </li>
            ))}
          </ul>
        </div>
      );
    }