import { useState, useEffect } from "react"
import noteService from "./services/notes"
import Note from "./components/Note"
import Notification from "./components/Notification"
import Footer from "./components/Footer"



const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  const hook = () => {
    console.log('render effect')
    noteService
      .getAll()
      .then(initialNotes => {
        console.log('render promise fulfilled')
        setNotes(initialNotes)
      })
  }
  useEffect(hook, [])
  console.log('render ', notes.length, ' notes')

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService
      .create(noteObject)
      .then(returnedNote => {
        console.log('returnedNote: ', returnedNote)
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }
  const handleNoteChange = (event) => {
    //console.log(event.target.value)
    setNewNote(event.target.value)
  }

  const toggleImportance = (id) => {
    const note = notes.find(note => note.id === id)
    const updatedNote = {...note, important: !note.important}

    noteService
      .update(id, updatedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => {
          return note.id === id ? returnedNote : note
        }))
      })
      .catch((error) => {
        setErrorMessage(`Note '${note.content}' was already removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const notesToShow = showAll 
    ? notes
    : notes.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => {
          //console.log(note.id)
          return <Note key={note.id} note={note} toggleImportance={() => toggleImportance(note.id)}/>
        })}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange}/>
        <button type="submit">save</button>
      </form>
      <Footer />
    </div>
  )
}

export default App
