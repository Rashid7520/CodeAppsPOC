import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const [showGreeting, setShowGreeting] = useState(true)

  return (
    <>
      <header className="hero">
        <div className="logos">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <h1>Hello Vite!</h1>
        <p className="subtitle">Interactive home — try the controls below.</p>

        <div className="controls">
          <input
            aria-label="Your name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={() => setShowGreeting((s) => !s)}>
            {showGreeting ? 'Hide' : 'Show'} greeting
          </button>
        </div>

        {showGreeting && <h2 className="greeting">Hello, {name || 'Vite'}!</h2>}
      </header>

      <main>
        <h2>Vite + React</h2>
        <div className="card">
          <button onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </main>
    </>
  )
}

export default App
