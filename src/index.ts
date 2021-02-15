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
import { insertClub, retrieveClubs as retrieveClubsOfUser } from "./tableInterfaces/clubTables"

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
        socket.on('search_google_books_by_title', async (query: string) => {

            try {
                const volumeData = await searchGoogleBooksByTitle(query, apiKey)

                socket.emit('google_books_by_title_response', volumeData)
            }
            catch (error) {

                socket.emit('google_books_by_title_error', error)

            }
        })


        //New user registration
        socket.on('register_new_user', async (user: UserRegisterObject) => {

            try {

                const message = await insertUser(user)

                socket.emit('register_new_user_response', message)


            }
            catch (error) {

                socket.emit('register_new_user_error', error)

            }

        })

        //User login request
        socket.on('login_as_user', async (user: UserLoginObject) =>{

            let userData: UserLoginDataObject = { user: { id: null, username: null }, shelves: [], books: [], clubs: [] }

            try {
                userData.user = await retrieveUser(user)

                userData.shelves = await retrieveShelvesOfUser(userData.user)

                userData.books = await retrieveBooksOfShelves(userData.shelves)

                userData.clubs = await retrieveClubsOfUser(userData.user)
                
                console.log("User logging on: " + userData.user.username)

                socket.emit('login_as_user_response', userData)
            }
            catch(error) {

                socket.emit('login_as_user_error', error)

            }
        })

        //New shelf to add to database
        socket.on('post_new_shelf' , async (shelf: ShelfObject) => {

            try {

                const message = await insertShelf(shelf)

                socket.emit('post_new_shelf_response', message)

            }
            catch(error) {

                socket.emit('post_new_shelf_error', error)

            }

        })

        //Retrieve shelves of user
        socket.on('retrieve_shelves', async (user: UserObject) => {

            try {

                const shelves = await retrieveShelvesOfUser(user)

                socket.emit('retrieve_shelves_response', shelves)

            }
            catch(error) {
              
                socket.emit('retrieve_shelves_error', error)

            }

        })


        //New book to add to database
        socket.on('post_new_book', async (book: BookObject) =>{

            try {

                const message = await insertBook(book)

                socket.emit('post_new_book_response', message)

            }
            catch(error){
                
                socket.emit('post_new_book_error', error)

            }

        })

        //Retrieve books of user
        socket.on('retrieve_books', async (user) => {

            const data: {shelves: ShelfObject[], books: BookObject[]} = { shelves: [], books: [] }

            try {

                data.shelves = await retrieveShelvesOfUser(user)

                data.books = await retrieveBooksOfShelves(data.shelves)
                
                socket.emit('retrieve_books_response', data)

            }
            catch(error) {
                
                socket.emit('retrieve_books_error', error)
                
            }

        })

        //Post new club
        socket.on('post_new_club', async (clubData: ClubPostObject) => {

            try {

                const message = await insertClub(clubData)

                socket.emit('post_new_club_response', message)

            }
            catch(error) {
                
                socket.emit('post_new_club_error', error)

            }

        })

        //Retrieve clubs of user
        socket.on('retrieve_clubs', async (user: UserObject) => {

            console.log("Retrieving clubs for user: " + user.id)

            try {

                const clubs = await retrieveClubsOfUser(user)

                socket.emit('retrieve_clubs_response', clubs)

            }
            catch(error) {
                
                socket.emit('retrieve_clubs_error', error)

            }
            
        })

    })
})
