import { Utensils } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary-custom text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-custom rounded-lg p-2">
                <Utensils className="text-white" size={20} />
              </div>
              <h3 className="text-2xl font-heading font-bold">TableQ</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Revolutionizing restaurant queuing with smart technology. 
              Skip the wait, enjoy your meal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary-custom transition-colors">
                <div className="text-xl">🐦</div>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-custom transition-colors">
                <div className="text-xl">📘</div>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-custom transition-colors">
                <div className="text-xl">📷</div>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-custom transition-colors">
                <div className="text-xl">💼</div>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#customer" className="hover:text-primary-custom transition-colors">Join Queue</a></li>
              <li><a href="#status" className="hover:text-primary-custom transition-colors">Check Status</a></li>
              <li><a href="#" className="hover:text-primary-custom transition-colors">Find Restaurants</a></li>
              <li><a href="#" className="hover:text-primary-custom transition-colors">Mobile App</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">For Restaurants</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#admin" className="hover:text-primary-custom transition-colors">Dashboard</a></li>
              <li><a href="#api-docs" className="hover:text-primary-custom transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-primary-custom transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary-custom transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 TableQ. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-primary-custom text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-primary-custom text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-primary-custom text-sm transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
