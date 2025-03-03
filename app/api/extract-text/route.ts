import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se ha proporcionado ningún archivo" },
        { status: 400 }
      );
    }

    // Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // Extraer texto del PDF
      const text = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          try {
            const text = pdfData.Pages
              .map(page => 
                page.Texts
                  .map(text => decodeURIComponent(text.R[0].T))
                  .join(" ")
              )
              .join("\n");
            resolve(text);
          } catch (error) {
            reject(new Error("Error al procesar el contenido del PDF"));
          }
        });

        pdfParser.on("pdfParser_dataError", (error) => {
          reject(new Error(`Error al parsear el PDF: ${error}`));
        });

        pdfParser.parseBuffer(buffer);
      });

      return NextResponse.json({ text });
    } catch (pdfError: any) {
      console.error("Error específico al procesar PDF:", pdfError);
      return NextResponse.json(
        { error: `Error al procesar el PDF: ${pdfError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error general:", error);
    return NextResponse.json(
      { error: `Error en el servidor: ${error.message}` },
      { status: 500 }
    );
  }
} 