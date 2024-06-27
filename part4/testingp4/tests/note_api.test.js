const {test, after, beforeEach, describe} = require('node:test')
const Note = require('../models/note')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
    beforeEach(async () => {
        await Note.deleteMany({})
    
        const noteObjects = helper.initialNotes
            .map(note => new Note(note))
        const promiseArray = noteObjects.map(async (note) => {
            await note.save()
        })
        await Promise.all(promiseArray)
    })

    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('there are two notes', async () => {
        const response = await api.get('/api/notes')
        assert.strictEqual(response.body.length, helper.initialNotes.length)
    })
    test('the first note is about HTTP methods', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map(e => e.content)
        assert(contents.includes('HTML is easy'))
    })

    describe('viewing a specific note', () => {
        test('a specific note can be viewed', async () => {
            const notesAtStart = await helper.notesInDb()
            const noteToView = notesAtStart[0]
        
            const resultNote = await api
                .get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        
            assert.deepStrictEqual(resultNote.body, noteToView)
        })
        test('try viewing note if note dne', async () => {
            const nonexistingId = await helper.nonExistingId()
            // console.log(nonexistingId)
        
            const resultNote = await api
                .get(`/api/notes/${nonexistingId}`)
                .expect(404)
        
            assert.deepStrictEqual(resultNote.body, {})
        })
        test('fails with statuscode 400 id is invalid', async () => {
            const invalidId = '1'

            await api
                .get(`/api/notes/${invalidId}`)
                .expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('a valid note can be added', async () => {
            const newNote = {
                content: 'async simplifies making async calls',
                important: true
            }
            await api
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        
            
            const notesAtEnd = await helper.notesInDb()
            // console.log(notesAtEnd)
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
        
            const contents = notesAtEnd.map(r => r.content)
            assert(contents.includes('async simplifies making async calls'))
        })
        test('note without content is not added', async () => {
            const newNote = {
                content: "a",
                important: true
            }
        
            await api
                .post('/api/notes')
                .send(newNote)
                .expect(400)
        
            const notesAtEnd = await helper.notesInDb()
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
        })
    })

    describe('deletion of a note', () => {
        test('a note can be deleted', async () => {
            const notesAtStart = await helper.notesInDb()
            // console.log(notesAtStart)
            const noteToDelete = notesAtStart[0]
        
            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .expect(204)
        
            const notesAtEnd = await helper.notesInDb()
            // console.log(notesAtEnd)
            const contents = notesAtEnd.map(r => r.content)
        
            assert(!contents.includes(noteToDelete.content))
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
        })
    })
})

// test('change HTML note importance to true', async () => {
//     const notesAtStart = await helper.notesInDb();
//     const noteToChange = notesAtStart[0]

//     const newNote = {
//         content: 'HTML is easy',
//         important: true
//     }

//     const updatedNote = await api
//         .put(`/api/notes/${noteToChange.id}`)
//         .send(newNote)
//         .expect(200)

//     // console.log(updatedNote.body)
//     assert.strictEqual(updatedNote.body.important, true)
// })




after(async () => {
    await mongoose.connection.close()
})
