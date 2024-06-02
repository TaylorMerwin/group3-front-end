export interface Book {
  id: number;
  isbn13: string;
  title: string;
  authors: string; 
  publication_year: number;
  ratings: {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
  }
  icons: {
    large: string;
    small: string;
  }
}
