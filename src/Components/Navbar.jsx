import { Link, useNavigate } from 'react-router-dom';
import { Home, Leaf, MessageCircle, LogOut } from 'lucide-react';

const Navbar = ({id}) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="w-6 h-6 text-green-500" />
              <span className="text-lg font-semibold text-gray-800">FlowerCare</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              <span>Home</span>
            </Link>

            <Link
              to={`/flowers/${id}`}
              className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
            >
              <Leaf className="w-5 h-5 mr-2" />
              <span>Disease Detection</span>
            </Link>

            <Link
              to={`/community/${id}`}
              className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span>Community Chat</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 