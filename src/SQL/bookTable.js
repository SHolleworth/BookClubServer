const { getConnection } = require('./connection')

const insertBook = async (book, connection) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        connection.query('SELECT * FROM Book WHERE id = ?', [book.id], (error, results) => {
            
            if (error) return reject(error)

            if(results.length) return reject(`Error, book with id ${book.id} already in database.`)

            connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId], (error, results) => {
            
                if (error) return reject("Error adding book: " + error)
    
                book.info.bookId = results.insertId
    
                connection.query('INSERT INTO BookInfo SET ?', book.info, (error, results) => {
                    
                    if (error) return reject("Error adding book info: " + error)
        
                    console.log("Inserted book info.")
        
                    return resolve(results)
        
                })
        
            })

        })

    })

}

const retrieveBooksOfShelves = async (shelves, connection) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        let books = []

        if(!shelves.length) {

            console.log("No books to retrieve.")

            return resolve(books)
        }

        if(shelves.length === 1) {

            connection.query('SELECT * FROM Book WHERE shelfId = ?', [shelves[0].id], (error, results) => {
                
                if (error) return reject(`Error loading books for shelf ${shelves[0].name}: ${error}`)

                console.log("Retrieved books for single shelf.")
                console.log({ results })

                books = results

                retrieveAndAppendBookInfo(books, connection)
                .then(books => {

                    return resolve(books)
    
                })
                .catch(error => {
                    
                    return reject(error)
    
                })
            })

        }

        shelfIds = shelves.map(shelf => shelf.id)

        connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds], (error, results) => {
            
            if (error) return reject(`Error loading books: ${error}.`)

            console.log("Retrieved books.")
            console.log({ results })

            books = results

            if(books.length) {
                retrieveAndAppendBookInfo(books, connection)
                .then(booksWithInfo => {

                    console.log({ booksWithInfo })

                    return resolve(booksWithInfo)

                })
                .catch(error => {
                    
                    return reject(error)

                })
            }
            else {

                return resolve(books)

            }
        })

    })

}

const retrieveAndAppendBookInfo = async (books, connection) => {

    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        bookIds = books.map(book => book.id)

        connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds], (error, results) => {
            
            if (error) return reject("Error loading book data: " + error)

            console.log("Retrieved book info.")

            return resolve(books.map((book, i) => 
                {

                    book.info = results[i]

                    return book

                }))

        })

    })
    
}

module.exports = { insertBook, retrieveBooksOfShelves }