"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Send, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import Cookies from "js-cookie";

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
  const { user, session } = useAuth(); // Obtener la sesión para el token
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

  // Función auxiliar para obtener el token de autenticación
  const getAuthToken = () => {
    // Primero intentar obtener el token de la sesión
    if (session?.access_token) {
      return session.access_token;
    }
    
    // Como respaldo, intentar obtener la cookie
    const cookieToken = Cookies.get('auth_token');
    if (cookieToken) {
      return cookieToken;
    }

    // Si no se encuentra el token, retornar null
    return null;
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

    if (!user) {
      toast.error("Debes iniciar sesión para extraer datos de trabajos");
      setExtractionError("No estás autenticado. Por favor, inicia sesión para continuar.");
      return;
    }

    // Obtener el token de autenticación
    const token = getAuthToken();
    
    if (!token) {
      console.error("No se pudo obtener el token de autenticación");
      toast.error("Error de autenticación. Por favor, vuelve a iniciar sesión.");
      setExtractionError("No se pudo obtener el token de autorización. Por favor, vuelve a iniciar sesión.");
      return;
    }

    // Limpiar error anterior
    setExtractionError(null);
    
    // Actualizar de inmediato el estado con al menos la URL
    setJobDetails(prev => ({
      ...prev, 
      linkedinUrl,
      // Datos mínimos para mostrar mientras se carga
      title: prev.title || "Cargando...",
      company: prev.company || "Obteniendo datos...",
    }));
    
    try {
      setIsExtractingData(true);
      toast.info("Extrayendo datos de LinkedIn, este proceso puede tomar hasta 2 minutos...");
      
      console.log("Enviando solicitud a /api/jobs con token");
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Añadir el token de autorización
        },
        body: JSON.stringify({ url: linkedinUrl }),
        credentials: 'include', // Incluir cookies en la solicitud
      });

      const data = await response.json();
      console.log("Respuesta completa de la API:", data);

      // Actualizar la URL en el estado independientemente del resultado
      setJobDetails(prev => ({...prev, linkedinUrl}));

      // Verificar si hubo algún error en la respuesta
      if (!data.success) {
        throw new Error(data.message || "Error al procesar la solicitud");
      }

      // Verificar si hay datos en la respuesta
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
      
      console.log("Estructura completa de data:", JSON.stringify(data, null, 2));
      
      try {
        // Acceso directo a la estructura anidada que vemos en la respuesta
        if (data.data && data.data[0] && data.data[0].data) {
          // Estructura: data.data[0].data - esta es la estructura que vemos en la captura
          jobData = data.data[0].data;
          console.log("Acceso directo a data.data[0].data:", jobData);
        } 
        // Intentos alternativos si la estructura es diferente
        else if (data.data && data.data[0]) {
          jobData = data.data[0];
        } else if (data.jobData) {
          jobData = data.jobData;
        } else if (data.data) {
          jobData = data.data;
        }
        
        // Validación básica: asegurarnos de tener al menos el título
        if (jobData && !jobData.job_title && jobData.data && jobData.data.job_title) {
          jobData = jobData.data;
        }
        
        // Si aún no tenemos datos, buscar recursivamente
        if (!jobData || !jobData.job_title) {
          console.log("Buscando datos en cualquier nivel de la respuesta");
          jobData = buscarDatosRecursivamente(data);
        }
        
        console.log("Datos finales encontrados:", jobData);
        
        // Actualizar el estado con datos mínimos garantizados
        const updatedJobDetails = {
          title: jobData?.job_title || "No disponible",
          company: jobData?.company_name || "No disponible",
          linkedinUrl: linkedinUrl,
          requiredSkills: "",
          experienceLevel: jobData?.job_seniority_level || "",
          responsibilities: jobData?.job_description_formatted || "",
          industry: jobData?.company_industry || "",
        };
        
        console.log("Actualizando jobDetails con:", updatedJobDetails);
        setJobDetails(updatedJobDetails);
        
        toast.success("Información extraída correctamente");
      } catch (processingError) {
        console.error("Error al procesar datos:", processingError);
        // Mantener datos básicos en caso de error de procesamiento
        setJobDetails({
          title: "No disponible (Error de procesamiento)",
          company: "No disponible",
          linkedinUrl: linkedinUrl,
          requiredSkills: "",
          experienceLevel: "",
          responsibilities: "",
          industry: "",
        });
        setExtractionError("Error al procesar los datos recibidos. Intenta de nuevo.");
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

  // Función para buscar datos de trabajo recursivamente en un objeto
  const buscarDatosRecursivamente = (obj: any, depth = 0): any => {
    // Limitar la profundidad de búsqueda para evitar bucles infinitos
    if (depth > 5) return null;
    
    // Caso base: si es null o no es un objeto
    if (!obj || typeof obj !== 'object') return null;
    
    // Verificar si este objeto tiene propiedades de trabajo
    if (obj.job_title || obj.company_name) {
      return obj;
    }
    
    // Si es un array, buscar en cada elemento
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = buscarDatosRecursivamente(item, depth + 1);
        if (result) return result;
      }
    } else {
      // Si es un objeto, buscar en cada propiedad
      for (const key in obj) {
        const result = buscarDatosRecursivamente(obj[key], depth + 1);
        if (result) return result;
      }
    }
    
    return null;
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

      {/* Estado de carga */}
      {isExtractingData && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm flex items-center">
                Extrayendo datos de LinkedIn
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                Esto puede tomar hasta 2 minutos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen simplificado - Solo muestra lo esencial */}
      {linkedinUrl && !isExtractingData && !extractionError && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-green-800 text-sm flex items-center">
                Resumen de la oferta de trabajo
              </h4>
              
              {jobDetails.title ? (
                <div className="mt-2">
                  <p className="text-green-900 font-medium">{jobDetails.title}</p>
                  {jobDetails.company && (
                    <p className="text-green-700 text-sm">{jobDetails.company}</p>
                  )}
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center text-xs mt-2"
                  >
                    <Link className="h-3 w-3 mr-1" />
                    Ver oferta completa en LinkedIn
                  </a>
                </div>
              ) : (
                <p className="text-green-700 text-sm mt-1">
                  URL de LinkedIn registrada correctamente
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!linkedinUrl && !isExtractingData && !extractionError && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm text-muted-foreground text-center">
            Ingresa una URL de LinkedIn y haz clic en "Extraer datos" para cargar información de la oferta de trabajo
          </p>
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