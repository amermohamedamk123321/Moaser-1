import Navbar from "@/components/Navbar";
import DoctorsSection from "@/components/DoctorsSection";
import DoctorEvaluationForm from "@/components/DoctorEvaluationForm";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const DoctorsPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <DoctorsSection />
        <DoctorEvaluationForm />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default DoctorsPage;
