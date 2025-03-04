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
import { CircleDashed, CheckCircle2, RotateCcw, Gem, Lightbulb, FileText, Target, BarChart4, Search, ScrollText, ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos para cada categoría de recomendación
export interface HabilidadTecnica {
  tipo: "coincidencia" | "parcial" | "ausente" | "mejora" | "adicional";
  contenido: string;
}

export interface HabilidadBlanda {
  tipo: "coincidencia" | "ausente" | "mejora";
  contenido: string;
}

export interface ExperienciaProfesional {
  tipo: "fortaleza" | "debilidad" | "mejora" | "cuantificacion";
  contenido: string;
}

export interface EstructuraFormateo {
  tipo: "fortaleza" | "debilidad" | "mejora";
  contenido: string;
}

export interface OptimizacionPalabrasClave {
  tipo: string;
  palabrasClave?: string[];
  contenido: string;
}

export interface SeccionRecomendada {
  tipo: "adicionar" | "mejorar";
  seccion: string;
  contenido: string;
}

export interface ModificacionPrioritaria {
  prioridad: number;
  categoria: string;
  accion: string;
}

// Estructura completa de respuesta
export interface RecommendationsState {
  puntuacionGeneral?: {
    score: number;
    explicacion: string;
  };
  compatibilidadATS?: {
    score: number;
    explicacion: string;
  };
  habilidadesTecnicas?: HabilidadTecnica[];
  habilidadesBlandas?: HabilidadBlanda[];
  experienciaProfesional?: ExperienciaProfesional[];
  estructuraYFormateo?: EstructuraFormateo[];
  optimizacionDePalabrasClave?: OptimizacionPalabrasClave[];
  seccionesRecomendadas?: SeccionRecomendada[];
  modificacionesPrioritarias?: ModificacionPrioritaria[];
  resumenEjecutivo?: {
    fortalezasPrincipales: string[];
    brechasCriticas: string[];
    potencialDeAjuste: string;
  };
  // Mantener para compatibilidad con versiones anteriores
  skills?: any[];
  experience?: any[];
  structure?: any[];
  keywords?: any[];
}

// Etiquetas para cada categoría
const CATEGORY_LABELS = {
  puntuacionGeneral: "Puntuación General",
  compatibilidadATS: "Compatibilidad ATS",
  habilidadesTecnicas: "Habilidades Técnicas",
  habilidadesBlandas: "Habilidades Blandas",
  experienciaProfesional: "Experiencia Profesional",
  estructuraYFormateo: "Estructura y Formato",
  optimizacionDePalabrasClave: "Palabras Clave",
  seccionesRecomendadas: "Secciones Recomendadas",
  modificacionesPrioritarias: "Acciones Prioritarias",
  resumenEjecutivo: "Resumen Ejecutivo"
};

// Iconos para cada categoría
const CATEGORY_ICONS = {
  puntuacionGeneral: BarChart4,
  compatibilidadATS: Target,
  habilidadesTecnicas: Gem,
  habilidadesBlandas: Lightbulb,
  experienciaProfesional: FileText,
  estructuraYFormateo: ScrollText,
  optimizacionDePalabrasClave: Search,
  seccionesRecomendadas: ListChecks,
  modificacionesPrioritarias: CheckCircle2,
  resumenEjecutivo: CheckCircle2
};

// Colores para los tipos de recomendaciones (con index signature para evitar el error)
const TYPE_COLORS: { [key: string]: string } = {
  coincidencia: "bg-green-50 text-green-700 border-green-200",
  fortaleza: "bg-green-50 text-green-700 border-green-200",
  positivo: "bg-green-50 text-green-700 border-green-200",
  presentes: "bg-green-50 text-green-700 border-green-200",
  parcial: "bg-amber-50 text-amber-700 border-amber-200",
  mejora: "bg-amber-50 text-amber-700 border-amber-200",
  mejorar: "bg-amber-50 text-amber-700 border-amber-200",
  cuantificacion: "bg-amber-50 text-amber-700 border-amber-200",
  ausente: "bg-red-50 text-red-700 border-red-200",
  faltantes: "bg-red-50 text-red-700 border-red-200",
  debilidad: "bg-red-50 text-red-700 border-red-200",
  adicional: "bg-blue-50 text-blue-700 border-blue-200",
  adicionar: "bg-blue-50 text-blue-700 border-blue-200"
};

// Funcion helper para obtener el icono según el tipo
const getIconForType = (tipo: string) => {
  switch (tipo) {
    case 'coincidencia':
    case 'fortaleza':
    case 'positivo':
    case 'presentes':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'parcial':
    case 'mejora':
    case 'mejorar':
    case 'cuantificacion':
      return <AlertCircle className="h-4 w-4" />;
    case 'ausente':
    case 'faltantes':
    case 'debilidad':
      return <AlertCircle className="h-4 w-4" />;
    case 'adicional':
    case 'adicionar':
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <div className="h-4 w-4" />;
  }
};

// Función para determinar el color según el puntaje
const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600 dark:text-green-500";
  if (score >= 75) return "text-blue-600 dark:text-blue-500";
  if (score >= 60) return "text-amber-600 dark:text-amber-500";
  if (score >= 40) return "text-orange-600 dark:text-orange-500";
  return "text-red-600 dark:text-red-500";
};

// Función para determinar el color de fondo según el puntaje
const getScoreBackgroundColor = (score: number): string => {
  if (score >= 90) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 75) return "bg-blue-50 dark:bg-blue-950/30";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-950/30";
  if (score >= 40) return "bg-orange-50 dark:bg-orange-950/30";
  return "bg-red-50 dark:bg-red-950/30";
};

// Función para determinar la etiqueta según el puntaje
const getScoreLabel = (score: number): string => {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Bueno";
  if (score >= 60) return "Aceptable";
  if (score >= 40) return "Mejorable";
  return "Deficiente";
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
  // Renderizar secciones de puntuación
  const renderScoreSection = () => {
    if (!recommendations.puntuacionGeneral && !recommendations.compatibilidadATS) return null;
    
    return (
      <div className="space-y-4 mb-6">
        {recommendations.puntuacionGeneral && (
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  <h3 className="font-medium">Puntuación General</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBackgroundColor(recommendations.puntuacionGeneral.score)}`}>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {getScoreLabel(recommendations.puntuacionGeneral.score)}
                  </span>
                  <div className="flex items-baseline">
                    <span className={`text-xl font-bold ${getScoreColor(recommendations.puntuacionGeneral.score)}`}>
                      {recommendations.puntuacionGeneral.score}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-0.5">/100</span>
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso para visualizar la puntuación */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div 
                  className={`h-full ${getScoreColor(recommendations.puntuacionGeneral.score)} transition-all duration-500 ease-in-out`} 
                  style={{ width: `${recommendations.puntuacionGeneral.score}%` }}
                ></div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">{recommendations.puntuacionGeneral.explicacion}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {recommendations.compatibilidadATS && (
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  <h3 className="font-medium">Compatibilidad ATS</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBackgroundColor(recommendations.compatibilidadATS.score)}`}>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {getScoreLabel(recommendations.compatibilidadATS.score)}
                  </span>
                  <div className="flex items-baseline">
                    <span className={`text-xl font-bold ${getScoreColor(recommendations.compatibilidadATS.score)}`}>
                      {recommendations.compatibilidadATS.score}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-0.5">/100</span>
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso para visualizar la puntuación */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div 
                  className={`h-full ${getScoreColor(recommendations.compatibilidadATS.score)} transition-all duration-500 ease-in-out`} 
                  style={{ width: `${recommendations.compatibilidadATS.score}%` }}
                ></div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">{recommendations.compatibilidadATS.explicacion}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Renderizar el resumen ejecutivo
  const renderExecutiveSummary = () => {
    if (!recommendations.resumenEjecutivo) return null;
    
    const { fortalezasPrincipales, brechasCriticas, potencialDeAjuste } = recommendations.resumenEjecutivo;
    
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-slate-700" />
            Resumen Ejecutivo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2 text-green-700">
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Fortalezas</Badge>
              </h4>
              <ul className="space-y-2">
                {fortalezasPrincipales.map((fortaleza, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <div className="h-5 min-w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span>{fortaleza}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2 text-amber-700">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Brechas Críticas</Badge>
              </h4>
              <ul className="space-y-2">
                {brechasCriticas.map((brecha, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <div className="h-5 min-w-5 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span>{brecha}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-5 pt-5 border-t">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Badge variant="outline">Potencial de Ajuste</Badge>
            </h4>
            <p className="text-sm">{potencialDeAjuste}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar modificaciones prioritarias
  const renderPriorityActions = () => {
    if (!recommendations.modificacionesPrioritarias?.length) return null;
    
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-slate-700" />
            Acciones Prioritarias
          </h3>
          <ol className="space-y-4">
            {recommendations.modificacionesPrioritarias.map((accion, index) => (
              <li key={index} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="h-7 min-w-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-sm font-medium">{accion.prioridad}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{accion.categoria}</p>
                  <p className="text-sm text-slate-600 mt-1">{accion.accion}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    );
  };

  // Renderizar habilidades técnicas
  const renderTechnicalSkills = () => {
    if (!recommendations.habilidadesTecnicas?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Habilidades Técnicas</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.habilidadesTecnicas.map((skill, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[skill.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[skill.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(skill.tipo)}
                        <span className="capitalize">{skill.tipo}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{skill.contenido}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar habilidades blandas
  const renderSoftSkills = () => {
    if (!recommendations.habilidadesBlandas?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Habilidades Blandas</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.habilidadesBlandas.map((skill, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[skill.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[skill.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(skill.tipo)}
                        <span className="capitalize">{skill.tipo}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{skill.contenido}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar experiencia profesional
  const renderExperience = () => {
    if (!recommendations.experienciaProfesional?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Experiencia Profesional</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.experienciaProfesional.map((exp, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[exp.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[exp.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(exp.tipo)}
                        <span className="capitalize">{exp.tipo}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{exp.contenido}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar estructura y formateo
  const renderStructure = () => {
    if (!recommendations.estructuraYFormateo?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Estructura y Formato</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.estructuraYFormateo.map((item, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[item.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[item.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(item.tipo)}
                        <span className="capitalize">{item.tipo}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{item.contenido}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar palabras clave
  const renderKeywords = () => {
    if (!recommendations.optimizacionDePalabrasClave?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Palabras Clave</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.optimizacionDePalabrasClave.map((keyword, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[keyword.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[keyword.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(keyword.tipo)}
                        <span className="capitalize">{keyword.tipo}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{keyword.contenido}</p>
                  
                  {keyword.palabrasClave && keyword.palabrasClave.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keyword.palabrasClave.map((palabra, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-50 text-slate-700">{palabra}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar secciones recomendadas
  const renderRecommendedSections = () => {
    if (!recommendations.seccionesRecomendadas?.length) return null;
    
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-slate-700" />
          <h3 className="font-medium">Secciones Recomendadas</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.seccionesRecomendadas.map((seccion, index) => (
            <Card key={index} className={`border-l-4 ${TYPE_COLORS[seccion.tipo]?.split(' ')[2] || 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[seccion.tipo] || 'bg-gray-100'}>
                      <span className="flex items-center gap-1.5">
                        {getIconForType(seccion.tipo)}
                        <span className="capitalize">{seccion.tipo}</span>
                      </span>
                    </Badge>
                    <span className="font-medium text-sm">{seccion.seccion}</span>
                  </div>
                  <p className="text-sm mt-2">{seccion.contenido}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Compatibilidad con la versión anterior
  const renderLegacyRecommendations = (category: 'skills' | 'experience' | 'structure' | 'keywords') => {
    const data = recommendations[category];
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const oldCategoryLabels = {
      skills: "Habilidades",
      experience: "Experiencia",
      structure: "Estructura",
      keywords: "Palabras Clave"
    };
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium">{oldCategoryLabels[category]}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Badge 
                    className={item.type === "positive" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                  >
                    {item.type === "positive" ? "Positivo" : "Mejora"}
                  </Badge>
                  <p className="text-sm">{item.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Verifica si tenemos las nuevas categorías de recomendaciones
  const hasNewRecommendations = 
    recommendations.puntuacionGeneral || 
    recommendations.compatibilidadATS || 
    (recommendations.habilidadesTecnicas && recommendations.habilidadesTecnicas.length > 0) || 
    (recommendations.habilidadesBlandas && recommendations.habilidadesBlandas.length > 0) || 
    (recommendations.experienciaProfesional && recommendations.experienciaProfesional.length > 0) || 
    (recommendations.estructuraYFormateo && recommendations.estructuraYFormateo.length > 0) || 
    (recommendations.optimizacionDePalabrasClave && recommendations.optimizacionDePalabrasClave.length > 0) || 
    (recommendations.seccionesRecomendadas && recommendations.seccionesRecomendadas.length > 0) || 
    (recommendations.modificacionesPrioritarias && recommendations.modificacionesPrioritarias.length > 0) || 
    recommendations.resumenEjecutivo;

  // Verifica si tenemos recomendaciones en el formato antiguo
  const hasLegacyRecommendations = 
    (recommendations.skills && recommendations.skills.length > 0) || 
    (recommendations.experience && recommendations.experience.length > 0) || 
    (recommendations.structure && recommendations.structure.length > 0) || 
    (recommendations.keywords && recommendations.keywords.length > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="relative h-16 w-16">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold">Analizando tu CV...</h3>
        <p className="text-center text-muted-foreground max-w-md">
          Estamos evaluando tu currículum y generando recomendaciones personalizadas para mejorar tus posibilidades de éxito.
        </p>
        <div className="flex flex-col items-center mt-4 space-y-2 w-64">
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-muted-foreground">Esto puede tardar unos momentos</p>
        </div>
      </div>
    );
  }

  if (!hasNewRecommendations && !hasLegacyRecommendations) {
    return (
      <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay recomendaciones</h3>
        <p className="text-center text-muted-foreground mb-6">
          Sube tu CV y proporciona detalles del trabajo para obtener recomendaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recomendaciones</h2>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>

      {hasNewRecommendations ? (
        <>
          {renderScoreSection()}
          {renderExecutiveSummary()}
          {renderPriorityActions()}
          
          <Tabs defaultValue="habilidades" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              <TabsTrigger value="habilidades" className="flex items-center gap-1">
                <Gem className="h-4 w-4" />
                <span>Habilidades</span>
              </TabsTrigger>
              <TabsTrigger value="experiencia" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Experiencia</span>
              </TabsTrigger>
              <TabsTrigger value="estructura" className="flex items-center gap-1">
                <ScrollText className="h-4 w-4" />
                <span>Estructura</span>
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                <span>Palabras Clave</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="habilidades" className="space-y-6 pt-4">
              {renderTechnicalSkills()}
              {renderSoftSkills()}
            </TabsContent>
            
            <TabsContent value="experiencia" className="space-y-6 pt-4">
              {renderExperience()}
            </TabsContent>
            
            <TabsContent value="estructura" className="space-y-6 pt-4">
              {renderStructure()}
              {renderRecommendedSections()}
            </TabsContent>
            
            <TabsContent value="keywords" className="space-y-6 pt-4">
              {renderKeywords()}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="space-y-6">
          {renderLegacyRecommendations('skills')}
          {renderLegacyRecommendations('experience')}
          {renderLegacyRecommendations('structure')}
          {renderLegacyRecommendations('keywords')}
        </div>
      )}
    </div>
  );
} 