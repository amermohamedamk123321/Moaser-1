import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeServicesShowcase from "@/components/HomeServicesShowcase";
import WhyChooseUs from "@/components/WhyChooseUs";
import HomeDoctorsPreview from "@/components/HomeDoctorsPreview";
import HomeCTA from "@/components/HomeCTA";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import LocationMapSection from "@/components/LocationMapSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Index = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HomeServicesShowcase />
      <BeforeAfterSection />
      <WhyChooseUs />
      <HomeDoctorsPreview />
      <LocationMapSection />
      <HomeCTA />
      <Footer />
    </div>
  </PageTransition>
);

export default Index;
