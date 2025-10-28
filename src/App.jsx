import { HashRouter, Route, Routes } from 'react-router'
import Home from './components/Home';
import Calendar from './components/Calendar';
import './App.css'

function App() {
  return <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Calendar" element={<Calendar />} />
      </Routes>
    </HashRouter>
}

export default App
