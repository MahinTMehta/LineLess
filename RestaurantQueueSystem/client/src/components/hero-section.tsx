import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="bg-gradient-to-br from-primary-custom/10 to-accent-custom/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary-custom mb-6">
          Skip the Wait,<br />
          <span className="text-primary-custom">Enjoy Your Meal</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join restaurant queues remotely and get real-time updates on your table availability. 
          No more crowded waiting areas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => scrollToSection('customer')}
            className="bg-primary-custom text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg h-auto"
          >
            <PlusCircle className="mr-2" size={20} />
            Join a Queue
          </Button>
          <Button 
            variant="outline"
            onClick={() => scrollToSection('status')}
            className="bg-white text-primary-custom border-2 border-primary-custom px-8 py-4 rounded-xl hover:bg-primary-custom hover:text-white transition-all font-semibold text-lg shadow-lg h-auto"
          >
            <Search className="mr-2" size={20} />
            Check Status
          </Button>
        </div>
      </div>
    </section>
  );
}
