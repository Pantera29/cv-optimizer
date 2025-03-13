# Extracción de Datos de LinkedIn con BrightData

## Descripción

Esta funcionalidad permite extraer datos estructurados de ofertas de trabajo de LinkedIn a partir de una URL proporcionada por el usuario. La extracción se realiza mediante la API de BrightData, que navega por la página web, extrae los datos relevantes y los devuelve en formato estructurado.

## Flujo de Funcionamiento

1. El usuario ingresa una URL de LinkedIn en el formulario
2. La URL se envía al backend mediante una solicitud POST a `/api/jobs`
3. El backend valida la URL y la envía a BrightData
4. BrightData devuelve un `snapshot_id` que se utiliza para verificar el estado de la extracción
5. El backend inicia un proceso de polling para verificar cuando los datos están disponibles
6. Una vez disponibles, los datos son procesados y almacenados en la base de datos
7. Se devuelve una respuesta al frontend con información sobre el éxito o fracaso del proceso

## Consideraciones Importantes

### Tiempo de Extracción
El proceso de extracción puede tardar varios minutos. El frontend debe mostrar adecuadamente el estado de "procesando" durante este tiempo.

### Estructuras de Datos Variables
BrightData puede devolver estructuras de datos ligeramente diferentes. El sistema está diseñado para ser robusto y manejar estas variaciones.

### Límites de API
BrightData tiene límites de solicitudes. Es importante controlar la frecuencia de las solicitudes y evitar bloqueos.

## Estructura de Datos

Los datos extraídos incluyen:

- `job_posting_id`: ID único de la oferta de trabajo
- `job_title`: Título o puesto de la oferta
- `company_name`: Nombre de la empresa
- `company_industry`: Industria o sector de la empresa
- `job_location`: Ubicación geográfica del trabajo
- `job_description`: Descripción completa del puesto
- `job_work_type`: Tipo de trabajo (tiempo completo, medio tiempo, etc.)
- `job_seniority_level`: Nivel de experiencia requerido
- `job_functions`: Funciones o responsabilidades del puesto
- `job_skills`: Habilidades requeridas para el puesto
- `job_qualifications`: Cualificaciones necesarias
- `job_requirements`: Requisitos específicos
- `job_salary`: Información sobre el salario (si está disponible)
- `job_benefits`: Beneficios ofrecidos
- `company_description`: Descripción de la empresa
- `applicant_count`: Número de aplicantes para la oferta

## Errores Comunes

- **URL inválida**: La URL debe ser una oferta de trabajo válida de LinkedIn
- **Tiempo de espera agotado**: Si BrightData tarda demasiado en procesar la solicitud
- **Errores de conexión**: Problemas al conectarse con la API de BrightData
- **Datos no reconocidos**: Si BrightData devuelve datos en un formato inesperado

## Ejemplo de Uso

```javascript
// Desde el frontend
const extractJobData = async (url) => {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Procesar los datos recibidos
    console.log(data.data);
  } else {
    // Manejar el error
    console.error(data.message);
  }
};
```

## Configuración

Para configurar esta integración, es necesario establecer las siguientes variables de entorno:

```
BRIGHTDATA_API_TOKEN=tu-token-de-api
BRIGHTDATA_DATASET_ID=tu-dataset-id
BRIGHTDATA_API_ENDPOINT=https://api.brightdata.com/datasets/v3/trigger
``` 