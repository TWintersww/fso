import { useState } from 'react'

const Display = props => <div>{props.value}</div>

const Button = (props) => {
  //console.log('button props value is: ', props)
  return (
    <button onClick={props.onClick}>
      {props.text}
    </button>
  )
}

const History = (props) => {
  //console.log(props)
  if (props.allClicks.length === 0) {
    return (
      <div>
        the app is used by pressing the buttons
      </div>
    )
  }
  else {
    return (
      <div>
        button press history: {props.allClicks.join(' ')}
      </div>
    )
  }
}

const App = () => {

  const [value, setValue] = useState(0)

  const setToValue = (newValue) => {
    console.log("set value to ", newValue)
    setValue(newValue)
  }

  return (
    <div>
    <Display value={value} />
    <Button onClick={() => setToValue(5)} text='button' />
    <button onClick={() => setToValue(10)}>button</button>
    <button onClick={() => setToValue(15)}>button</button>
    </div>
  )
}

export default App
