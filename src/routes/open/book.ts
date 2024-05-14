import express, {Request, Response, Router } from "express";
import { IBook, INewBook } from "../../core/models/book.model";
import { addNewBook, deleteBookByISBN, deleteBookById, deleteBookByTitle, getAllBooks, getBookByISBN, getBookById, getBooksByAuthor, getBooksByMinimumRating, getBooksByPublicationYear, getBooksByRating, updateBookAuthorsByISBN, updateBookAuthorsById, updateBookISBNByISBN, updateBookISBNById, updateBookImagesByISBN, updateBookPublicationYearByISBN, updateBookTitleByISBN, updateBookTitleById } from "../../core/db/bookQueries";
import { adaptBookResult } from "../../core/bookAdapter";


const bookRouter: Router = express.Router();

// Inserts

bookRouter.post('/', async (request: Request, response: Response) => {
  try {
    const newBookData: INewBook = request.body;
        if (
          !newBookData.isbn13 ||
          !newBookData.authors || 
          !newBookData.publicationYear ||
          !newBookData.originalTitle ||
          !newBookData.title ||
          !newBookData.imageUrl || 
          !newBookData.imageSmallUrl
        ) 
          {
          return response.status(400).send({ message: 'Missing required book data' });
        }
    
        const result = await addNewBook(newBookData);
    
        if (result.rowCount === 1) {
          const insertedBook: IBook = adaptBookResult(result.rows[0]);
          response.status(201).send({ entry: insertedBook });
        } else {
          response.status(500).send({ message: 'Error adding book to the database' });
        }
      } catch (error) {
        if (error.code === '23505') {
          response.status(409).send({ message: 'Book with this ISBN already exists' });
        } else {
          console.error('Error adding book:', error);
          response.status(500).send({ message: 'Error adding book to the database', error });
        }
      }
    });


//Retrievals


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

// Updates

//Update title by ISBN
bookRouter.put('/ISBN/:isbn/title', async (request: Request, response: Response) => {
  try {
    const isbn = request.params.isbn;
    const newTitle = request.body.title;

    if (!newTitle) {
      return response.status(400).send({ message: 'New title is required' });
    }
    const result = await updateBookTitleByISBN(isbn, newTitle);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ISBN ${isbn} to title "${newTitle}"`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ISBN: ${isbn}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book title',
    });
  }
});

//Update title by ID
bookRouter.put('/ID/:id/title', async (request: Request, response: Response) => {
  try {
    const id = request.params.id;
    const newTitle = request.body.title;

    if (!newTitle) {
      return response.status(400).send({ message: 'New title is required' });
    }
    const result = await updateBookTitleById(id, newTitle);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ID ${id} to title "${newTitle}"`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ID: ${id}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book title',
    });
  }
});

//Update authors by ISBN
bookRouter.put('/ISBN/:isbn/authors', async (request: Request, response: Response) => {
  try {
    const isbn = request.params.isbn;
    const newAuthors = request.body.authors;

    if (!newAuthors) {
      return response.status(400).send({ message: 'New author(s) required' });
    }
    const result = await updateBookAuthorsByISBN(isbn, newAuthors);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ISBN ${isbn} to authors "${newAuthors}"`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ISBN: ${isbn}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book authors',
    });
  }
});

//Update authors by ID
bookRouter.put('/ID/:id/authors', async (request: Request, response: Response) => {
  try {
    const id = request.params.id;
    const newAuthors = request.body.authors;

    if (!newAuthors) {
      return response.status(400).send({ message: 'New author(s) required' });
    }
    const result = await updateBookAuthorsById(id, newAuthors);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ID ${id} to author(s) "${newAuthors}"`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ID: ${id}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book authors',
    });
  }
});

//Update publication year by ISBN
bookRouter.put('/ISBN/:isbn/year', async (request: Request, response: Response) => {
  try {
    const isbn = request.params.isbn;
    const newYear = request.body.publication_year;

    if (!newYear) {
      return response.status(400).send({ message: 'New publication year is required' });
    }
    const result = await updateBookPublicationYearByISBN(isbn, newYear);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ISBN ${isbn} to publication year ${newYear}`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ISBN: ${isbn}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book publication year',
    });
  }
});

//Update ISBN by ISBN
bookRouter.put('/ISBN/:isbn/ISBN', async (request: Request, response: Response) => {
  try {
    const isbn = request.params.isbn;
    const newIsbn = request.body.isbn;

    if (!newIsbn) {
      return response.status(400).send({ message: 'New ISBN is required' });
    }
    const result = await updateBookISBNByISBN(isbn, newIsbn);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ISBN ${isbn} to new ISBN ${newIsbn}`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ISBN: ${isbn}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book ISBN',
    });
  }
});

//Update ISBN by Id
bookRouter.put('/id/:id/ISBN', async (request: Request, response: Response) => {
  try {
    const id = request.params.id;
    const newIsbn = request.body.isbn;

    if (!newIsbn) {
      return response.status(400).send({ message: 'New ISBN is required' });
    }
    const result = await updateBookISBNById(id, newIsbn);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with id ${id} to new ISBN ${newIsbn}`,
      });
    } else {
      response.status(404).send({
        message: `No books found by id: ${id}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book ISBN',
    });
  }
});

//Update images by ISBN
bookRouter.put('/ISBN/:isbn/image', async (request: Request, response: Response) => {
  try {
    const isbn = request.params.isbn;
    const newImage = request.body.image;
    const newSmallImage = request.body.small_image;

    if (!newImage || !newSmallImage) {
      return response.status(400).send({ message: 'New images are required' });
    }
    const result = await updateBookImagesByISBN(isbn, newImage, newSmallImage);
    if (result.rowCount >= 1) {
      response.send({
        message: `Updated ${result.rowCount} book(s) with ISBN ${isbn} to new image ${newImage} and small image ${newSmallImage}`,
      });
    } else {
      response.status(404).send({
        message: `No books found by ISBN: ${isbn}`,
      });
    }
  } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error updating book images',
    });
  }
});








// Inserts

// Deletes


/**
 * @api {delete} /books/ISBN/:isbn Deletes books by isbn13
 * @apiName DeleteBooksByisbn13
 * @apiGroup Book
 *
 * @apiParam {String} The author of the books to delete
 * @apiParam {String} password User's password.
 *
 * @apiSuccess {String} message Success message confirming the deletion of books by author.
 * @apiError (404: Book Not Found) {String} message "Book not found"
 */
bookRouter.delete('/ISBN/:isbn', async (request: Request, response: Response) => {
  try {
    const result = await deleteBookByISBN(request.params.isbn);
    if (result.rowCount === 1) {
      response.send({
          entry: 'Deleted books(s) by ISBN: ' + request.params.isbn,
      });
  } else if (result.rowCount > 1) {
      response.send({
          entry: 'Deleted ' + result.rowCount + ' book(s) by ISBN: ' + request.params.isbn,
      });
  } else {
      response.status(404).send({
          message: 'No books found by ISBN: ' + request.params.isbn,
      });
  }
 } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error deleting book' + error.message,
    });
  }
});

/**
 * @api {delete} /books/id/:id Deletes a book by ID
 * @apiName DeleteBookByID
 * @apiGroup Book
 *
 * @apiParam {int} id The ID of the book to delete
 * @apiParam {String} password User's password.
 *
 * @apiSuccess {String} message Success message confirming the deletion of the book by ID.
 * @apiError (404: Book Not Found) {String} message "Book not found"
 */
bookRouter.delete('/id/:id', async (request: Request, response: Response) => {
  try {
    const result = await deleteBookById(request.params.id);
    if (result.rowCount === 1) {
      response.send({
          entry: 'Deleted books(s) by id: ' + request.params.id,
      });
  } else if (result.rowCount > 1) {
      response.send({
          entry: 'Deleted ' + result.rowCount + ' book(s) by id: ' + request.params.title,
      });
  } else {
      response.status(404).send({
          message: 'No books found by id: ' + request.params.title,
      });
  }
 } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error deleting book' + error.message,
    });
  }
});

/**
 * @api {delete} /books/title/:title Deletes a book by title
 * @apiName DeleteBookByTitle
 * @apiGroup Book
 *
 * @apiParam {int} id The ID of the book to delete
 * @apiParam {String} password User's password.
 *
 * @apiSuccess {String} message Success message confirming the deletion of the book by ID.
 * @apiError (404: Book Not Found) {String} message "Book not found"
 */
bookRouter.delete('/title/:title', async (request: Request, response: Response) => {
  try {
    const result = await deleteBookByTitle(request.params.title);
    if (result.rowCount === 1) {
      response.send({
          entry: 'Deleted books(s) by Title: ' + request.params.title,
      });
  } else if (result.rowCount > 1) {
      response.send({
          entry: 'Deleted ' + result.rowCount + ' book(s) by Title: ' + request.params.title,
      });
  } else {
      response.status(404).send({
          message: 'No books found by Title: ' + request.params.title,
      });
  }
 } catch (error) {
    console.error('Error executing database query:', error);
    response.status(500).send({
      error: 'Error deleting book' + error.message,
    });
  }
});


export { bookRouter };