const axios = require('axios')

const searchGoogleBooksByTitle = async (query, apiKey) => {

    console.log('Google books query from client.')

    return new Promise(async (resolve, reject) => {

        const formattedQuery = query.toString().replace(/ /g, "+")

        try {

            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${formattedQuery}&maxResults=20&key=${apiKey}`)

            return resolve(response.data.items)

        }
        catch (error) {

            return reject(error.message)

        }
    })

}

module.exports = { searchGoogleBooksByTitle }