import { useState, useEffect, useRef } from "react"
import noteService from "./services/notes"
import loginService from "./services/login"
import Note from "./components/Note"
import LoginForm from "./components/LoginForm"
import NoteForm from "./components/NoteForm"
import Notification from "./components/Notification"
import Footer from "./components/Footer"
import Togglable from "./components/Togglable"



const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginVisible, setLoginVisible] = useState(false)
  const [user, setUser] = useState(null)
  const noteFormRef = useRef()

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
  useEffect(() => {
    const existingUser = window.localStorage.getItem('loggedNoteappUser')
    if (existingUser) {
      const user = JSON.parse(existingUser)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])
  console.log('render ', notes.length, ' notes')

  // const handleUsernameChange = (event) => {
  //   setUsername(event.target.value)
  // }
  // const handlePasswordChange = (event) => {
  //   setPassword(event.target.value)
  // }
  const loginForm = () => {
    // const hideWhenVisible = {display: loginVisible ? 'none' : ''}
    // const showWhenVisible = {display: loginVisible ? '' : 'none'}

    // return (
    //   <div>
    //     <div style={hideWhenVisible}>
    //       <button onClick={() => setLoginVisible(true)}>log in</button>
    //     </div>
    //     <div style={showWhenVisible}>
    //       <LoginForm 
    //         username={username}
    //         password={password}
    //         handleUsernameChange={(event) => setUsername(event.target.value)}
    //         handlePasswordChange={(event) => setPassword(event.target.value)}
    //         handleLogin={handleLogin}
    //       />
    //       <button onClick={() => setLoginVisible(false)}>cancel</button>
    //     </div>
    //   </div>
    // )

    return (
      <Togglable buttonLabel='login'>
        <LoginForm 
          username={username}
          password={password}
          handleUsernameChange={(event) => setUsername(event.target.value)}
          handlePasswordChange={(event) => setPassword(event.target.value)}
          handleLogin={handleLogin}
        />
      </Togglable>
    )
  }
  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        console.log('returnedNote: ', returnedNote)
        setNotes(notes.concat(returnedNote))
      })
  }
  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    // console.log('login button pressed', username, password)
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    }
    catch(exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
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

      {user === null 
        ? loginForm()
        : <div>
            <p>{user.name} logged-in</p>
            {noteForm()}
          </div>
      }

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

      <Footer />
    </div>
  )
}

export default App
