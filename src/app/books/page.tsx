export default async function Books() {
    const res = await fetch("http://localhost:4000/books/all");
    const data = await res.json();

    return (
        <div>
            <h1>Books</h1>
            <ul>
                {data.books.map(book => (
                    <li key={book.id}>
                       Title: {book.title} - Authors: {book.authors} - 
                        Average Rating: {book.ratings.average}- 
                        Rating Count: {book.ratings.count}
                        <br />
                        <img src={book.icons.large} alt={book.title} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
