'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LinkedInJobExtractor() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const extractJobData = async () => {
    if (!url) {
      toast.error('Por favor, ingresa una URL de LinkedIn');
      return;
    }

    if (!url.includes('linkedin.com') || !url.includes('/jobs/')) {
      toast.error('La URL debe ser una oferta de trabajo válida de LinkedIn');
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setResult(data);
      toast.success('Datos de la oferta de trabajo extraídos correctamente');
    } catch (error) {
      console.error('Error al extraer datos:', error);
      toast.error(error instanceof Error ? error.message : 'Error al extraer los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Extractor de Datos de LinkedIn</CardTitle>
        <CardDescription>
          Ingresa la URL de una oferta de trabajo de LinkedIn para extraer sus datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            placeholder="https://www.linkedin.com/jobs/view/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={extractJobData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando
              </>
            ) : (
              'Extraer Datos'
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="mt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Extrayendo datos de LinkedIn. Este proceso puede tardar varios minutos...
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">Resultado:</h3>
            <div className="mt-2 p-4 bg-muted rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Powered by BrightData - Los datos pueden tardar varios minutos en extraerse
      </CardFooter>
    </Card>
  );
} 