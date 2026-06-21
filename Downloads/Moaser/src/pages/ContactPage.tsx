import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import LocationMapSection from "@/components/LocationMapSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const ContactPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <ContactSection />
        <LocationMapSection />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default ContactPage;
