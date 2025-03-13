"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Send, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export interface JobDetails {
  title: string;
  company: string;
  linkedinUrl: string;
  requiredSkills: string;
  experienceLevel: string;
  responsibilities: string;
  industry: string;
}

export default function JobDetailsForm({ onSubmit, isLoading }: { 
  onSubmit: (details: JobDetails) => void;
  isLoading?: boolean;
}) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isExtractingData, setIsExtractingData] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: "",
    company: "",
    linkedinUrl: "",
    requiredSkills: "",
    experienceLevel: "",
    responsibilities: "",
    industry: "",
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkedinUrl(e.target.value);
    setExtractionError(null); // Limpiar error al cambiar la URL
  };

  const extractJobData = async () => {
    if (!linkedinUrl) {
      toast.error("Por favor, ingresa una URL de LinkedIn");
      return;
    }

    if (!linkedinUrl.includes("linkedin.com") || !linkedinUrl.includes("/jobs/")) {
      toast.error("La URL debe ser una oferta de trabajo válida de LinkedIn");
      return;
    }

    // Limpiar error anterior
    setExtractionError(null);
    
    try {
      setIsExtractingData(true);
      toast.info("Extrayendo datos de LinkedIn, este proceso puede tomar hasta 2 minutos...");
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: linkedinUrl }),
      });

      const data = await response.json();
      console.log("Respuesta completa de la API:", data);

      // Actualizar la URL en el estado independientemente del resultado
      setJobDetails(prev => ({...prev, linkedinUrl}));

      // Verificar si hubo algún error en la respuesta
      if (!data.success) {
        throw new Error(data.message || "Error al procesar la solicitud");
      }

      // Comprobar si hay datos en la respuesta
      if (!data.data || data.data.length === 0) {
        throw new Error("No se encontraron datos para la oferta de trabajo");
      }

      // Verificar si hubo errores en el guardado de datos
      const hasErrors = data.data.some((item: any) => item && item.success === false);
      if (hasErrors) {
        console.warn("Se encontraron errores al guardar los datos:", data.data);
        setExtractionError("Se extrajeron datos parciales. Algunos campos pueden no estar disponibles.");
      }

      // Determinar dónde están los datos de trabajo en la respuesta
      let jobData: any = null;
      
      // Primero revisar si hay datos crudos disponibles (respaldo)
      if (data.rawData) {
        console.log("Usando datos crudos como respaldo:", data.rawData);
        jobData = data.rawData;
      }
      // Si no hay datos crudos, buscar en la estructura normal
      else {
        // Navegar por la estructura de datos para encontrar la información relevante
        if (data.data[0] && data.data[0].data) {
          jobData = data.data[0].data;
        } else if (data.data[0] && data.data[0].success !== false) {
          jobData = data.data[0];
        } else {
          jobData = data.data;
        }
      }

      if (!jobData || (typeof jobData === 'object' && Object.keys(jobData).length === 0)) {
        throw new Error("No se pudieron obtener datos suficientes de la oferta de trabajo");
      }

      console.log("Datos obtenidos de LinkedIn:", jobData);

      // Extraer habilidades de requisitos si está disponible
      let skills = "";
      if (jobData.job_requirements && typeof jobData.job_requirements === 'object') {
        // Intentar extraer requisitos como habilidades
        if (Array.isArray(jobData.job_requirements)) {
          skills = jobData.job_requirements.join(", ");
        } else if (jobData.job_requirements.skills) {
          skills = Array.isArray(jobData.job_requirements.skills) 
            ? jobData.job_requirements.skills.join(", ") 
            : jobData.job_requirements.skills;
        }
      }

      // Preparar la descripción/responsabilidades
      let responsibilities = jobData.job_description_formatted || jobData.job_summary || "";
      
      // Actualizar el estado con los datos obtenidos
      const updatedJobDetails = {
        title: jobData.job_title || "",
        company: jobData.company_name || "",
        linkedinUrl: linkedinUrl,
        requiredSkills: skills || (Array.isArray(jobData.job_skills) ? jobData.job_skills.join(", ") : ""),
        experienceLevel: jobData.job_seniority_level || "",
        responsibilities: responsibilities,
        industry: jobData.company_industry || (Array.isArray(jobData.job_industries) ? jobData.job_industries.join(", ") : ""),
      };
      
      setJobDetails(updatedJobDetails);
      
      if (!hasErrors) {
        toast.success("Datos de la oferta de trabajo extraídos correctamente");
      } else {
        toast.warning("Datos extraídos parcialmente");
      }
      
      // Proporcionar feedback sobre qué campos se extrajeron
      const filledFields = Object.entries(updatedJobDetails)
        .filter(([key, value]) => value && key !== 'linkedinUrl')
        .map(([key]) => key);
        
      if (filledFields.length > 0) {
        console.log(`Campos extraídos: ${filledFields.join(', ')}`);
      }
    } catch (error) {
      console.error("Error al extraer datos:", error);
      
      // Mantener la URL ingresada incluso si hay un error
      setJobDetails(prev => ({...prev, linkedinUrl}));
      
      // Guardar el mensaje de error para mostrarlo en la UI
      setExtractionError(error instanceof Error ? error.message : "Error al extraer los datos");
      
      toast.error(error instanceof Error ? error.message : "Error al extraer los datos");
    } finally {
      setIsExtractingData(false);
    }
  };

  // Manejador para el botón "Analizar CV"
  const handleAnalyze = () => {
    // Solo enviar los datos cuando el usuario haga clic explícitamente en este botón
    if (jobDetails.linkedinUrl) {
      onSubmit(jobDetails);
    } else {
      // Si no se ha extraído datos de LinkedIn pero hay una URL, usar esa
      if (linkedinUrl) {
        const updatedDetails = {
          ...jobDetails,
          linkedinUrl: linkedinUrl
        };
        setJobDetails(updatedDetails);
        onSubmit(updatedDetails);
      } else {
        onSubmit(jobDetails);
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">URL de LinkedIn de la Oferta de Trabajo</Label>
          <div className="flex space-x-2">
            <Input
              id="linkedinUrl"
              placeholder="https://www.linkedin.com/jobs/view/123456789"
              value={linkedinUrl}
              onChange={handleUrlChange}
              disabled={isExtractingData}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={extractJobData} 
              disabled={isExtractingData || !linkedinUrl}
              variant="secondary"
            >
              {isExtractingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Extraer datos
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ingresa la URL de una oferta de trabajo de LinkedIn para extraer automáticamente sus detalles
          </p>
        </div>
      </div>

      {extractionError && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 text-sm">Advertencia</h4>
              <p className="text-yellow-700 text-sm mt-1">{extractionError}</p>
              <p className="text-yellow-700 text-xs mt-2">
                Puedes continuar con el análisis, pero los resultados pueden no ser tan precisos.
              </p>
            </div>
          </div>
        </div>
      )}

      {jobDetails.title && (
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Datos extraídos:</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Título:</strong> {jobDetails.title}</li>
            <li><strong>Empresa:</strong> {jobDetails.company}</li>
            {jobDetails.industry && <li><strong>Industria:</strong> {jobDetails.industry}</li>}
            {jobDetails.experienceLevel && <li><strong>Nivel:</strong> {jobDetails.experienceLevel}</li>}
            {jobDetails.responsibilities && (
              <li><strong>Descripción:</strong> {jobDetails.responsibilities.length > 100 
                ? `${jobDetails.responsibilities.substring(0, 100)}...` 
                : jobDetails.responsibilities}</li>
            )}
          </ul>
        </div>
      )}

      <Button 
        type="button" 
        onClick={handleAnalyze}
        className="w-full" 
        size="lg" 
        disabled={isLoading || isExtractingData}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Analizar CV
          </>
        )}
      </Button>
    </form>
  );
} 