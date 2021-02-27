import { BookObject, ShelfObject } from "../../../types"
import { Connection } from '../database'
import { configureConnectionPool } from "./connection"

const insertBook = async (book: BookObject, connection: Connection) => {
    
    return new Promise(async (resolve, reject) => {

        if(!book.info.authors) {

            book.info.authors = [""]

        }

        try {

            await connection.beginTransaction()

            const existingBooks = await connection.query('SELECT * FROM Book WHERE id = ?', [book.id]) 
            
            if(existingBooks.length) return reject(`Error, book with id ${book.id} already in database.`)

            const insertBookResult = await connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId])

            const bookInfo = { ...book.info, authors: book.info.authors.toString(), bookId: insertBookResult.insertId }

            await connection.query('INSERT INTO BookInfo SET ?', [bookInfo])

            await connection.commit()

            const message = "Added book and info to database."

            console.log(message)

            return resolve(message)

        }
        catch (error) {

            try {

                await connection.rollback()

                console.error(error)

                return reject(error)

            }
            catch (error) {

                console.error(error)

                return reject(error)

            }
        }

    })

}

const deleteBook = async (book:BookObject, connection: Connection) => {

    return new Promise(async (resolve, reject) => {   

        try {

            await connection.beginTransaction()

            await connection.query("DELETE FROM bookinfo WHERE bookId = ?", [book.id])

            await connection.query("DELETE FROM clubmeeting WHERE bookId = ?", [book.id])

            await connection.query("DELETE FROM book WHERE id = ?", [book.id])

            const message = `Deleted book ${book.info.title}.`

            console.log(message)

            await connection.commit()

            return resolve(message)

        }
        catch (error) {

            await connection.rollback()

            console.error(error)

            return reject(error)

        }

    })
    
}

const retrieveBooksOfShelves = async (shelves: ShelfObject[], connection: Connection) => {
    
    return new Promise(async (resolve, reject) => {

        const message = (books: BookObject[]) => `Retrieved ${books.length} books.`

        let books: BookObject[] = []

        if(!shelves.length) {

            console.log(message(books))

            return resolve(books)
        }

        try {   

            let books: BookObject[] = []

            const shelfIds: number[] = shelves.map(shelf => shelf.id)

            books = await connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds])     

            if(books.length) {

                const booksWithInfo: BookObject[] = await retrieveAndAppendBookInfo(books, connection)

                console.log(message(booksWithInfo))

                return resolve(booksWithInfo)
            }
            else {

                console.log(message(books))

                return resolve(books)

            }

        }
        catch (error) {

            console.error(error)

            return reject(error)

        }

    })

}

const retrieveAndAppendBookInfo = async (books: BookObject[], connection: Connection): Promise<BookObject[]> => {

    return new Promise(async (resolve, reject) => {

        const bookIds: (number | null)[] = books.map(book => book.id)

        try {

            const bookInfo = await connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds])

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

const retrieveBookById = (bookId: number, connection: Connection): Promise<BookObject> => {

    return new Promise(async (resolve, reject) => {

        const message = (books: BookObject[]) => `Retrieved ${books.length} books.`
        
        try {   

            let bookData = []

            bookData = await connection.query('SELECT * FROM Book WHERE id = ?', [bookId])     

            if(bookData.length) {

                const booksWithInfo: BookObject[] = await retrieveAndAppendBookInfo(bookData, connection)

                console.log(message(booksWithInfo))

                return resolve(booksWithInfo[0])
            }
            else {

                const error = "Error, no book found for meeting"

                console.error(error)

                return reject(error)

            }

        }
        catch (error) {

            console.error(error)

            return reject(error)

        }
    });
    
}

module.exports = { insertBook, deleteBook, retrieveBooksOfShelves, retrieveBookById }