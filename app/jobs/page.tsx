import LinkedInJobExtractor from '../components/LinkedInJobExtractor';

export const metadata = {
  title: 'Extractor de Trabajos de LinkedIn',
  description: 'Extrae datos de ofertas de trabajo de LinkedIn usando BrightData',
};

export default function JobsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Extractor de Trabajos de LinkedIn
      </h1>
      <LinkedInJobExtractor />
    </div>
  );
} 