import { BookObject, ShelfObject } from "../../../types"
import ConnectionWrapper, { Connection } from '../database'

const insertBook = async (book: BookObject) => {
    
    return new Promise(async (resolve, reject) => {

        if(!book.info.authors) {

            book.info.authors = [""]

        }

        const connection: Connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            await connection.beginTransaction()

            const existingBooks = await connection.query('SELECT * FROM Book WHERE id = ?', [book.id]) 
            
            if(existingBooks.length) return reject(`Error, book with id ${book.id} already in database.`)

            const insertBookResult = await connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId])

            const bookInfo = { ...book.info, authors: book.info.authors.toString(), bookId: insertBookResult.insertId }

            await connection.query('INSERT INTO BookInfo SET ?', [bookInfo])

            await connection.commit()

            connection.release()

            return resolve("Added book and info to database.")

        }
        catch (error) {

            try {

                await connection.rollback()

                connection.release()

                return reject(error)

            }
            catch (error) {

                connection.release()

                return reject(error)

            }
        }

    })

}

const retrieveBooksOfShelves = async (shelves: ShelfObject[]) => {
    
    return new Promise(async (resolve, reject) => {

        let books: BookObject[] = []

        if(!shelves.length) {

            console.log("No books to retrieve.")

            return resolve(books)
        }

        const connection: Connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            let books: BookObject[] = []

            const shelfIds: number[] = shelves.map(shelf => shelf.id)

            books = await connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds])     

            if(books.length) {

                const booksWithInfo = await retrieveAndAppendBookInfo(books, connection)

                return resolve(booksWithInfo)
            }
            else {

                return resolve(books)

            }

        }
        catch (error) {

            connection.release()

            return reject(error)

        }

    })

}

const retrieveAndAppendBookInfo = async (books: BookObject[], connection: Connection) => {

    return new Promise(async (resolve, reject) => {

        const bookIds: (number | null)[] = books.map(book => book.id)

        try {

            const bookInfo = await connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds])

            console.log("Retrieved book info.")

            return resolve(books.map((book, i) => 
                {

                    book.info = bookInfo[i]

                    if(bookInfo[i].authors.includes(',')) {

                        book.info.authors = bookInfo[i].authors.split(',')

                    }
                    else {

                        book.info.authors = [bookInfo[i].authors]
                    }


                    return book

                }))

        }
        catch (error) {

            return reject(error)

        }

    })
    
}

module.exports = { insertBook, retrieveBooksOfShelves }