// core/bookAdapter.ts
import { QueryResultRow } from 'pg';  
import { IBook } from './models/book.model';

export function adaptBookResult(row: QueryResultRow): IBook {
  return {
    isbn13: row.isbn13,
    authors: row.authors,
    publication: row.publication_year,
    original_title: row.original_title,
    title: row.title,
    icons: {
      large: row.image_url,
      small: row.image_small_url,
    },
    ratings: {
      average: row.average_rating,
      count: row.rating_count,
      rating_1: row.rating_1_star,
      rating_2: row.rating_2_star,
      rating_3: row.rating_3_star,
      rating_4: row.rating_4_star,
      rating_5: row.rating_5_star,
    },
  };
}
