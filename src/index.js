const axios = require('axios')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 3000;
const io = require('socket.io')(server);

const fs = require('fs');
const { queryBooksByTitle } = require('./requestHandler');

fs.readFile('../../apiKey.txt', 'utf8', (err, data) => {

    if (err) throw err

    const apiKey = data

    console.log("API key acquired.")

    server.listen(port, () => {
        console.log("Listening on port " + port)
    });

    io.on('connection' , socket => {

        console.log("Client connected")

        socket.on('query', data => {

            let reply = { error: false, data: "payload" }

            queryBooksByTitle(data, apiKey)

            .then((response) => {
                console.log(response.data)
                reply = { error: false, data: response.data.items }
                socket.emit('queryResponse', reply)   
            })

            .catch((error) => {
                reply = { error: true, data: error.message }
                socket.emit('queryResponse', reply)
            })
        })
    })
})
