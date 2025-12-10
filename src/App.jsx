import { HashRouter, Routes, Route } from "react-router";
import Home from "./components/Home";
import Calendar from "./components/Calendar";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import About from "./components/About";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <Navbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;