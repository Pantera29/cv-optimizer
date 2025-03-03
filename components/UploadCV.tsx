"use client";

import { useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UploadCV({ onTextExtracted }: { onTextExtracted: (text: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let selectedFile: File | null = null;

    if ('dataTransfer' in event) {
      // Manejo de arrastrar y soltar
      selectedFile = event.dataTransfer?.files[0] || null;
    } else if ('target' in event) {
      // Manejo de selección de archivo
      selectedFile = event.target.files?.[0] || null;
    }

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 5MB");
      return;
    }

    setFile(selectedFile);
    await extractTextFromPDF(selectedFile);
  };

  const extractTextFromPDF = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al extraer el texto");
      }

      const { text } = await response.json();
      setExtractedText(text);
      onTextExtracted(text);
      toast.success("Texto extraído correctamente");
    } catch (error) {
      toast.error("Error al procesar el PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          "group"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileChange(e);
        }}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="p-8 text-center">
          <FileUp className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4 group-hover:text-primary/50 transition-colors" />
          {file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-medium text-primary">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFile(null);
                    setExtractedText("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Haz clic para cambiar el archivo
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground">
                Arrastra tu CV aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground/75">
                PDF (máx. 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Procesando PDF...</span>
        </div>
      )}

      {extractedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Texto Extraído</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setExtractedText("")}
            >
              Limpiar
            </Button>
          </div>
          <div className="relative">
            <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/50 p-3 text-sm">
              {extractedText}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
} 