import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Anime Openings Tournament</h1>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-lg">Welcome to the bracket tournament</p>
        </div>
      </div>
    </div>
  )
}

export default App
