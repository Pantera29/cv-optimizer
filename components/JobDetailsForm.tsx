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
import { Briefcase, Send } from "lucide-react";

export interface JobDetails {
  linkedinUrl: string;
  requiredSkills: string;
  experienceLevel: string;
  responsibilities: string;
}

export default function JobDetailsForm({ onSubmit, isLoading }: { 
  onSubmit: (details: JobDetails) => void;
  isLoading?: boolean;
}) {
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    linkedinUrl: "",
    requiredSkills: "",
    experienceLevel: "",
    responsibilities: "",
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
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="text-sm font-medium">
            URL de LinkedIn
          </Label>
          <div className="relative">
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://www.linkedin.com/jobs/..."
              value={jobDetails.linkedinUrl}
              onChange={handleChange}
              className="pl-8"
            />
            <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiredSkills" className="text-sm font-medium">
            Habilidades Requeridas
          </Label>
          <Textarea
            id="requiredSkills"
            name="requiredSkills"
            placeholder="Ej: React, Node.js, AWS..."
            value={jobDetails.requiredSkills}
            onChange={handleChange}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel" className="text-sm font-medium">
            Nivel de Experiencia
          </Label>
          <Select
            name="experienceLevel"
            value={jobDetails.experienceLevel}
            onValueChange={(value) => handleChange({ value, name: "experienceLevel" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior (0-2 años)</SelectItem>
              <SelectItem value="mid">Mid-Level (2-5 años)</SelectItem>
              <SelectItem value="senior">Senior (5+ años)</SelectItem>
              <SelectItem value="lead">Lead/Principal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibilities" className="text-sm font-medium">
            Responsabilidades
          </Label>
          <Textarea
            id="responsibilities"
            name="responsibilities"
            placeholder="Describe las principales responsabilidades..."
            value={jobDetails.responsibilities}
            onChange={handleChange}
            className="min-h-[120px]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        <Send className="mr-2 h-4 w-4" />
        {isLoading ? "Analizando..." : "Analizar CV"}
      </Button>
    </form>
  );
} 