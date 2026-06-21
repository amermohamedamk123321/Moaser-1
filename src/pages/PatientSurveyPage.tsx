import Navbar from "@/components/Navbar";
import PatientSurveyForm from "@/components/PatientSurveyForm";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const PatientSurveyPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <PatientSurveyForm />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default PatientSurveyPage;
