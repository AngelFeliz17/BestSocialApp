import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, Settings, LogOut, Search, X, Menu } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { useUser } from '../hooks/useUser';
import api from '../context/axios';

interface User {
  _id: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login")
    setIsMobileMenuOpen(false);
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchUsername.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
  
      setIsSearching(true);
  
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(searchUsername)}`);
        setSearchResults(res.data.users.slice(0, 5));
        setShowResults(true);
      } catch (error) {
        console.log("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
  
    }, 300); // debounce
  
    return () => clearTimeout(timer);
  }, [searchUsername]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (
        (desktopSearchRef.current && desktopSearchRef.current.contains(targetNode)) ||
        (mobileSearchRef.current && mobileSearchRef.current.contains(targetNode))
      ) {
        return;
      }
      setShowResults(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = (username: string) => {
    setSearchUsername('');
    setShowResults(false);
    setIsMobileMenuOpen(false);
    navigate(`/profile/${username}`);
  };

  const clearSearch = () => {
    setSearchUsername('');
    setSearchResults([]);
    setShowResults(false);
    const activeInput =
      (isMobileMenuOpen && mobileInputRef.current) ||
      desktopInputRef.current ||
      mobileInputRef.current;
    activeInput?.focus();
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/feed" className="text-2xl font-bold text-primary-600">
            BestSocialApp
          </Link>

          <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">
            <div className="w-full max-w-md" ref={desktopSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchUsername}
                  onChange={(e) => {
                    setSearchUsername(e.target.value);
                    if (e.target.value) {
                      setShowResults(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchUsername && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((searchUser) => (
                          <button
                            key={searchUser._id}
                            onClick={() => handleUserClick(searchUser.username)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 text-left"
                          >
                            <Avatar
                              src={searchUser.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                              alt={searchUser.username}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{searchUser.username}</p>
                              {searchUser.email && (
                                <p className="text-sm text-gray-500 truncate">{searchUser.email}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchUsername && !isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No users found</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/feed"
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Home className="w-6 h-6" />
              </Link>

              <Link
                to={`/profile/${user?.username}`}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <User className="w-6 h-6" />
              </Link>

              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Settings className="w-6 h-6" />
              </Link>

              <div className="flex items-center space-x-3">
                <Avatar src={ user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt="user" size="sm" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut onClick={handleLogout} className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:hidden flex-col gap-4 pb-4`}>
          <div className="w-full" ref={mobileSearchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search users..."
                value={searchUsername}
                onChange={(e) => {
                  setSearchUsername(e.target.value);
                  if (e.target.value) {
                    setShowResults(true);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchUsername && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((searchUser) => (
                        <button
                          key={searchUser._id}
                          onClick={() => handleUserClick(searchUser.username)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 text-left"
                        >
                          <Avatar
                            src={searchUser.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                            alt={searchUser.username}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{searchUser.username}</p>
                            {searchUser.email && (
                              <p className="text-sm text-gray-500 truncate">{searchUser.email}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchUsername && !isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No users found</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/feed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Feed</span>
            </Link>

            <Link
              to={`/profile/${user?.username}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div className="flex items-center space-x-3">
                <Avatar src={ user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt="user" size="sm" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.username}</p>
                  <p className="text-gray-500 truncate max-w-[160px]">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
