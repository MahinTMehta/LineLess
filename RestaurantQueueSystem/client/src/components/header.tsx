import { useState } from "react";
import { Menu, X, Utensils, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-custom rounded-lg p-2">
              <Utensils className="text-white text-lg" size={20} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-secondary-custom">TableQ</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('customer')}
              className="text-gray-600 hover:text-primary-custom transition-colors font-medium"
            >
              Join Queue
            </button>
            <button 
              onClick={() => scrollToSection('status')}
              className="text-gray-600 hover:text-primary-custom transition-colors font-medium"
            >
              Check Status
            </button>
            <button 
              onClick={() => scrollToSection('admin')}
              className="text-gray-600 hover:text-primary-custom transition-colors font-medium"
            >
              Admin
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={user?.profileImageUrl || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700 font-medium">
                    {user?.firstName || user?.email}
                  </span>
                </div>
                <Button 
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="text-gray-600 hover:text-primary-custom transition-colors font-medium"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary-custom text-white hover:bg-orange-600 transition-colors font-medium"
              >
                <User className="mr-2" size={16} />
                Login
              </Button>
            )}
          </nav>

          <button 
            className="md:hidden text-gray-600 hover:text-primary-custom"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => scrollToSection('customer')}
                className="text-gray-600 hover:text-primary-custom transition-colors font-medium text-left"
              >
                Join Queue
              </button>
              <button 
                onClick={() => scrollToSection('status')}
                className="text-gray-600 hover:text-primary-custom transition-colors font-medium text-left"
              >
                Check Status
              </button>
              <button 
                onClick={() => scrollToSection('admin')}
                className="text-gray-600 hover:text-primary-custom transition-colors font-medium text-left"
              >
                Admin
              </button>
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.profileImageUrl || '/default-avatar.png'}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-gray-700 text-sm">
                      {user?.firstName || user?.email}
                    </span>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/api/logout'}
                    variant="outline"
                    className="text-gray-600 hover:text-primary-custom transition-colors font-medium w-fit"
                  >
                    <LogOut className="mr-2" size={16} />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-primary-custom text-white hover:bg-orange-600 transition-colors font-medium w-fit"
                >
                  <User className="mr-2" size={16} />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
