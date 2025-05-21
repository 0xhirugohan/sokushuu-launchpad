import { Link } from 'react-router';
import './App.css'

function App() {
  return (
    <>
      <div className="p-4 min-w-40 flex flex-col gap-y-8">
          <p className="text-center text-4xl">Welcome to <br /> Sokushuu Launchpad</p>

          <p className="text-center">Craft your own personalized NFT Token today</p>

          <div className="flex flex-col gap-y-4">
              <Link
                  to="/launch"
                  className="text-center border-2 border-zinc-600 p-2 rounded-md text-black"
              >
                  Launch Token
              </Link>
          </div>
      </div>
    </>
  )
}

export default App
