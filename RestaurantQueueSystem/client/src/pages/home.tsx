import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import ProtectedQueueForm from "@/components/protected-queue-form";
import QueueStatus from "@/components/queue-status";
import AdminDashboard from "@/components/admin-dashboard";
import ApiDocs from "@/components/api-docs";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <ProtectedQueueForm />
      <QueueStatus />
      <AdminDashboard />
      <ApiDocs />
      <Footer />
    </div>
  );
}
