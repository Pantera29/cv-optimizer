"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const [cvText, setCvText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  type JobDetails = {
    title: string;
    description: string;
  };

  const handleTextExtracted = (text: string) => {
    setCvText(text);
    toast.success("Texto extraído con éxito");
  };

  const handleJobDetailsSubmit = async (jobDetails: JobDetails) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/generate-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText,
          jobTitle: jobDetails.title,
          jobDescription: jobDetails.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar recomendaciones");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar recomendaciones. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCvText("");
    setRecommendations([]);
  };

  return (
    <div className="py-10">
      <div className="container">
        <h1 className="text-2xl font-bold mb-6">CV Preview</h1>
        
        <div className="space-y-6">
          {/* Input section */}
          <div className="grid gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Introducir detalles del trabajo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título del trabajo</label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ej: Desarrollador Frontend"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción del trabajo</label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full p-2 border rounded h-32"
                    placeholder="Pega aquí la descripción del trabajo..."
                  />
                </div>
                <Button
                  onClick={() => handleJobDetailsSubmit({ title: jobTitle, description: jobDescription })}
                  disabled={!cvText || !jobTitle || !jobDescription || isAnalyzing}
                  className={cn(
                    "w-full",
                    isAnalyzing && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isAnalyzing ? "Analizando..." : "Analizar CV"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results section */}
          {recommendations.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Recomendaciones</h2>
              <ul className="space-y-3 list-disc pl-5">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button onClick={handleReset} variant="outline">
                  Reiniciar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 