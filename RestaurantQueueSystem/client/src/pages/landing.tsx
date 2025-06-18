import { LogIn, Users, Clock, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-custom/10 to-accent-custom/10">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-custom rounded-lg p-2">
                <div className="text-white text-lg">🍽️</div>
              </div>
              <h1 className="text-2xl font-heading font-bold text-secondary-custom">TableQ</h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-custom text-white hover:bg-orange-600 transition-colors font-medium"
            >
              <LogIn className="mr-2" size={16} />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary-custom mb-6">
            Skip the Wait,<br />
            <span className="text-primary-custom">Enjoy Your Meal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join restaurant queues remotely, get real-time updates on your table availability, 
            and never wait in crowded spaces again. The future of dining is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-custom text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg h-auto"
            >
              <LogIn className="mr-2" size={20} />
              Get Started
            </Button>
            <Button 
              variant="outline"
              className="bg-white text-primary-custom border-2 border-primary-custom px-8 py-4 rounded-xl hover:bg-primary-custom hover:text-white transition-all font-semibold text-lg shadow-lg h-auto"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-custom mb-2">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-custom mb-2">50+</div>
              <div className="text-gray-600">Partner Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-custom mb-2">45min</div>
              <div className="text-gray-600">Average Wait Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-secondary-custom mb-4">
              Why Choose TableQ?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of restaurant dining with our innovative queue management system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-custom/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-custom/20 transition-colors">
                  <Clock className="text-primary-custom" size={32} />
                </div>
                <h3 className="text-xl font-bold text-secondary-custom mb-4">Save Time</h3>
                <p className="text-gray-600">
                  No more standing in line. Join queues remotely and get notified when your table is ready.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent-custom/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-custom/20 transition-colors">
                  <Shield className="text-accent-custom" size={32} />
                </div>
                <h3 className="text-xl font-bold text-secondary-custom mb-4">Safe & Secure</h3>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security. Queue with confidence.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-info-custom/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-info-custom/20 transition-colors">
                  <Users className="text-info-custom" size={32} />
                </div>
                <h3 className="text-xl font-bold text-secondary-custom mb-4">Real-time Updates</h3>
                <p className="text-gray-600">
                  Get live updates on your queue position and estimated wait time via email and notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary-custom text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Ready to Skip the Wait?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who have transformed their dining experience.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary-custom text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all font-semibold text-lg shadow-lg h-auto"
          >
            <LogIn className="mr-2" size={20} />
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary-custom rounded-lg p-2">
                  <div className="text-white">🍽️</div>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white">TableQ</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing restaurant queuing with smart technology. 
                Skip the wait, enjoy your meal.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4 text-white">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-custom transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-custom transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-custom transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-custom transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-custom transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-custom transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 TableQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}