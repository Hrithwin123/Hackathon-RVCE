import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Leaf, MessageCircle, Globe, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Navbar = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Translate all text content
  const translations = {
    flowers: useTranslation("Flowers"),
    community: useTranslation("Community"),
    profile: useTranslation("Profile"),
    logout: useTranslation("Logout"),
    language: useTranslation("Language"),
    languages: {
      en: useTranslation("English"),
      hi: useTranslation("Hindi"),
      kn: useTranslation("Kannada")
    }
  };

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <>
      <nav className="bg-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/flowers" className="flex items-center space-x-2">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-primary">Flowers</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/flowers"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                <Leaf className="h-5 w-5 mr-2" />
                {translations.flowers}
              </Link>
              <Link
                to="/community"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {translations.community}
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                <User className="h-5 w-5 mr-2" />
                {translations.profile}
              </Link>

              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>{translations.language}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <button
                    onClick={() => setCurrentLanguage('en')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === 'en' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.en}
                  </button>
                  <button
                    onClick={() => setCurrentLanguage('hi')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === 'hi' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.hi}
                  </button>
                  <button
                    onClick={() => setCurrentLanguage('kn')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === 'kn' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.kn}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{translations.logout}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/flowers"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Leaf className="h-5 w-5 mr-2" />
                {translations.flowers}
              </Link>
              <Link
                to="/community"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {translations.community}
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-2" />
                {translations.profile}
              </Link>

              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 mb-2">{translations.language}</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCurrentLanguage('en');
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'en' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.en}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLanguage('hi');
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'hi' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.hi}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLanguage('kn');
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'kn' ? 'text-green-500 bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {translations.languages.kn}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>{translations.logout}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default Navbar; 