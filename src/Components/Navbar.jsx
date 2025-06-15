import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Leaf, MessageCircle, Globe, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Navbar = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const navigate = useNavigate();
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  // Define language names directly instead of using translations
  const languageNames = {
    en: "English",
    hi: "हिंदी",
    kn: "ಕನ್ನಡ"
  };

  const translations = {
    projectTitle: useTranslation("LEAFSENSE"),
    flowers: useTranslation("Analyze Your Plant"),
    community: useTranslation("Community"),
    profile: useTranslation("Profile"),
    logout: useTranslation("Logout"),
    language: useTranslation("Language")
  };

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

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Title */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {translations.projectTitle}
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            {id && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to={`/flowers/${id}`}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <Leaf className="h-5 w-5 mr-2" />
                  {translations.flowers}
                </Link>
                <Link
                  to={`/community/${id}`}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {translations.community}
                </Link>
                <Link
                  to={`/profile/${id}`}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <User className="h-5 w-5 mr-2" />
                  {translations.profile}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {translations.logout}
                </button>
                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    {languageNames[currentLanguage]}
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === 'en' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          role="menuitem"
                        >
                          {languageNames.en}
                        </button>
                        <button
                          onClick={() => handleLanguageChange('hi')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === 'hi' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          role="menuitem"
                        >
                          {languageNames.hi}
                        </button>
                        <button
                          onClick={() => handleLanguageChange('kn')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === 'kn' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          role="menuitem"
                        >
                          {languageNames.kn}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            {id && (
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {id && isOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to={`/flowers/${id}`}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Leaf className="h-5 w-5 mr-2" />
                {translations.flowers}
              </Link>
              <Link
                to={`/community/${id}`}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {translations.community}
              </Link>
              <Link
                to={`/profile/${id}`}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-2" />
                {translations.profile}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                {translations.logout}
              </button>
              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 mb-2">{translations.language}</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleLanguageChange('en');
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'en' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {languageNames.en}
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageChange('hi');
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'hi' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {languageNames.hi}
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageChange('kn');
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
                      currentLanguage === 'kn' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {languageNames.kn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default Navbar; 