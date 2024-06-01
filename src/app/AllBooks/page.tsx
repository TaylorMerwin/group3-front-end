'use client'
import React, { useState, useEffect } from 'react';

export default function Books2() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            const res = await fetch("http://localhost:4000/books/all");
            const data = await res.json();
            setBooks(data.books);
        };

        fetchBooks();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    return (
        <div>
            <h1>Books</h1>
            <ul>
                {books.map(book => (
                       <li key={book.id }>
                       
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
    );
}
