// The requirements
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const util = require('util')
const res = require('express/lib/response')

// Create the API
const api = express()
api.use(bodyParser.json())

// Create a connection to the DB
var connection = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATA,
    port: 3306
})

api.get('/', (req, res) => {
    res.json({ "api_name": "Puzzle Game API", "api_version": "1.0.0" })
})

// Set route for /leaderboard
api.route('/leaderboard')
    .get((req, res) => {

        // Get the API key from the request
        var apikey = req.get('x-api-key')

        // Check the API key exists
        if (apikey == null) {
            res.status(400)
            return res.json({ "error_code": 400, "error_message": "No API key was provided" })
        }

        // Query the DB for the key
        connection.query('SELECT * FROM apikeys WHERE apikey="' + apikey + '"', async (error, results, fields) => {

            // Throw the error if there is an error
            if (error) throw error

            // Wait for the results
            await results

            // Check if the API key exists
            if (results[0] == null) {

                // Send back the error and its code
                res.status(401)
                return res.json({ "error_code": 401, "error_message": "An invalid API key was provided!" })

            }

            // Create an array for the itmes
            var plays = []

            // Query the DB for the user leaderboards
            connection.query('SELECT * FROM leaderboard', async (error, results, fields) => {

                // Throw the error if there is an error
                if (error) throw error

                // Wait for the results
                await results

                // For all of the results
                results.forEach(element => {

                    // Create an item to put in the array
                    var item = {
                        play_playername: element['player_name'],
                        play_playtime: element['player_time']
                    }

                    // Add the item to the array
                    plays.push(item)

                });

                // Log to the console and send the response
                console.log(`A \u001b[34mGET \u001b[0mrequest was sent to /leadboard by ${apikey}`)
                res.json({ plays })

            })            

        })

    })
    .post((req,res) => {

    })

// Tell the API to listen on port 8080
api.listen(process.env.PORT, () => {

    console.log(`The API is running on port ${process.env.PORT}`)

})