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
import { FileText, ArrowLeft } from "lucide-react";
import UploadCV from "@/components/UploadCV";
import JobDetailsForm from "@/components/JobDetailsForm";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import type { JobDetails } from "@/components/JobDetailsForm";
import type { RecommendationsState } from "@/components/RecommendationsPanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
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
        throw new Error("Error al generar recomendaciones");
      }

      const data = await response.json();
      setRecommendations(data);
      toast.success("Análisis completado");
    } catch (error) {
      console.error(error);
      toast.error("Error al analizar el CV");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setRecommendations({
      skills: [],
      experience: [],
      structure: [],
      keywords: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Optimizador de CV con IA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Mejora tu currículum para destacar en el mercado laboral utilizando inteligencia artificial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Panel Izquierdo */}
          <div className={cn("space-y-6", isAnalyzing && "opacity-70 pointer-events-none transition-opacity duration-300")}>
            <Card className="border-none shadow-lg">
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

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Detalles del Trabajo</CardTitle>
                <CardDescription>
                  Proporciona información sobre el puesto al que deseas aplicar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobDetailsForm onSubmit={handleJobDetailsSubmit} isLoading={isAnalyzing} />
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho */}
          <div className="lg:pl-6">
            <Card className="border-none shadow-lg h-full">
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
                <CardDescription>
                  Análisis y sugerencias personalizadas para tu CV
                </CardDescription>
              </CardHeader>
              <div className="h-px bg-border mb-6" />
              <CardContent>
                <RecommendationsPanel 
                  recommendations={recommendations}
                  isLoading={isAnalyzing}
                  onReset={handleReset}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Desarrollado con Next.js, Tailwind CSS y OpenAI</p>
      </footer>
    </div>
  );
} 