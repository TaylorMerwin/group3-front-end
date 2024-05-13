import express, {Request, Response, Router } from "express";
import { IBook } from "../../core/models/book.model";
import { getBookByISBN, getBookById, getBooksByAuthor, getBooksByPublicationYear } from "../../core/db/bookQueries";
import { adaptBookResult } from "../../core/bookAdapter";


const bookRouter: Router = express.Router();

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
      console.log('No books found for year:', request.params.year);
      response.status(404).send({
        message: 'No books found',
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
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
    console.error('Error executing database query:', error);
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


export { bookRouter };