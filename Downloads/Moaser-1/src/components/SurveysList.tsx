import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Survey {
  id: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  waitingTime?: number;
  suggestions?: string;
  createdAt: string;
  updatedAt: string;
}

interface SurveyStats {
  totalResponses: number;
  avgQ1: number;
  avgQ2: number;
  avgQ3: number;
  avgQ4: number;
  avgQ5: number;
  avgOverall: number;
  avgWaitingTime?: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUESTIONS = [
  { key: "q1", label: "Doctor's Professional Behavior" },
  { key: "q2", label: "Doctor's Competence" },
  { key: "q3", label: "Treatment Quality" },
  { key: "q4", label: "Clarity of Explanation" },
  { key: "q5", label: "Follow-up Care" },
];

function getColorByRating(avg: number): string {
  if (avg < 3) return "text-red-600";
  if (avg < 4) return "text-yellow-600";
  return "text-green-600";
}

function getProgressColor(avg: number): string {
  if (avg < 3) return "bg-red-500";
  if (avg < 4) return "bg-yellow-500";
  return "bg-green-500";
}

export default function SurveysList() {
  const { t } = useTranslation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<SurveyStats>({
    totalResponses: 0,
    avgQ1: 0,
    avgQ2: 0,
    avgQ3: 0,
    avgQ4: 0,
    avgQ5: 0,
    avgOverall: 0,
    avgWaitingTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("moaser_admin_token");

      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/api/surveys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch surveys");
      }

      const data = await response.json();
      setSurveys(data.surveys || []);
      setStats(data.stats || {
        totalResponses: 0,
        avgQ1: 0,
        avgQ2: 0,
        avgQ3: 0,
        avgQ4: 0,
        avgQ5: 0,
        avgOverall: 0,
        avgWaitingTime: 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load surveys"
      );
      console.error("Error loading surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this survey response?")) {
      return;
    }

    try {
      const token = localStorage.getItem("moaser_admin_token");

      const response = await fetch(`${API_URL}/api/surveys/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete survey");
      }

      await loadSurveys();
      toast({
        title: "Success",
        description: "Survey deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete survey",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading surveys...</p>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive py-8">{error}</p>
          <Button onClick={loadSurveys} className="mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {stats.totalResponses}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total Responses
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getColorByRating(stats.avgOverall ?? 0)}`}>
                {stats.avgOverall?.toFixed(2) ?? "0.00"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Overall Average
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Breakdown */}
      {stats.totalResponses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.map((q) => {
              const avg = (stats[q.key as keyof SurveyStats] as number) ?? 0;
              const percentage = (avg / 3) * 100;
              return (
                <div key={q.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-sm">{q.label}</label>
                    <span className={`font-bold ${getColorByRating(avg)}`}>
                      {avg?.toFixed(2) ?? "0.00"} / 3.0
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(avg)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Survey Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No survey responses yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-center py-3 px-4 font-semibold">Q1</th>
                    <th className="text-center py-3 px-4 font-semibold">Q2</th>
                    <th className="text-center py-3 px-4 font-semibold">Q3</th>
                    <th className="text-center py-3 px-4 font-semibold">Q4</th>
                    <th className="text-center py-3 px-4 font-semibold">Q5</th>
                    <th className="text-center py-3 px-4 font-semibold">Wait</th>
                    <th className="text-left py-3 px-4 font-semibold">Notes</th>
                    <th className="text-center py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-center py-3 px-4">{survey.q1}</td>
                      <td className="text-center py-3 px-4">{survey.q2}</td>
                      <td className="text-center py-3 px-4">{survey.q3}</td>
                      <td className="text-center py-3 px-4">{survey.q4}</td>
                      <td className="text-center py-3 px-4">{survey.q5}</td>
                      <td className="text-center py-3 px-4">{survey.waitingTime || "-"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={survey.suggestions}>
                        {survey.suggestions ? survey.suggestions.substring(0, 30) + (survey.suggestions.length > 30 ? "..." : "") : "-"}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(survey.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
