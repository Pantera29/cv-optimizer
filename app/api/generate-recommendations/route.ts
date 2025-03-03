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
            "Eres un experto en recursos humanos y optimización de CVs. Analiza CVs y proporciona recomendaciones específicas y accionables en formato JSON. Asegúrate de que la respuesta sea un objeto JSON válido con las categorías especificadas.",
        },
        {
          role: "user",
          content: `Por favor, analiza el siguiente CV y proporciona recomendaciones detalladas en formato JSON para optimizarlo según los requisitos del trabajo:

CV:
${cvText}

Detalles del Trabajo:
- URL de LinkedIn: ${jobDetails.linkedinUrl}
- Habilidades Requeridas: ${jobDetails.requiredSkills}
- Nivel de Experiencia: ${jobDetails.experienceLevel}
- Responsabilidades: ${jobDetails.responsibilities}

Proporciona recomendaciones específicas en las siguientes categorías y devuelve la respuesta en este formato JSON exacto:
{
  "skills": [
    {"type": "positive", "content": "punto positivo sobre habilidades"},
    {"type": "improvement", "content": "sugerencia de mejora sobre habilidades"}
  ],
  "experience": [
    {"type": "positive", "content": "punto positivo sobre experiencia"},
    {"type": "improvement", "content": "sugerencia de mejora sobre experiencia"}
  ],
  "structure": [
    {"type": "positive", "content": "punto positivo sobre estructura"},
    {"type": "improvement", "content": "sugerencia de mejora sobre estructura"}
  ],
  "keywords": [
    {"type": "positive", "content": "punto positivo sobre palabras clave"},
    {"type": "improvement", "content": "sugerencia de mejora sobre palabras clave"}
  ]
}`
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
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