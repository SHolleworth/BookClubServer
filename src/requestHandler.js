const axios = require('axios')

const queryBooksByTitle = async (query, apiKey) => {
    const formattedQuery = query.toString().replace(/ /g, "+")

    return new Promise((resolve, reject) => {
        axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${formattedQuery}&maxResults=20&key=${apiKey}`)
        .then((response) => {
            resolve(response)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports.queryBooksByTitle = queryBooksByTitle