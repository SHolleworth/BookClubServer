const axios = require('axios')

const searchGoogleBooksByTitle = async (query, apiKey) => {

    console.log('Google books query from client.')

    return new Promise((resolve, reject) => {
    
        let reply = { error: false, data: "payload" }

        const formattedQuery = query.toString().replace(/ /g, "+")

        axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${formattedQuery}&maxResults=20&key=${apiKey}`)
        .then((response) => {

           resolve(response.data.items)
    
        })
        .catch((error) => {

            reject(error.message)

        })

    })
}

module.exports = { searchGoogleBooksByTitle }