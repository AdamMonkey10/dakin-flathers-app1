import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FileText, BarChart3, LogOut, Settings, Users, Menu, X, ListFilter, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { signOut, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-900">
                <Home className="h-5 w-5 mr-2" />
                <span className="font-medium">Dakin Flathers</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8 ml-8">
                <Link
                  to="/completed-batches"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  <span>Completed Batches</span>
                </Link>

                <Link
                  to="/performance-metrics"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span>Performance Metrics</span>
                </Link>

                <Link
                  to="/preloaded-batches"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ListFilter className="h-5 w-5 mr-2" />
                  <span>Preloaded Batches</span>
                </Link>

                <Link
                  to="/add-product"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Add Product</span>
                </Link>

                <Link
                  to="/operators"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span>Operators</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentUser.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/completed-batches"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5 mr-2 inline-block" />
                Completed Batches
              </Link>

              <Link
                to="/performance-metrics"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5 mr-2 inline-block" />
                Performance Metrics
              </Link>

              <Link
                to="/preloaded-batches"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <ListFilter className="h-5 w-5 mr-2 inline-block" />
                Preloaded Batches
              </Link>

              <Link
                to="/add-product"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2 inline-block" />
                Add Product
              </Link>

              <Link
                to="/operators"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5 mr-2 inline-block" />
                Operators
              </Link>

              <button
                onClick={toggleFullscreen}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-5 w-5 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-5 w-5 mr-2" />
                    Enter Fullscreen
                  </>
                )}
              </button>

              {currentUser && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5 mr-2 inline-block" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}