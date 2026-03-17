interface DoctorEvaluation {
  id?: number | string;
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

export async function getDoctorEvaluations(docKey?: string): Promise<DoctorEvaluation[]> {
  const adminSession = sessionStorage.getItem("moaser_admin_session");
  if (!adminSession) {
    console.warn("Not authenticated");
    return [];
  }

  try {
    // Try to fetch from backend API (via proxy in dev)
    const params = new URLSearchParams({ adminSession });
    if (docKey) {
      params.append("docKey", docKey);
    }

    const response = await fetch(`/api/evaluations?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      return data.evaluations || [];
    }
  } catch (error) {
    console.warn("Backend API unavailable, falling back to localStorage:", error);
  }

  // Fallback to localStorage
  try {
    const storedEvaluations = JSON.parse(localStorage.getItem("moaser_evaluations") || "[]");
    if (docKey) {
      return storedEvaluations.filter((evaluation: DoctorEvaluation) => evaluation.docKey === docKey);
    }
    return storedEvaluations;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
}

export function getDoctorStats(evaluations: DoctorEvaluation[]): DoctorStats {
  if (!evaluations || evaluations.length === 0) {
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

  const totalScore = evaluations.reduce((sum, evaluation) => {
    return sum + (satisfactionMap[evaluation?.overallSatisfaction] || 0);
  }, 0);

  const avgSatisfaction = totalScore / evaluations.length;

  return {
    totalEvaluations: evaluations.length,
    avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
  };
}

export const doctorKeys = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7"];
