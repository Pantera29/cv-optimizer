import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { cvText, jobDetails } = await request.json();

    if (!cvText || !jobDetails) {
      return NextResponse.json(
        { error: "Se requiere el texto del CV y los detalles del trabajo" },
        { status: 400 }
      );
    }

    // Obtener datos detallados de LinkedIn si hay una URL
    let linkedinData = null;
    if (jobDetails.linkedinUrl && jobDetails.linkedinUrl.includes("linkedin.com")) {
      try {
        console.log("Obteniendo datos detallados de LinkedIn para:", jobDetails.linkedinUrl);
        
        // Extraer el ID del trabajo de la URL de LinkedIn (esto podría variar según el formato de URL)
        const jobIdMatch = jobDetails.linkedinUrl.match(/\/jobs\/view\/(\d+)/);
        const jobId = jobIdMatch ? jobIdMatch[1] : null;
        
        if (jobId) {
          // Buscar datos en Supabase
          const { data, error } = await supabase
            .from("linkedin_jobs")
            .select("*")
            .eq("job_posting_id", jobId)
            .single();
            
          if (error) {
            console.error("Error al obtener datos de LinkedIn:", error);
          } else if (data) {
            console.log("Datos de LinkedIn obtenidos correctamente:", data.job_title);
            linkedinData = data;
          }
        }
      } catch (error) {
        console.error("Error al procesar datos de LinkedIn:", error);
      }
    }

    // Preparar información detallada del trabajo para el prompt
    let jobDetailsPrompt = `
Detalles del Trabajo:
- Título: ${jobDetails.title || linkedinData?.job_title || "No especificado"}
- Empresa: ${jobDetails.company || linkedinData?.company_name || "No especificada"}
- URL de LinkedIn: ${jobDetails.linkedinUrl || "No especificada"}
- Habilidades Requeridas: ${jobDetails.requiredSkills || "No especificadas"}
- Nivel de Experiencia: ${jobDetails.experienceLevel || linkedinData?.job_seniority_level || "No especificado"}
- Responsabilidades: ${jobDetails.responsibilities || "No especificadas"}
- Sector/Industria: ${jobDetails.industry || (linkedinData?.job_industries ? linkedinData.job_industries.join(", ") : linkedinData?.company_industry) || "No especificado"}`;

    // Agregar datos enriquecidos de LinkedIn si están disponibles
    if (linkedinData) {
      jobDetailsPrompt += `

Datos adicionales de LinkedIn:
- Ubicación: ${linkedinData.job_location || "No especificada"}
- Tipo de Trabajo: ${linkedinData.job_work_type || linkedinData.job_employment_type || "No especificado"}
- Rango Salarial: ${linkedinData.job_base_pay_range || (linkedinData.base_salary ? JSON.stringify(linkedinData.base_salary) : "No especificado")}
- Nivel de Antigüedad: ${linkedinData.job_seniority_level || "No especificado"}
- Función del Trabajo: ${linkedinData.job_function || "No especificada"}
- Número de Aplicantes: ${linkedinData.applicant_count || "No especificado"}`;

      // Agregar descripción del trabajo si está disponible
      if (linkedinData.job_description_formatted) {
        jobDetailsPrompt += `

Descripción Completa del Trabajo:
${linkedinData.job_description_formatted}`;
      } else if (linkedinData.job_summary) {
        jobDetailsPrompt += `

Resumen del Trabajo:
${linkedinData.job_summary}`;
      }

      // Agregar requisitos si están disponibles
      if (linkedinData.job_requirements && typeof linkedinData.job_requirements === 'object') {
        jobDetailsPrompt += `

Requisitos del Trabajo:
${JSON.stringify(linkedinData.job_requirements, null, 2)}`;
      }

      // Agregar cualificaciones si están disponibles
      if (linkedinData.job_qualifications && typeof linkedinData.job_qualifications === 'object') {
        jobDetailsPrompt += `

Cualificaciones del Trabajo:
${JSON.stringify(linkedinData.job_qualifications, null, 2)}`;
      }
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un consultor senior de selección ejecutiva con más de 15 años de experiencia en reclutamiento corporativo y optimización de currículums para empresas Fortune 500. Tu especialidad es identificar el ajuste entre candidatos y posiciones, con profundo conocimiento en sistemas ATS (Applicant Tracking Systems) y algoritmos de filtrado utilizados por empresas líderes. Debes analizar CVs con precisión profesional utilizando criterios de evaluación de la industria, proporcionando recomendaciones altamente específicas y accionables en formato JSON válido.",
        },
        {
          role: "user",
          content: `Realiza un análisis exhaustivo del siguiente CV en relación a la descripción del trabajo proporcionada. Evalúa la alineación estratégica entre ambos y proporciona recomendaciones detalladas que aumenten significativamente las probabilidades de superar los filtros ATS y captar la atención de los reclutadores:

CV:
${cvText}

${jobDetailsPrompt}

Proporciona un análisis detallado en las siguientes categorías utilizando exclusivamente este formato JSON:
{
  "puntuacionGeneral": {
    "score": 85, // Puntuación de 0 a 100 que refleja la compatibilidad general
    "explicacion": "Explicación breve de la puntuación"
  },
  "compatibilidadATS": {
    "score": 80, // Puntuación de 0 a 100 para compatibilidad con sistemas ATS
    "explicacion": "Razones por las que el CV puede ser filtrado o aprobado por ATS"
  },
  "habilidadesTecnicas": [
    {"tipo": "coincidencia", "contenido": "Habilidad técnica presente que coincide exactamente con requisitos"},
    {"tipo": "parcial", "contenido": "Habilidad relacionada pero no idéntica a lo solicitado"},
    {"tipo": "ausente", "contenido": "Habilidad clave requerida que falta en el CV"},
    {"tipo": "mejora", "contenido": "Sugerencia específica para reformular una habilidad existente"},
    {"tipo": "adicional", "contenido": "Habilidad no mencionada pero relevante para agregar"}
  ],
  "habilidadesBlandas": [
    {"tipo": "coincidencia", "contenido": "Habilidad blanda presente que coincide con requisitos"},
    {"tipo": "ausente", "contenido": "Habilidad blanda clave que falta en el CV"},
    {"tipo": "mejora", "contenido": "Sugerencia para mostrar mejor una habilidad blanda"}
  ],
  "experienciaProfesional": [
    {"tipo": "fortaleza", "contenido": "Aspecto sobresaliente de la experiencia"},
    {"tipo": "debilidad", "contenido": "Brecha o inconsistencia en la experiencia"},
    {"tipo": "mejora", "contenido": "Recomendación específica para reformular una experiencia"},
    {"tipo": "cuantificacion", "contenido": "Sugerencia para añadir métricas o resultados cuantificables"}
  ],
  "estructuraYFormateo": [
    {"tipo": "fortaleza", "contenido": "Elemento estructural bien implementado"},
    {"tipo": "debilidad", "contenido": "Problema de estructura o formato"},
    {"tipo": "mejora", "contenido": "Recomendación específica para mejorar la estructura"}
  ],
  "optimizacionDePalabrasClave": [
    {"tipo": "presentes", "palabrasClave": ["palabra1", "palabra2"], "contenido": "Palabras clave relevantes presentes"},
    {"tipo": "faltantes", "palabrasClave": ["palabra1", "palabra2"], "contenido": "Palabras clave críticas ausentes"},
    {"tipo": "mejora", "contenido": "Sugerencia para mejorar densidad o posicionamiento de palabras clave"}
  ],
  "seccionesRecomendadas": [
    {"tipo": "adicionar", "seccion": "Nombre de sección faltante", "contenido": "Justificación y contenido sugerido"},
    {"tipo": "mejorar", "seccion": "Nombre de sección existente", "contenido": "Forma específica de mejorarla"}
  ],
  "modificacionesPrioritarias": [
    {"prioridad": 1, "categoria": "Categoría afectada", "accion": "Acción específica y detallada a realizar"},
    {"prioridad": 2, "categoria": "Categoría afectada", "accion": "Acción específica y detallada a realizar"},
    {"prioridad": 3, "categoria": "Categoría afectada", "accion": "Acción específica y detallada a realizar"}
  ],
  "resumenEjecutivo": {
    "fortalezasPrincipales": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
    "brechasCriticas": ["Brecha 1", "Brecha 2"],
    "potencialDeAjuste": "Alto/Medio/Bajo con justificación breve"
  }
}`
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500,
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No se recibió respuesta del modelo");
    }

    const recommendations = JSON.parse(completion.choices[0].message.content);

    // Agregar información sobre los datos de LinkedIn utilizados
    const responseData = {
      ...recommendations,
      metadata: {
        usedLinkedinData: !!linkedinData,
        jobUrl: jobDetails.linkedinUrl || null
      }
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error al generar recomendaciones:", error);
    
    // Mensaje de error más específico
    const errorMessage = error.message || "Error al procesar la solicitud";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 