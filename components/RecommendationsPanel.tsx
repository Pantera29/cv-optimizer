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
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recommendation {
  category: "skills" | "experience" | "structure" | "keywords";
  type: "positive" | "improvement";
  content: string;
}

export interface RecommendationsState {
  skills: Recommendation[];
  experience: Recommendation[];
  structure: Recommendation[];
  keywords: Recommendation[];
}

const CATEGORY_LABELS = {
  skills: "Habilidades",
  experience: "Experiencia",
  structure: "Estructura",
  keywords: "Palabras Clave",
};

const CATEGORY_DESCRIPTIONS = {
  skills: "Análisis de habilidades técnicas y blandas",
  experience: "Evaluación de experiencia laboral",
  structure: "Sugerencias de formato y estructura",
  keywords: "Términos clave para mayor visibilidad",
};

export default function RecommendationsPanel({ 
  recommendations,
  isLoading,
  onReset
}: { 
  recommendations: RecommendationsState;
  isLoading: boolean;
  onReset: () => void;
}) {
  const renderRecommendationCard = (category: keyof typeof CATEGORY_LABELS) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{CATEGORY_LABELS[category]}</h3>
          <p className="text-sm text-muted-foreground">
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
        </div>
        <Badge variant={recommendations[category].length > 0 ? "default" : "secondary"}>
          {recommendations[category].length} sugerencias
        </Badge>
      </div>

      {recommendations[category].length > 0 ? (
        <div className="space-y-2">
          {recommendations[category].map((rec, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start space-x-3 rounded-lg p-3",
                rec.type === "positive"
                  ? "bg-green-100 dark:bg-green-900/30 text-gray-900 dark:text-gray-100"
                  : "bg-muted/50"
              )}
            >
              {rec.type === "positive" ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              )}
              <p className="text-sm leading-relaxed">{rec.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Analizando..."
              : "No hay recomendaciones disponibles"}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Analizando tu CV...</span>
        </div>
      )}

      {Object.keys(CATEGORY_LABELS).map((category) => (
        <div key={category} className="relative">
          {renderRecommendationCard(category as keyof typeof CATEGORY_LABELS)}
          {category !== "keywords" && (
            <div className="absolute inset-x-0 -bottom-4 h-px bg-gradient-to-r from-transparent via-muted to-transparent" />
          )}
        </div>
      ))}

      <div className="flex items-center justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
        <Button size="sm">
          <Download className="mr-2 h-4 w-4" />
          Guardar PDF
        </Button>
      </div>
    </div>
  );
} 