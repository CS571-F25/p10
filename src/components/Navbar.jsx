import { Link, useNavigate } from "react-router";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("username");

  function handleProtectedNav(e, path) {
    if (!loggedIn) {
      e.preventDefault();
      alert("Log in or create an account to continue!");
      navigate("/");
    }
  }

  function handleLogout() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-logo">pomocat</span>
      </div>

      <div className="nav-links">
        <Link to="/home" onClick={(e) => handleProtectedNav(e, "/home")}>
          Home
        </Link>

        <Link
          to="/calendar"
          onClick={(e) => handleProtectedNav(e, "/calendar")}
        >
          Calendar
        </Link>

        <Link to="/profile" onClick={(e) => handleProtectedNav(e, "/profile")}>
          Profile
        </Link>
      </div>

      <div className="nav-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
