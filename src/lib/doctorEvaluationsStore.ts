interface DoctorEvaluation {
  id: number;
  docKey: string;
  behavior: string;
  competence: string;
  treatmentQuality: string;
  explanation: string;
  followUp: string;
  overallSatisfaction: string;
  comments: string;
  createdAt: string;
}

interface DoctorStats {
  totalEvaluations: number;
  avgSatisfaction: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getDoctorEvaluations(docKey?: string): Promise<DoctorEvaluation[]> {
  try {
    const adminSession = sessionStorage.getItem("moaser_admin_session");
    if (!adminSession) {
      throw new Error("Not authenticated");
    }

    const url = new URL(`${API_URL}/api/evaluations`);
    url.searchParams.append("adminSession", adminSession);
    if (docKey) {
      url.searchParams.append("docKey", docKey);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch evaluations");
    }

    const data = await response.json();
    return data.evaluations || [];
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return [];
  }
}

export function getDoctorStats(evaluations: DoctorEvaluation[]): DoctorStats {
  if (evaluations.length === 0) {
    return {
      totalEvaluations: 0,
      avgSatisfaction: 0,
    };
  }

  const satisfactionMap: { [key: string]: number } = {
    poor: 1,
    average: 2,
    excellent: 3,
  };

  const avgSatisfaction =
    evaluations.reduce((sum, evaluation) => {
      return sum + (satisfactionMap[evaluation.overallSatisfaction] || 0);
    }, 0) / evaluations.length;

  return {
    totalEvaluations: evaluations.length,
    avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
  };
}

export const doctorKeys = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7"];
