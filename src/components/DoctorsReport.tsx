import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { getDoctorEvaluations, getDoctorStats, doctorKeys } from "@/lib/doctorEvaluationsStore";

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

const getRatingLabel = (rating: string) => {
  const ratingMap: { [key: string]: string } = {
    poor: "Poor",
    average: "Average",
    excellent: "Excellent",
  };
  return ratingMap[rating] || rating;
};

export default function DoctorsReport() {
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<{ [key: string]: DoctorEvaluation[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvaluations = async () => {
      setLoading(true);
      const allEvals = await getDoctorEvaluations();
      const groupedByDoctor: { [key: string]: DoctorEvaluation[] } = {};

      doctorKeys.forEach((docKey) => {
        groupedByDoctor[docKey] = [];
      });

      allEvals.forEach((evaluation) => {
        if (groupedByDoctor[evaluation.docKey]) {
          groupedByDoctor[evaluation.docKey].push(evaluation);
        }
      });

      setEvaluations(groupedByDoctor);
      setLoading(false);
    };

    loadEvaluations();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading evaluations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {doctorKeys.map((docKey) => {
        const doctorEvals = evaluations[docKey] || [];
        const stats = getDoctorStats(doctorEvals);

        return (
          <Collapsible key={docKey} defaultOpen={false}>
            <Card className="border">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-none hover:bg-accent"
                  size="lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <h3 className="font-heading font-bold text-foreground">{t(`doctors.${docKey}Name`)}</h3>
                    <span className="text-sm text-muted-foreground">
                      {t("doctorsReport.totalEvaluations")}: {stats.totalEvaluations}
                    </span>
                    {stats.totalEvaluations > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {t("doctorsReport.avgSatisfaction")}: {stats.avgSatisfaction}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {doctorEvals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">{t("doctorsReport.noEvaluations")}</p>
                  ) : (
                    <div className="space-y-4 pt-4">
                      {doctorEvals.map((evaluation, index) => (
                        <Collapsible key={evaluation.id} defaultOpen={false}>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              size="sm"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="font-semibold text-sm">
                                  {index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`} {t("doctorsReport.evaluation")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(evaluation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-secondary/20">
                                {getRatingLabel(evaluation.overallSatisfaction)}
                              </span>
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="mt-3 bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Behavior</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.behavior)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Competence</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.competence)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Treatment Quality</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.treatmentQuality)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Explanation</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.explanation)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Follow Up</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.followUp)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Overall Satisfaction</p>
                                  <p className="text-foreground">{getRatingLabel(evaluation.overallSatisfaction)}</p>
                                </div>
                              </div>

                              {evaluation.comments && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Comments</p>
                                  <p className="text-foreground text-sm leading-relaxed break-words">{evaluation.comments}</p>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
