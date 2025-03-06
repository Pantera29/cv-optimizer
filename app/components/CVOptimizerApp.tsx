"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import UploadCV from "@/components/UploadCV";
import JobDetailsForm from "@/components/JobDetailsForm";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import type { JobDetails } from "@/components/JobDetailsForm";
import type { RecommendationsState } from "@/components/RecommendationsPanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CVOptimizerApp() {
  const [cvText, setCvText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsState>({
    skills: [],
    experience: [],
    structure: [],
    keywords: [],
  });

  const handleTextExtracted = (text: string) => {
    setCvText(text);
  };

  const handleJobDetailsSubmit = async (jobDetails: JobDetails) => {
    if (!cvText) {
      toast.error("Por favor, sube un CV primero");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/generate-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText,
          jobDetails,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error al generar recomendaciones:", error);
      toast.error("Error al analizar el CV. Por favor, inténtalo de nuevo");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCvText("");
    setRecommendations({
      skills: [],
      experience: [],
      structure: [],
      keywords: [],
    });
  };

  const showRecommendations =
    Array.isArray(recommendations.skills) && recommendations.skills.length > 0 ||
    Array.isArray(recommendations.experience) && recommendations.experience.length > 0 ||
    Array.isArray(recommendations.structure) && recommendations.structure.length > 0 ||
    Array.isArray(recommendations.keywords) && recommendations.keywords.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <Link 
            href="/" 
            className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la página principal
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl mb-6 text-center">
            Optimizador de CV con IA
          </h1>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10">
            Mejora tu currículum para destacar en el mercado laboral utilizando inteligencia artificial
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sube tu CV</CardTitle>
                  <CardDescription>
                    Sube tu CV en formato PDF para comenzar el análisis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadCV onTextExtracted={handleTextExtracted} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Trabajo</CardTitle>
                  <CardDescription>
                    Proporciona información sobre el puesto al que deseas aplicar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobDetailsForm
                    onSubmit={handleJobDetailsSubmit}
                    isLoading={isAnalyzing}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recomendaciones</CardTitle>
                  <CardDescription>
                    Análisis y sugerencias personalizadas para tu CV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!cvText ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Sube tu CV y proporciona detalles del trabajo para obtener recomendaciones.
                      </p>
                    </div>
                  ) : !showRecommendations ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No hay recomendaciones aún. Completa los detalles del trabajo para comenzar el análisis.
                      </p>
                    </div>
                  ) : (
                    <RecommendationsPanel 
                      recommendations={recommendations} 
                      isLoading={isAnalyzing}
                      onReset={handleReset}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 