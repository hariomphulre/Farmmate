import { Link } from 'react-router-dom';
import '../Navbar.css';

const TraderNavbar = () => {
  return (
    <nav id="top-bar" className="fixed top-0 z-50 w-full border-b border-green-800 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center">
          <img style={{ paddingRight: "10px" }} width="45px" src="logo.png" alt="logo" />
          <Link to="/" style={{fontSize: "25px"}} className="text-xl text-white whitespace-nowrap">
            Climate Resilient Agriculture
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TraderNavbar;