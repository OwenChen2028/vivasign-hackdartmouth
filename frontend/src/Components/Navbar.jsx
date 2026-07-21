import { Link } from 'react-router';
import '../styles/navbar.css';

function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary navigation">
      <Link to="/" className="logo">VivaSign</Link>
      <Link to="/webcam" className="link">Practice</Link>
    </nav>
  );
}

export default Navbar;
