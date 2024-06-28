const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const logger = require('../utils/logger')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({}).populate('user', {username: 1, name: 1})
    response.json(notes)
})
notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        response.json(note)
    }
    else {
        response.status(404).end()
    }

})
notesRouter.delete('/:id', async (request, response) => {
    const deletedNote = await Note.findByIdAndDelete(request.params.id)
    if (deletedNote) {
        logger.info('deleted', deletedNote)
    }
    else {
        logger.error('tried to delete note that DNE')
    }
    response.status(204).end()
})
notesRouter.post('/', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({error: 'token invalid'})
    }
    
    const user = await User.findById(decodedToken.id)
    // console.log('userid was found')
    // console.log(user, user.id)
    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user._id
    })
    // console.log('note document successfully created')

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    response.status(201).json(savedNote)

})
notesRouter.put('/:id', (request, response, next) => {
    const {content, important} = request.body

    Note.findByIdAndUpdate(request.params.id, {content, important}, {new:true, runValidators:true, context:'query'})
        .then(updatedNote => {
            response.status(200).json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter
