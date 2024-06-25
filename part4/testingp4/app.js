//importing modules and dependencies
const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

//setting up connection to DB
mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URL)
mongoose.connect(config.MONGODB_URL)
    .then(result => {
        logger.info('connected to MDB')
    })
    .catch(error => {
        logger.error('error connecting to MDB:', error.message)
    })

const app = express()
//middlewares to run before route handling
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(middleware.requestLogger)

//route handler
app.use('/api/notes', notesRouter)

//post-route handling middlewares
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
