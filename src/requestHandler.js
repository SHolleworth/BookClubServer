const axios = require('axios')



const searchGoogleBooksByTitle = async (query, apiKey) => {

    console.log('Google books query from client.')

    return new Promise(async (resolve, reject) => {

        const formattedQuery = query.toString().replace(/ /g, "+")

        try {

            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${formattedQuery}&maxResults=20&key=${apiKey}`)

            console.log(`Returned ${response.data.items.length} results.`)

            return resolve(response.data.items)

        }
        catch (error) {

            console.log("Error finding search results: ", error.response.data.error)

            return reject(error.message)

        }
    })

}

module.exports = { searchGoogleBooksByTitle }