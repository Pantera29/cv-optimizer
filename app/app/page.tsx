"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import UploadCV from "@/components/UploadCV";
import JobDetailsForm from "@/components/JobDetailsForm";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import type { JobDetails } from "@/components/JobDetailsForm";
import type { RecommendationsState } from "@/components/RecommendationsPanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cvText, setCvText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsState>({
    skills: [],
    experience: [],
    structure: [],
    keywords: [],
  });

  // Si no hay usuario autenticado después de cargar, redirigir a login
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No hay usuario autenticado, redirigiendo a login...");
      window.location.href = "/login";
    } else if (user) {
      console.log("Usuario autenticado:", user.email);
    }
  }, [isLoading, user]);

  // Mientras carga, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar el contenido de la aplicación
  if (!user) {
    return null;
  }

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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">CV Optimizer</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-muted-foreground mr-4">
                {user.email}
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Panel Izquierdo */}
          <div className={cn("space-y-6", isAnalyzing && "opacity-70 pointer-events-none transition-opacity duration-300")}>
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
                <JobDetailsForm onSubmit={handleJobDetailsSubmit} isLoading={isAnalyzing} />
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho */}
          <div className="lg:pl-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
                <CardDescription>
                  Análisis y sugerencias personalizadas para tu CV
                </CardDescription>
              </CardHeader>
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
    </div>
  );
} 