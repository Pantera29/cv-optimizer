"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Briefcase, Send, Loader2 } from "lucide-react";

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
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: "",
    company: "",
    linkedinUrl: "",
    requiredSkills: "",
    experienceLevel: "",
    responsibilities: "",
    industry: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; name: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setJobDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(jobDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Puesto</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Desarrollador Frontend Senior"
                value={jobDetails.title}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                placeholder="Ej: Tech Solutions Inc."
                value={jobDetails.company}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Sector/Industria</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="Ej: Tecnología, Finanzas, Salud, etc."
              value={jobDetails.industry}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">URL de LinkedIn (opcional)</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              placeholder="https://www.linkedin.com/jobs/view/123456789"
              value={jobDetails.linkedinUrl}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredSkills">Habilidades Requeridas</Label>
            <Textarea
              id="requiredSkills"
              name="requiredSkills"
              placeholder="Ej: React, TypeScript, Node.js, etc."
              value={jobDetails.requiredSkills}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Nivel de Experiencia</Label>
            <Input
              id="experienceLevel"
              name="experienceLevel"
              placeholder="Ej: Junior, 3-5 años, Senior, etc."
              value={jobDetails.experienceLevel}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsabilidades</Label>
            <Textarea
              id="responsibilities"
              name="responsibilities"
              placeholder="Describe las principales responsabilidades del puesto"
              value={jobDetails.responsibilities}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
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