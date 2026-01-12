import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='h-full w-full bg-green-500'>
        Hello World!
      </div>
    </>
  )
}

export default App
