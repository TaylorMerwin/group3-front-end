import { pool } from '../db/sql_conn';
import { QueryResult } from 'pg';
import { INewBook } from '../models/book.model';

// retrievals

// Get all books using pagination
export async function getAllBooks(
    limit: number,
    offset: number
): Promise<QueryResult> {
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      AVG(r.rating) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    ORDER BY b.id
    LIMIT $1 OFFSET $2;
  `;

    const values = [limit, offset];
    return pool.query(theQuery, values);
}

// Function to get a book by ISBN
export async function getBookByISBN(isbn: string): Promise<QueryResult> {
    const theQuery = `
  SELECT 
  b.isbn13,
  b.authors,
  b.publication_year,
  b.original_title,
  b.title,
  b.image_url,
  b.image_small_url,
  COUNT(r.rating) as rating_count, 
  AVG(r.rating) as average_rating,
  SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
  SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
  SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
  SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
  SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
FROM books b
LEFT JOIN ratings r ON b.id = r.book_id
WHERE b.isbn13 = $1
GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url;
`;
    const values = [isbn];
    return pool.query(theQuery, values);
}

export async function getBooksByTitle(
    title: string,
    offset: string,
    limit: string
): Promise<QueryResult> {
    const searchPattern = `%${title}%`;
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      AVG(r.rating) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    WHERE b.title LIKE $1
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    ORDER BY b.id ASC 
    OFFSET $2
    LIMIT $3;
  `;
    const values = [searchPattern, offset, limit];
    return pool.query(theQuery, values);
}

// Function to get books by publication year
export async function getBooksByPublicationYear(
    year: number,
    offset: string,
    limit: string
): Promise<QueryResult> {
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      AVG(r.rating) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    WHERE b.publication_year = $1
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    ORDER BY b.id ASC
    OFFSET $2
    LIMIT $3;
  `;

    const values = [year, offset, limit];
    return pool.query(theQuery, values);
}

export async function getBooksByAuthor(
    authorName: string,
    offset: string,
    limit: string
): Promise<QueryResult> {
    // Create a search pattern with wildcards to find author name
    const searchPattern = `%${authorName}%`;
    const values = [searchPattern, offset, limit];
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      AVG(r.rating) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    WHERE b.authors LIKE $1
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    ORDER BY b.id ASC
    OFFSET $2
    LIMIT $3;
  `;

    return pool.query(theQuery, values);
}

export async function getBookById(id: string): Promise<QueryResult> {
    const theQuery = `
  SELECT 
  b.isbn13,
  b.authors,
  b.publication_year,
  b.original_title,
  b.title,
  b.image_url,
  b.image_small_url,
  COUNT(r.rating) as rating_count, 
  AVG(r.rating) as average_rating,
  SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
  SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
  SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
  SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
  SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
  FROM books b
  LEFT JOIN ratings r ON b.id = r.book_id
  WHERE b.id = $1
  GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url;
`;

    const values = [id];
    return pool.query(theQuery, values);
}

export async function getBooksByRating(
    rating: number,
    limit: number,
    offset: number
): Promise<QueryResult> {
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      ROUND(AVG(r.rating)) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    HAVING 
      ROUND(AVG(r.rating)) = $1 
      AND AVG(r.rating) < ($1 + 1) 
    ORDER BY b.id
    LIMIT $2 OFFSET $3;
  `;

    const values = [rating, limit, offset];
    return pool.query(theQuery, values);
}

export async function getBooksByMinimumRating(
    minRating: number,
    limit: number,
    offset: number
): Promise<QueryResult> {
    const theQuery = `
    SELECT 
      b.isbn13,
      b.authors,
      b.publication_year,
      b.original_title,
      b.title,
      b.image_url,
      b.image_small_url,
      COUNT(r.rating) as rating_count, 
      ROUND(AVG(r.rating)) as average_rating,
      SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1_star,
      SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2_star,
      SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3_star,
      SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4_star,
      SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5_star
    FROM books b
    LEFT JOIN ratings r ON b.id = r.book_id
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url
    HAVING ROUND(AVG(r.rating)) >= $1
    ORDER BY b.id
    LIMIT $2 OFFSET $3;
  `;

    const values = [minRating, limit, offset];
    return pool.query(theQuery, values);
}

// Updates

export async function updateBookTitleByISBN(
    isbn: string,
    newTitle: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET title = $2
    WHERE isbn13 = $1
    RETURNING *;
  `;
    const values = [isbn, newTitle];
    return pool.query(theQuery, values);
}

export async function updateBookTitleById(
    id: string,
    newTitle: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET title = $2
    WHERE id = $1
    RETURNING *;
  `;
    const values = [id, newTitle];
    return pool.query(theQuery, values);
}

export async function updateBookAuthorsByISBN(
    isbn: string,
    newAuthors: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET authors = $2
    WHERE isbn13 = $1
    RETURNING *;
  `;
    const values = [isbn, newAuthors];
    return pool.query(theQuery, values);
}

export async function updateBookAuthorsById(
    id: string,
    newAuthors: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET authors = $2
    WHERE id = $1
    RETURNING *;
  `;
    const values = [id, newAuthors];
    return pool.query(theQuery, values);
}

export async function updateBookPublicationYearByISBN(
    isbn: string,
    newYear: number
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET publication_year = $2
    WHERE isbn13 = $1
    RETURNING *;
  `;
    const values = [isbn, newYear];
    return pool.query(theQuery, values);
}

export async function updateBookISBNByISBN(
    isbn: string,
    newIsbn: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET isbn13 = $2
    WHERE isbn13 = $1
    RETURNING *;
  `;
    const values = [isbn, newIsbn];
    return pool.query(theQuery, values);
}

export async function updateBookISBNById(
    id: string,
    newIsbn: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET isbn13 = $2
    WHERE id = $1
    RETURNING *;
  `;
    const values = [id, newIsbn];
    return pool.query(theQuery, values);
}

export async function updateBookImagesByISBN(
    isbn: string,
    newImageUrl: string,
    newSmallImageUrl: string
): Promise<QueryResult> {
    const theQuery = `
    UPDATE books
    SET image_url = $2, image_small_url = $3
    WHERE isbn13 = $1
    RETURNING *;
  `;
    const values = [isbn, newImageUrl, newSmallImageUrl];
    return pool.query(theQuery, values);
}

// Insert

export async function addNewBook(bookData: INewBook): Promise<QueryResult> {
    const theQuery = `
    INSERT INTO books (isbn13, authors, publication_year, original_title, title, image_url, image_small_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING isbn13, authors, publication_year, original_title, title, image_url, image_small_url;
  `;

    const values = [
        BigInt(bookData.isbn13),
        bookData.authors,
        bookData.publicationYear,
        bookData.originalTitle,
        bookData.title,
        bookData.imageUrl,
        bookData.imageSmallUrl,
    ];

    return pool.query(theQuery, values);
}

//Deletes

export async function deleteBookByISBN(isbn: string): Promise<QueryResult> {
    const theQuery = `
  DELETE FROM books
  WHERE isbn13 = $1
  RETURNING *;
  `;
    const values = [isbn];
    return pool.query(theQuery, values);
}

export async function deleteBookById(id: string): Promise<QueryResult> {
    const theQuery = `
  DELETE FROM books
  WHERE id = $1
  RETURNING *;
  `;
    const values = [id];
    return pool.query(theQuery, values);
}

export async function deleteBookByTitle(title: string): Promise<QueryResult> {
    const theQuery = `
  DELETE FROM books 
  WHERE title = $1
  RETURNING *;`;
    const values = [title];

    return pool.query(theQuery, values);
}
