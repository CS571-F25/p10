import { HashRouter, Route, Routes } from 'react-router'
import Home from './components/Home';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import './App.css'

function App() {
  return <>
  <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Calendar" element={<Calendar />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </HashRouter>
  </>
}

export default App
