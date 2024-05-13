import { pool } from '../db/sql_conn';
import { QueryResult } from 'pg';  

// retrievals

// Get all books using pagination
export async function getAllBooks(limit: number, offset: number): Promise<QueryResult> {
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

// Function to get books by publication year
export async function getBooksByPublicationYear(year: number): Promise<QueryResult> {
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
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url;
  `;

  const values = [year];
  return pool.query(theQuery, values);
}


export async function getBooksByAuthor(authorName: string): Promise<QueryResult> {
  // Create a search pattern with wildcards to find author name
  const searchPattern = `%${authorName}%`;
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
    GROUP BY b.id, b.isbn13, b.authors, b.publication_year, b.original_title, b.title, b.image_url, b.image_small_url;
  `;

  return pool.query(theQuery, [searchPattern]);
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

export async function getBooksByRating(rating: number, limit: number, offset: number): Promise<QueryResult> {
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

export async function getBooksByMinimumRating(minRating: number, limit: number, offset: number): Promise<QueryResult> {
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
