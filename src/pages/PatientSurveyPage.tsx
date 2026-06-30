import Navbar from "@/components/Navbar";
import PatientSurveyForm from "@/components/PatientSurveyForm";
import PatientFeedbackSurveyForm from "@/components/PatientFeedbackSurveyForm";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const PatientSurveyPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <PatientSurveyForm />
        <div className="py-12 border-t border-border"></div>
        <PatientFeedbackSurveyForm />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default PatientSurveyPage;
