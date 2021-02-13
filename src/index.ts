import { Socket } from "socket.io"

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = 3000
const io = require('socket.io')(server)
const fs = require('fs')

const { searchGoogleBooksByTitle } = require('./requestHandler')
const { insertBook, retrieveBooksOfShelves } = require('./tableInterfaces/bookTable')
const { configureConnectionPool, getPool }= require('./tableInterfaces/connection')
const { insertShelf, retrieveShelvesOfUser } = require('./tableInterfaces/shelfTable')
const { insertUser, retrieveUser } = require('./tableInterfaces/userTable')

import { BookObject, ClubObject, ClubPostObject, ShelfObject, UserLoginDataObject, UserLoginObject, UserObject, UserRegisterObject } from '../../types' 
import { insertClub, retrieveClubs } from "./tableInterfaces/clubTables"

fs.readFile('../apiKey.txt', 'utf8', (err: Error, data: string) => {

    if (err) throw err

    const apiKey = data

    console.log("API key acquired.")

    server.listen(port, () => {

        console.log("Listening on port " + port)

    });

    configureConnectionPool()

    io.on('connection' , (socket: Socket) => {

        console.log("Client connected")

        //Search bar query from client
        socket.on('search_google_books_by_title', (query: string) => {

            searchGoogleBooksByTitle(query, apiKey)
            .then((response: object[]) => {

                socket.emit('google_books_by_title_response', response)

            })
            .catch((error: string) => {

                socket.emit('google_books_by_title_error', error)

            })
        })


        //New user registration
        socket.on('register_new_user', (user: UserRegisterObject) => {

            insertUser(user)
            .then((response: string) => {
            
                socket.emit('register_new_user_response', response)

            })
            .catch((error: string) => {

                socket.emit('register_new_user_error', error)

            })

        })

        //User login request
        socket.on('login_as_user', async (user: UserLoginObject) =>{

            let userData: UserLoginDataObject = { user: { id: null, username: null }, shelves: [], books: [] }

            const connection = getPool()

            try {
                userData.user = await retrieveUser(user, connection)

                userData.shelves = await retrieveShelvesOfUser(userData.user, connection)

                userData.books = await retrieveBooksOfShelves(userData.shelves)
                
                console.log("User logging on: " + userData.user.username)

                socket.emit('login_as_user_response', userData)
            }
            catch(error) {

                socket.emit('login_as_user_error', error)

            }
        })

        //New shelf to add to database
        socket.on('post_new_shelf' , async (shelf: ShelfObject) => {

            insertShelf(shelf)
            .then((results: string) => {
                
                socket.emit('post_new_shelf_response', results)

            })
            .catch((error: string) => {

                socket.emit('post_new_shelf_error', error)

            })

        })

        //Retrieve shelves of user
        socket.on('retrieve_shelves', async (user: UserObject) => {

            retrieveShelvesOfUser(user)
            .then((shelves: ShelfObject[]) => {
                
                socket.emit('retrieve_shelves_response', shelves)

            })
            .catch((error: string) => {
              
                socket.emit('retrieve_shelves_error', error)

            })

        })


        //New book to add to database
        socket.on('post_new_book', async (book: BookObject) =>{

            insertBook(book)
            .then((results: string) => {
                
                socket.emit('post_new_book_response', results)

            })
            .catch((error: string) => {
                
                socket.emit('post_new_book_error', error)

            })

        })

        //Retrieve books of user
        socket.on('retrieve_books', async (user) => {

            const data: {shelves: ShelfObject[], books: BookObject[]} = { shelves: [], books: [] }

            retrieveShelvesOfUser(user)
            .then((shelves: ShelfObject[]) => {
                
                data.shelves = shelves

                return retrieveBooksOfShelves(shelves)

            })
            .then((books: BookObject[]) => {

                data.books = books
                
                socket.emit('retrieve_books_response', data)

            })
            .catch((error: string) => {
                
                socket.emit('retrieve_books_error', error)
                
            })

        })

        //Post new club
        socket.on('post_new_club', async (clubData: ClubPostObject) => {

            insertClub(clubData)
            .then((results: string) => {
                
                socket.emit('post_new_club_response', results)

            })
            .catch((error: string) => {
                
                socket.emit('post_new_club_error', error)

            })

        })

        //Retrieve clubs of user
        socket.on('retrieve_clubs', async (user: UserObject) => {

            console.log("Retrieving clubs for user: " + user.id)
            
            retrieveClubs(user, null)
            .then((clubs: ClubObject[]) => {
                
                socket.emit('retrieve_clubs_response', clubs)

            })
            .catch((error: string) => {
                
                socket.emit('retrieve_clubs_error', error)

            })
            
        })

    })
})
