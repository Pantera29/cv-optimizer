import { NextResponse } from "next/server";
import OpenAI from "openai";

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

Detalles del Trabajo:
- Título: ${jobDetails.title || "No especificado"}
- Empresa: ${jobDetails.company || "No especificada"}
- URL de LinkedIn: ${jobDetails.linkedinUrl || "No especificada"}
- Habilidades Requeridas: ${jobDetails.requiredSkills || "No especificadas"}
- Nivel de Experiencia: ${jobDetails.experienceLevel || "No especificado"}
- Responsabilidades: ${jobDetails.responsibilities || "No especificadas"}
- Sector/Industria: ${jobDetails.industry || "No especificado"}

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

    return NextResponse.json(recommendations);
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