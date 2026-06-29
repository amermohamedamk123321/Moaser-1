import Navbar from "@/components/Navbar";
import PatientFeedbackSurveyForm from "@/components/PatientFeedbackSurveyForm";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const PatientFeedbackSurveyPage = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <PatientFeedbackSurveyForm />
      </div>
      <Footer />
    </div>
  </PageTransition>
);

export default PatientFeedbackSurveyPage;
