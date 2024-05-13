import express, {Request, Response, Router } from "express";
import { IBook } from "../../core/models/book.model";
import { getAllBooks, getBookByISBN, getBookById, getBooksByAuthor, getBooksByMinimumRating, getBooksByPublicationYear, getBooksByRating } from "../../core/db/bookQueries";
import { adaptBookResult } from "../../core/bookAdapter";


const bookRouter: Router = express.Router();


// Get all books using pagination
 // Default to 10 books per page
 // Default to start from the beginning
bookRouter.get('/', async (request: Request, response: Response) => {
  try {
    const limit = parseInt(request.query.limit as string, 10) || 10;
    const offset = parseInt(request.query.offset as string, 10) || 0;

    const result = await getAllBooks(limit, offset);

    if (result.rowCount > 0) {
      const books: IBook[] = result.rows.map(adaptBookResult);

      response.send({ entries: books });
    } else {
      response.status(404).send({ message: 'No books found' });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching book(s): ' + error,
    });
  }
});


// Get book by ISBN
bookRouter.get('/ISBN/:isbn', async (request: Request, response: Response) => {

  try {
    const result = await getBookByISBN(request.params.isbn);

    if (result.rowCount === 1) {
      const book: IBook = adaptBookResult(result.rows[0]);
      response.send({
        entry: book,
      });
    } else {
      console.log('Book not found for ISBN:', request.params.isbn);
      response.status(404).send({
        message: 'Book not found',
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      message: 'Error fetching book' + error,
    });
  }
});


bookRouter.get('/year/:year', async (request: Request, response: Response) => {
  try {
    const result = await getBooksByPublicationYear(parseInt(request.params.year));

    if (result.rowCount > 0) {
      const books: IBook[] = result.rows.map(adaptBookResult);
      response.send({
        entries: books,
      });
    } else {
      console.log('No books found for year: ', request.params.year);
      response.status(404).send({
        message: 'No books found',
      });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching books: ' + error,
    });
  }
});

bookRouter.get('/author/:authorName', async (request: Request, response: Response) => {
  try {
    const authorName = request.params.authorName;
    const result = await getBooksByAuthor(authorName);
    if (result.rowCount > 0) {
      const books: IBook[] = result.rows.map(adaptBookResult);
      response.send({ entries: books });
    } else {
      response.status(404).send({ message: 'No books found for this author' });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching books: ' + error,
    });
  }
});

bookRouter.get('/id/:id', async (request: Request, response: Response) => {
  try {
    const result = await getBookById(request.params.id);
    if (result.rowCount === 1) {
      const book: IBook = adaptBookResult(result.rows[0]);
      response.send({
        entry: book,
      });
    } else {
      console.log('Book with specified id not found:', request.params.id);
      response.status(404).send({
        message: 'Book not found',
      });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching book: ' + error,
    });
  }
});

//Get books by rating (rounds to the nearest integer)
// Default to 10 per page
// Default to start from beginning
bookRouter.get('/rating/:rating', async (request: Request, response: Response) => {
  try {
    const rating = parseInt(request.params.rating, 10);
    const limit = parseInt(request.query.limit as string, 10) || 10; 
    const offset = parseInt(request.query.offset as string, 10) || 0; 
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return response.status(400).send({ message: 'Invalid rating. Must be between 1 and 5.' });
    }
    const result = await getBooksByRating(rating, limit, offset);
    if (result.rowCount > 0) {
      const books: IBook[] = result.rows.map(adaptBookResult);
      response.send({ entries: books });
    } else {
      response.status(404).send({ message: 'No books found for this rating' });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching books: ' + error,
    });
  }
});

//Get books by minimum rating
// Default to 10 per page
// Default to start from beginning
bookRouter.get('/minrating/:minRating', async (request: Request, response: Response) => {
  try {
    const minRating = parseInt(request.params.minRating, 10);
    const limit = parseInt(request.query.limit as string, 10) || 10; 
    const offset = parseInt(request.query.offset as string, 10) || 0; 
    if (isNaN(minRating) || minRating < 1 || minRating > 5) {
      return response.status(400).send({ message: 'Invalid rating. Must be between 1 and 5.' });
    }
    const result = await getBooksByMinimumRating(minRating, limit, offset);
    if (result.rowCount > 0) {
      const books: IBook[] = result.rows.map(adaptBookResult);
      response.send({ entries: books });
    } else {
      response.status(404).send({ message: 'No books found for this rating' });
    }
  } catch (error) {
    console.error('Error executing database query: ', error);
    response.status(500).send({
      message: 'Error fetching books: ' + error,
    });
  }
});


export { bookRouter };