import express, { NextFunction, Request, Response, Router } from 'express';
import { IBook, INewBook } from '../../core/models/book.model';
import {
    addNewBook,
    deleteBookByISBN,
    deleteBookById,
    deleteBookByTitle,
    getAllBooks,
    getBookByISBN,
    getBookById,
    getBooksByAuthor,
    getBooksByMinimumRating,
    getBooksByPublicationYear,
    getBooksByRating,
    updateBookAuthorsByISBN,
    updateBookAuthorsById,
    updateBookISBNByISBN,
    updateBookISBNById,
    updateBookImagesByISBN,
    updateBookPublicationYearByISBN,
    updateBookTitleByISBN,
    updateBookTitleById,
} from '../../core/db/bookQueries';
import { adaptBookResult } from '../../core/bookAdapter';

const bookRouter: Router = express.Router();

// Functions

function mwValidPageInfo(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const offset = request.query.offset;
    const limit = request.query.limit;
    if (!Number.isNaN(Number(offset)) && !Number.isNaN(Number(limit))) {
        next();
    } else if (Number.isNaN(Number(offset))) {
        console.error('Offset not a number!');
        response.status(400).send({
            message: 'Provided offset is not a number; see documentation!',
        });
    } else {
        console.error('Limit not a number!');
        response.status(400).send({
            message: 'Provided limit is not a number; see documentation!',
        });
    }
}

function mwIsNumber(type: string) {
    return function (request: Request, response: Response, next: NextFunction) {
        let value = 'default';
        if (type == 'ISBN') {
            value = request.params.isbn;
        } else if (type == 'year') {
            value = request.params.year;
        } else if (type == 'ID') {
            value = request.params.id;
        }
        if (Number.isNaN(Number(value))) {
            console.error(type + ' is not a number!');
            response.status(400).send({
                message:
                    'Provided ' +
                    type +
                    ' type is not a number; see documentation!',
            });
        } else {
            next();
        }
    };
}

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
        ) {
            return response
                .status(400)
                .send({ message: 'Missing required book data' });
        }

        const result = await addNewBook(newBookData);

        if (result.rowCount === 1) {
            const insertedBook: IBook = adaptBookResult(result.rows[0]);
            response.status(201).send({ entry: insertedBook });
        } else {
            response
                .status(500)
                .send({ message: 'Error adding book to the database' });
        }
    } catch (error) {
        if (error.code === '23505') {
            response
                .status(409)
                .send({ message: 'Book with this ISBN already exists' });
        } else {
            console.error('Error adding book:', error);
            response
                .status(500)
                .send({ message: 'Error adding book to the database', error });
        }
    }
});

//Retrievals

// Get all books using pagination
// Default to 10 books per page
// Default to start from the beginning
/**
 * @api {get} /books
 * @apiName GetPageOfBooks
 * @apiGroup Books
 *
 * @apiDescription Request to retrieve a page of book entries
 *
 * @apiQuery {number} limit the page of results that should be retrieved
 * @apiQuery {number} offset the number of results per page
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books on the specified page in IBook format
 * @apiError (400: Invalid offset) {text} message "Provided offset is not a number; see documentation!"
 * @apiError (400: Invalid limit) {text} message "Provided limit is not a number; see documentation!"
 * @apiError (404: No Books) {text} message "No books found"
 */

bookRouter.get(
    '/',
    mwValidPageInfo,
    async (request: Request, response: Response) => {
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
    }
);

// Get book by ISBN
/**
 * @api {get} /books/ISBN:iSBN
 * @apiName GetBookByISBN
 * @apiGroup Books
 *
 * @apiDescription Request to filter and retrieve books with a given ISBN
 *
 * @apiParam {number} iSBN the ISBN that all returned books will share
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books with the given ISBN in IBook format
 * @apiError (400: Invalid ISBN) {text} message "Provided ISBN is not a number; see documentation!"
 * @apiError (404: No Books Match) {text} message "Book not found"
 */

bookRouter.get(
    '/ISBN/:isbn',
    mwIsNumber('ISBN'),
    async (request: Request, response: Response) => {
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
    }
);

/**
 * @api {get} /books/year/:year
 * @apiName GetBookByPublishingYear
 * @apiGroup Books
 *
 * @apiDescription Request to filter and retreive books with a given publishing year
 *
 * @apiParam {number} year the year that all returned books will have as their publishing year
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books with the given publishing year in IBook format
 * @apiError (400: Invalid year) {text} message "Provided year is not a number; see documentation!"
 * @apiError (404: No Books Match) {text} message "No books found"
 */
bookRouter.get(
    '/year/:year',
    mwIsNumber('year'),
    async (request: Request, response: Response) => {
        try {
            const result = await getBooksByPublicationYear(
                parseInt(request.params.year)
            );

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
    }
);

/**
 * @api {get} /books/author/:authorName
 * @apiName GetBookByAuthor
 * @apiGroup Books
 *
 * @apiDescription Request to retrieve all books that contain the given pattern in their authors field
 *
 * @apiParam {text} authorName pattern to be searched for in each book's author's field
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books that contain the given pattern in their authors field in IBook format
 * @apiError (404: No Books Match) {text} message "No books found for this author"
 * @apiError (500: Database Error) {text} message "Error fetching books: " + error
 */

bookRouter.get(
    '/author/:authorName',
    async (request: Request, response: Response) => {
        try {
            const authorName = request.params.authorName;
            const result = await getBooksByAuthor(authorName);
            if (result.rowCount > 0) {
                const books: IBook[] = result.rows.map(adaptBookResult);
                response.send({ entries: books });
            } else {
                response
                    .status(404)
                    .send({ message: 'No books found for this author' });
            }
        } catch (error) {
            console.error('Error executing database query: ', error);
            response.status(500).send({
                message: 'Error fetching books: ' + error,
            });
        }
    }
);

/**
 * @api {get} /books/id/:id
 * @apiName GetBookByID
 * @apiGroup Books
 *
 * @apiDescription Request to retrieve the book with the given ID
 *
 * @apiParam {number} id the ID of the book that should be returned
 * 
 * @apiSuccess {IBook[]} entries the aggregate of all books with the given ID in IBook format
 * @apiError (400: Invalid ID) {text} message "Provided ID is not a number; see documentation!"
 * @apiError (404: No Books Match) {text} message "Book not found"
 * @apiError (500: Database Error) {text} message "Error fetching book: " + error
 */
bookRouter.get(
    '/id/:id',
    mwIsNumber('ID'),
    async (request: Request, response: Response) => {
        try {
            const result = await getBookById(request.params.id);
            if (result.rowCount === 1) {
                const book: IBook = adaptBookResult(result.rows[0]);
                response.send({
                    entry: book,
                });
            } else {
                console.log(
                    'Book with specified id not found:',
                    request.params.id
                );
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
    }
);

//Get books by rating (rounds to the nearest integer)
// Default to 10 per page
// Default to start from beginning
/**
 * @api {get} /books/rating/:rating
 * @apiName GetBookByRating
 * @apiGroup Books
 *
 * @apiDescription Request to filter and retrieve books with whose ratings fall in the bounds stars - .5 to stars + .5
 *
 *
 * @apiParam {number} rating the star rating that forms the base for the range of ratings requested (.5 star boundary in each direction)
 * @apiQuery {number} limit the page of results that should be retrieved
 * @apiQuery {number} offset the number of results per page
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books within the given rating range in IBook format
 *
 * @apiError (400: Invalid offset) {text} message "Provided offset is not a number; see documentation!"
 * @apiError (400: Invalid limit) {text} message "Provided limit is not a number; see documentation!"
 * @apiError (404: No Books Match) {text} message "No books found for this rating"
 * @apiError (400: Invalid Rating) {text} message "Invalid rating. Must be between 1 and 5."
 */
bookRouter.get(
    '/rating/:rating',
    mwValidPageInfo,
    async (request: Request, response: Response) => {
        try {
            const rating = parseInt(request.params.rating, 10);
            const limit = parseInt(request.query.limit as string, 10) || 10;
            const offset = parseInt(request.query.offset as string, 10) || 0;
            if (isNaN(rating) || rating < 1 || rating > 5) {
                return response.status(400).send({
                    message: 'Invalid rating. Must be between 1 and 5.',
                });
            }
            const result = await getBooksByRating(rating, limit, offset);
            if (result.rowCount > 0) {
                const books: IBook[] = result.rows.map(adaptBookResult);
                response.send({ entries: books });
            } else {
                response
                    .status(404)
                    .send({ message: 'No books found for this rating' });
            }
        } catch (error) {
            console.error('Error executing database query: ', error);
            response.status(500).send({
                message: 'Error fetching books: ' + error,
            });
        }
    }
);

//Get books by minimum rating
// Default to 10 per page
// Default to start from beginning
/**
 * @api {get} /books/minrating/:minRating
 * @apiName GetBooksOverRating
 * @apiGroup Books
 *
 * @apiDescription Request to retrieve books with an average rating over a given star rating
 *
 *
 * @apiParam {number} rating the minimum star rating allowed for retrieved books
 * @apiQuery {number} limit the page of results that should be retrieved
 * @apiQuery {number} offset the number of results per page
 *
 * @apiSuccess {IBook[]} entries the aggregate of all books with an average rating over <code>minRating</code>
 *
 * @apiError (404: No Books Match) {text} message "No books found for this rating"
 * @apiError (400: Invalid Rating) {text} message "Invalid rating. Must be between 1 and 5."
 */
bookRouter.get(
    '/minrating/:minRating',
    mwValidPageInfo,
    async (request: Request, response: Response) => {
        try {
            const minRating = parseInt(request.params.minRating, 10);
            const limit = parseInt(request.query.limit as string, 10) || 10;
            const offset = parseInt(request.query.offset as string, 10) || 0;
            if (isNaN(minRating) || minRating < 1 || minRating > 5) {
                return response.status(400).send({
                    message: 'Invalid rating. Must be between 1 and 5.',
                });
            }
            const result = await getBooksByMinimumRating(
                minRating,
                limit,
                offset
            );
            if (result.rowCount > 0) {
                const books: IBook[] = result.rows.map(adaptBookResult);
                response.send({ entries: books });
            } else {
                response
                    .status(404)
                    .send({ message: 'No books found for this rating' });
            }
        } catch (error) {
            console.error('Error executing database query: ', error);
            response.status(500).send({
                message: 'Error fetching books: ' + error,
            });
        }
    }
);
// Updates

/**
* @api {put} /books/ISBN/:isbn/title Update title by ISBN
* @apiName UpdateTitleByISBN
* @apiGroup Book
*
* @apiParam {String} The new title of book to update
* @apiParam {number} ISBN to find the book
*
* @apiSuccess {String} message "Updated {result.rowCount} book(s) with ISBN {isbn} to title "{newTitle}"
* @apiError (400: No New Title) {String} message "New title is required"
* @apiError (404: Book Not Found) {String} message "No books found by ISBN"
* @apiError (500: Database Error) {String} message "Error updating book title"
*/
bookRouter.put(
    '/ISBN/:isbn/title',
    async (request: Request, response: Response) => {
        try {
            const isbn = request.params.isbn;
            const newTitle = request.body.title;

            if (!newTitle) {
                return response
                    .status(400)
                    .send({ message: 'New title is required' });
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
    }
);

/**
 * @api {put} /books/ID/:id/title Update title by ID
 * @apiName UpdateTitleByID
 * @apiGroup Book
 * 
 * @apiParam {String} The new title of book to update
 * @apiParam {number} ID to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with ID {id} to title "{newTitle}"
 * @apiError (400: No New Title) {String} message "New title is required"
 * @apiError (404: Book Not Found) {String} message "No books found by ID"
 * @apiError (500: Database Error) {String} message "Error updating book title"
 */
bookRouter.put(
    '/ID/:id/title',
    async (request: Request, response: Response) => {
        try {
            const id = request.params.id;
            const newTitle = request.body.title;

            if (!newTitle) {
                return response
                    .status(400)
                    .send({ message: 'New title is required' });
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
    }
);

/**
* @api {put} /books/ID/:id/title Update title by ID
* @apiName UpdateTitleByID
* @apiGroup Book
*
* @apiParam {String} The new title of book to update
* @apiParam {number} ID to find the book
*
* @apiSuccess {String} message "Updated {result.rowCount} book(s) with ID {id} to title "{newTitle}"
* @apiError (400: No New Title) {String} message "New title is required"
* @apiError (404: Book Not Found) {String} message "No books found by ID"
*/
bookRouter.put(
    '/ISBN/:isbn/authors',
    async (request: Request, response: Response) => {
        try {
            const isbn = request.params.isbn;
            const newAuthors = request.body.authors;

            if (!newAuthors) {
                return response
                    .status(400)
                    .send({ message: 'New author(s) required' });
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
    }
);

/**
 * @api {put} /books/ID/:id/authors Update authors by ID
 * @apiName UpdateAuthorsByID
 * @apiGroup Book
 * 
 * @apiParam {String} The new authors of book to update
 * @apiParam {number} ID to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with ID {id} to authors "{newAuthors}"
 * @apiError (400: No New Authors) {String} message "New author(s) required"
 * @apiError (404: Book Not Found) {String} message "No books found by ID"
 * @apiError (500: Database Error) {String} message "Error updating book authors"
 */
bookRouter.put(
    '/ID/:id/authors',
    async (request: Request, response: Response) => {
        try {
            const id = request.params.id;
            const newAuthors = request.body.authors;

            if (!newAuthors) {
                return response
                    .status(400)
                    .send({ message: 'New author(s) required' });
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
    }
);

/**
 * @api {put} /books/ISBN/:isbn/year Update publication year by ISBN
 * @apiName UpdatePublicationYearByISBN
 * @apiGroup Book
 * 
 * @apiParam {number} The new publication year of book to update
 * @apiParam {number} ISBN to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with ISBN {isbn} to publication year {newYear}"
 * @apiError (400: No New Publication Year) {String} message "New publication year is required"
 * @apiError (404: Book Not Found) {String} message "No books found by ISBN"
 * @apiError (500: Database Error) {String} message "Error updating book publication year"
 */
bookRouter.put(
    '/ISBN/:isbn/year',
    async (request: Request, response: Response) => {
        try {
            const isbn = request.params.isbn;
            const newYear = request.body.publication_year;

            if (!newYear) {
                return response
                    .status(400)
                    .send({ message: 'New publication year is required' });
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
    }
);

/**
 * @api {put} /books/ISBN/:isbn/ISBN Update ISBN by ISBN
 * @apiName UpdateISBNByISBN
 * @apiGroup Book
 * 
 * @apiParam {number} The new ISBN of book to update
 * @apiParam {number} ISBN to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with ISBN {isbn} to new ISBN {newIsbn}"
 * @apiError (400: No New ISBN) {String} message "New ISBN is required"
 * @apiError (404: Book Not Found) {String} message "No books found by ISBN"
 * @apiError (500: Database Error) {String} message "Error updating book ISBN"
 */
bookRouter.put(
    '/ISBN/:isbn/ISBN',
    async (request: Request, response: Response) => {
        try {
            const isbn = request.params.isbn;
            const newIsbn = request.body.isbn;

            if (!newIsbn) {
                return response
                    .status(400)
                    .send({ message: 'New ISBN is required' });
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
    }
);

/**
 * @api {put} /books/id/:id/ISBN Update ISBN by ID
 * @apiName UpdateISBNByID
 * @apiGroup Book
 * 
 * @apiParam {number} The new ISBN of book to update
 * @apiParam {number} ID to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with id {id} to new ISBN {newIsbn}"
 * @apiError (400: No New ISBN) {String} message "New ISBN is required"
 * @apiError (404: Book Not Found) {String} message "No books found by id"
 * @apiError (500: Database Error) {String} message "Error updating book ISBN"
 */
bookRouter.put('/id/:id/ISBN', async (request: Request, response: Response) => {
    try {
        const id = request.params.id;
        const newIsbn = request.body.isbn;

        if (!newIsbn) {
            return response
                .status(400)
                .send({ message: 'New ISBN is required' });
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

/**
 * @api {put} /books/ISBN/:isbn/image Update images by ISBN
 * @apiName UpdateImagesByISBN
 * @apiGroup Book
 * 
 * @apiParam {String} The new image of book to update
 * @apiParam {String} The new small image of book to update
 * @apiParam {number} ISBN to find the book
 * 
 * @apiSuccess {String} message "Updated {result.rowCount} book(s) with ISBN {isbn} to new image {newImage} and small image {newSmallImage}"
 * @apiError (400: No New Images) {String} message "New images are required"
 * @apiError (404: Book Not Found) {String} message "No books found by ISBN"
 * @apiError (500: Database Error) {String} message "Error updating book images"
 */
bookRouter.put(
    '/ISBN/:isbn/image',
    async (request: Request, response: Response) => {
        try {
            const isbn = request.params.isbn;
            const newImage = request.body.image;
            const newSmallImage = request.body.small_image;

            if (!newImage || !newSmallImage) {
                return response
                    .status(400)
                    .send({ message: 'New images are required' });
            }
            const result = await updateBookImagesByISBN(
                isbn,
                newImage,
                newSmallImage
            );
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
    }
);
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
bookRouter.delete(
    '/ISBN/:isbn',
    async (request: Request, response: Response) => {
        try {
            const result = await deleteBookByISBN(request.params.isbn);
            if (result.rowCount === 1) {
                response.send({
                    entry: 'Deleted books(s) by ISBN: ' + request.params.isbn,
                });
            } else if (result.rowCount > 1) {
                response.send({
                    entry:
                        'Deleted ' +
                        result.rowCount +
                        ' book(s) by ISBN: ' +
                        request.params.isbn,
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
    }
);

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
                entry:
                    'Deleted ' +
                    result.rowCount +
                    ' book(s) by id: ' +
                    request.params.title,
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
bookRouter.delete(
    '/title/:title',
    async (request: Request, response: Response) => {
        try {
            const result = await deleteBookByTitle(request.params.title);
            if (result.rowCount === 1) {
                response.send({
                    entry: 'Deleted books(s) by Title: ' + request.params.title,
                });
            } else if (result.rowCount > 1) {
                response.send({
                    entry:
                        'Deleted ' +
                        result.rowCount +
                        ' book(s) by Title: ' +
                        request.params.title,
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
    }
);

export { bookRouter };
