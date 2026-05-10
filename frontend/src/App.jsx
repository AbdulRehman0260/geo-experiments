import './App.css'
import HomePage from './pages/HomePage'
import BestModel from './pages/BestModel'
import GeoPage from './pages/GeoPage'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path='/best-model' element={<BestModel />} />
        <Route path='/geo' element={<GeoPage />} />
      </Routes>
    </>
  )
}

export default App
