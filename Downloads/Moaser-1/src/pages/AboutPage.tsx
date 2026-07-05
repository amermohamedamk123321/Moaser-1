import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const AboutPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <AboutSection />
        <VisionMissionSection />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default AboutPage;
