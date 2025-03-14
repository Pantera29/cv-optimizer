import axios, { AxiosError } from 'axios';
import { supabase } from '@/lib/supabase';

// Definir interfaces para los datos que recibimos de BrightData
interface BrightDataRequest {
  url: string;
}

interface BrightDataItem {
  job_posting_id?: string;
  job_title?: string;
  company_name?: string;
  company_id?: string;
  job_location?: string;
  job_work_type?: string;
  job_base_pay_range?: string;
  job_posted_time_ago?: string;
  job_description_formatted?: string;
  job_summary?: string;
  job_requirements?: string[] | Record<string, any> | null;
  job_qualifications?: string[] | null;
  job_seniority_level?: string;
  job_function?: string;
  job_employment_type?: string;
  job_industries?: string | string[] | null;
  company_industry?: string;
  company_description?: string;
  company_url?: string;
  company_logo?: string;
  job_num_applicants?: number;
  applicant_count?: number;
  job_posted_date?: string;
  job_posted_time?: string;
  apply_link?: string;
  country_code?: string;
  title_id?: string;
  application_availability?: boolean;
  job_skills?: string[];
  discovery_input?: Record<string, unknown>;
  job_poster?: Record<string, unknown>;
  base_salary?: Record<string, unknown>;
  [key: string]: unknown; // Para admitir propiedades adicionales
}

interface BrightDataResponse {
  success?: boolean;
  message?: string;
  result?: {
    data?: BrightDataItem;
  };
  job_data?: BrightDataItem;
  job_posting_id?: string; // Para detectar si es un item directamente
  data?: BrightDataItem[] | any[];
  rawData?: BrightDataItem;
  error?: string;
  [key: string]: unknown;
}

// Constantes para la integración con BrightData
const API_ENDPOINT = process.env.BRIGHTDATA_API_ENDPOINT || 'https://api.brightdata.com/datasets/v3/trigger';
const API_TOKEN = process.env.BRIGHTDATA_API_TOKEN || '9ff5cab742b378f058e9f9c34b0c47d0255cb680abd1624b015aa90e7d451c14';
const DATASET_ID = process.env.BRIGHTDATA_DATASET_ID || 'gd_lpfll7v5hcqtkxl6l';
const MAX_POLLING_ATTEMPTS = 30; // Número máximo de intentos de polling
const POLLING_INTERVAL = 5000; // Intervalo entre intentos de polling (5 segundos)

/**
 * Envía una solicitud a BrightData para extraer datos de una URL de LinkedIn
 */
export async function requestJobData(url: string, userId: string): Promise<BrightDataResponse> {
  try {
    // Validar URL
    if (!url.includes('linkedin.com') || !url.includes('/jobs/')) {
      throw new Error('La URL debe ser una oferta de trabajo válida de LinkedIn');
    }
    
    if (!userId) {
      throw new Error('Se requiere un ID de usuario para extraer datos');
    }
    
    console.log(`Iniciando solicitud para extraer datos de: ${url} para usuario: ${userId}`);
    const payload: BrightDataRequest[] = [{ url }];
    
    // Enviar solicitud inicial a BrightData
    const response = await axios.post(API_ENDPOINT, payload, {
      params: {
        dataset_id: DATASET_ID,
        format: 'json',
      },
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Verificar que se obtuvo un snapshot_id
    const snapshotId = response.data.snapshot_id;
    if (!snapshotId) {
      throw new Error('No se recibió snapshot_id en la respuesta de BrightData');
    }
    
    console.log(`Snapshot ID recibido: ${snapshotId}. Iniciando proceso de polling...`);
    
    // Iniciar proceso de polling para esperar los datos
    const jobData = await pollForSnapshotData(snapshotId);
    
    // Procesar y guardar los datos obtenidos
    const results = await processAndSaveJobData(jobData, userId);
    
    // Crear un objeto jobData de respaldo si results está vacío
    if (!results || results.length === 0 || !results[0].success) {
      console.log('No se encontraron resultados válidos. Creando datos de respaldo...');
      
      // Extraer información básica de la URL
      const urlParts = url.split('/');
      let jobId = '';
      
      // Intentar obtener el ID del trabajo de la URL
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i] === 'view' && i + 1 < urlParts.length) {
          jobId = urlParts[i + 1];
          break;
        }
      }
      
      // Crear datos básicos a partir de la URL
      const fallbackData = {
        job_posting_id: jobId || `linkedin-${Date.now()}`,
        job_title: 'Oferta de trabajo de LinkedIn',
        company_name: 'Empresa en LinkedIn',
        job_location: 'No disponible',
        job_description_formatted: 'No se pudieron extraer los detalles completos de esta oferta.',
        apply_link: url
      };
      
      // Devolver datos de respaldo
      return {
        success: true,
        message: 'Se han creado datos básicos para la oferta',
        data: results,
        jobData: fallbackData
      };
    }
    
    return {
      success: true,
      message: 'Datos procesados exitosamente',
      data: results,
      jobData: results.length > 0 && results[0].success ? results[0].data : undefined
    };
  } catch (error) {
    console.error('Error al solicitar datos de la oferta de trabajo:', error);
    
    // Crear datos de respaldo para el error
    const fallbackData = {
      job_posting_id: `linkedin-error-${Date.now()}`,
      job_title: 'Error al extraer datos',
      company_name: 'LinkedIn',
      job_location: 'No disponible',
      job_description_formatted: `No se pudieron extraer los detalles: ${error instanceof Error ? error.message : String(error)}`,
      apply_link: url
    };
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Error al solicitar datos: ${error.response?.data?.message || error.message}`,
        error: error.message,
        jobData: fallbackData
      };
    }
    return {
      success: false,
      message: 'Error al solicitar datos de la oferta de trabajo',
      error: error instanceof Error ? error.message : String(error),
      jobData: fallbackData
    };
  }
}

/**
 * Realiza polling a BrightData para verificar cuando los datos están disponibles
 */
async function pollForSnapshotData(snapshotId: string): Promise<BrightDataResponse | BrightDataItem[]> {
  const snapshotUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`
  };
  
  let attempts = 0;
  
  while (attempts < MAX_POLLING_ATTEMPTS) {
    attempts++;
    console.log(`Verificando estado del snapshot. Intento ${attempts}/${MAX_POLLING_ATTEMPTS}`);
    
    try {
      const response = await axios.get(snapshotUrl, { headers });
      
      // Si la respuesta es 200, el snapshot está listo
      if (response.status === 200) {
        console.log('Snapshot listo. Descargando datos...');
        return response.data;
      }
      // Si la respuesta es 202, el snapshot aún no está listo
      else if (response.status === 202) {
        console.log('Snapshot aún no está listo. Esperando...');
      } 
      // Cualquier otro código de estado es un error
      else {
        console.error(`Error al verificar el snapshot: ${response.status}`);
        throw new Error(`Error al verificar el snapshot: ${response.status}`);
      }
    } catch (error) {
      // Si es un error 404, el snapshot podría no existir
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Snapshot no encontrado. El ID podría ser inválido o haber expirado.');
      }
      // Para otros errores, continuamos intentando
      console.log('Reintentando después del error...');
    }
    
    // Esperar antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }
  
  throw new Error(`Tiempo de espera agotado después de ${MAX_POLLING_ATTEMPTS} intentos. El snapshot no está listo.`);
}

/**
 * Mapea los campos del JSON de BrightData a los nombres esperados
 * @param item Datos originales de BrightData
 * @returns Objeto con los campos mapeados correctamente
 */
function mapFieldNames(item: BrightDataItem): BrightDataItem {
  const mappedData: BrightDataItem = {
    ...item,
    created_at: new Date().toISOString()
  };

  // Mapear campos con nombres diferentes
  if ('job_num_applicants' in item) {
    mappedData.applicant_count = item.job_num_applicants;
    // Eliminar el campo original que causa el error
    delete mappedData.job_num_applicants;
  }

  if ('job_posted_time' in item) {
    mappedData.job_posted_time_ago = item.job_posted_time;
    // Eliminar el campo original que causa el error
    delete mappedData.job_posted_time;
  }

  if ('job_industries' in item) {
    // Guardamos como string para company_industry
    if (Array.isArray(item.job_industries)) {
      mappedData.company_industry = item.job_industries.join(', ');
    } else if (typeof item.job_industries === 'string') {
      mappedData.company_industry = item.job_industries;
      // Si el campo es un string, también lo guardamos en job_industries como array
      mappedData.job_industries = [item.job_industries];
    }
  }

  if ('job_employment_type' in item) {
    mappedData.job_work_type = item.job_employment_type;
    // Si ya mapeamos a otro campo, eliminar el original para evitar conflictos
    delete mappedData.job_employment_type;
  }

  // Convertir todos los nombres de campos a los existentes en la tabla
  // y eliminar los que no existen en el esquema
  const fieldMappings: Record<string, string> = {
    // Mapeo de campos específicos que podrían causar problemas
    'job_base_pay': 'job_base_pay_range',
    'job_description': 'job_description_formatted',
    'applicants': 'applicant_count',
  };

  // Aplicar los mapeos adicionales
  Object.entries(fieldMappings).forEach(([oldField, newField]) => {
    if (oldField in mappedData && !(newField in mappedData)) {
      mappedData[newField] = mappedData[oldField];
      delete mappedData[oldField];
    }
  });

  // Asegurarse de que los objetos complejos se mantengan
  if (item.discovery_input) mappedData.discovery_input = item.discovery_input;
  if (item.job_poster) mappedData.job_poster = item.job_poster;
  if (item.base_salary) mappedData.base_salary = item.base_salary;

  return mappedData;
}

/**
 * Procesa y guarda los datos recibidos de BrightData
 */
async function processAndSaveJobData(data: BrightDataResponse | BrightDataItem[], userId: string) {
  console.log('Procesando datos recibidos de BrightData');
  
  // Extraer los datos según la estructura recibida
  let jobsToProcess: BrightDataItem[] = [];
  
  // Type guard para verificar si es una respuesta con 'result'
  function isResponseWithResult(obj: any): obj is { result: { data?: BrightDataItem } } {
    return obj && typeof obj === 'object' && 'result' in obj && 
           obj.result && typeof obj.result === 'object' && 'data' in obj.result;
  }
  
  // Type guard para verificar si tiene job_data
  function isResponseWithJobData(obj: any): obj is { job_data: BrightDataItem } {
    return obj && typeof obj === 'object' && 'job_data' in obj && obj.job_data;
  }
  
  // Type guard para verificar si es un BrightDataItem
  function isBrightDataItem(obj: any): obj is BrightDataItem {
    return obj && typeof obj === 'object' && 'job_posting_id' in obj;
  }
  
  // Intentar identificar la estructura de los datos
  if (Array.isArray(data)) {
    console.log('Datos en formato de array');
    jobsToProcess = data.map(item => mapFieldNames(item));
  } else if (isResponseWithResult(data)) {
    console.log('Datos en formato result.data');
    if (data.result.data) {
      jobsToProcess = [mapFieldNames(data.result.data)];
    }
  } else if (isResponseWithJobData(data)) {
    console.log('Datos en formato job_data');
    jobsToProcess = [mapFieldNames(data.job_data)];
  } else if (isBrightDataItem(data)) {
    console.log('Datos directamente en el objeto raíz');
    jobsToProcess = [mapFieldNames(data)];
  } else {
    console.warn('Estructura de datos no reconocida');
    // Intentar una última opción por si tiene otros datos anidados
    try {
      if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        for (const key of keys) {
          const value = (data as Record<string, any>)[key];
          if (isBrightDataItem(value)) {
            console.log(`Encontrada información de trabajo en la clave ${key}`);
            jobsToProcess = [mapFieldNames(value)];
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error al intentar extraer datos en formato alternativo:', error);
    }

    if (jobsToProcess.length === 0) {
      throw new Error('Estructura de datos no reconocida');
    }
  }
  
  console.log(`Procesando ${jobsToProcess.length} ofertas de trabajo`);
  if (jobsToProcess.length > 0) {
    console.log('Primera oferta a procesar:', jobsToProcess[0].job_title);
  }
  
  // Guardar cada oferta en la base de datos
  const results = [];
  for (const jobData of jobsToProcess) {
    if (!jobData.job_posting_id) {
      console.warn('Datos de trabajo sin ID, omitiendo');
      continue;
    }
    
    try {
      console.log(`Guardando oferta: ${jobData.job_title || 'Sin título'}`);
      
      // Asegurar que los campos obligatorios existan
      const enrichedJobData = {
        ...jobData,
        job_title: jobData.job_title || 'Sin título',
        company_name: jobData.company_name || 'Empresa desconocida',
        job_location: jobData.job_location || 'Ubicación desconocida',
        created_at: jobData.created_at || new Date().toISOString(),
        user_id: userId
      };
      
      const result = await saveJobToDatabase(enrichedJobData, userId);
      results.push(result);
    } catch (error) {
      console.error(`Error al guardar oferta:`, error);
      results.push({
        success: false,
        message: 'Error al guardar oferta',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return results;
}

/**
 * Guarda o actualiza un trabajo en la base de datos
 */
async function saveJobToDatabase(jobData: BrightDataItem, userId: string) {
  try {
    // Validar ID del trabajo
    if (!jobData.job_posting_id) {
      console.error('Error: Intento de guardar trabajo sin ID');
      return {
        success: false,
        message: 'Error al guardar oferta: falta job_posting_id',
        error: 'job_posting_id es obligatorio'
      };
    }

    console.log(`Preparando datos para guardar trabajo con ID: ${jobData.job_posting_id}`);
    
    // Limpiar y validar los datos antes de guardarlos
    const cleanedData = cleanJobDataForDB(jobData);
    
    // Asegurar que el user_id esté incluido
    cleanedData.user_id = userId;
    
    // Registrar los campos que se van a insertar para diagnóstico
    console.log(`Campos a insertar: ${Object.keys(cleanedData).join(', ')}`);
    
    // Verificar si el trabajo ya existe PARA ESTE USUARIO
    try {
      const { data: existingJob, error: fetchError } = await supabase
        .from('linkedin_jobs')
        .select('job_posting_id')
        .eq('job_posting_id', cleanedData.job_posting_id)
        .eq('user_id', userId) // CORRECCIÓN: Filtrar por user_id
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 es "no se encontró el registro" (no es un error real)
        console.error('Error al buscar trabajo existente:', fetchError);
        return {
          success: false,
          message: 'Error al buscar trabajo en la base de datos',
          error: fetchError.message
        };
      }

      if (existingJob) {
        // Actualizar trabajo existente
        console.log(`Actualizando trabajo existente con ID: ${cleanedData.job_posting_id}`);
        const { error: updateError } = await supabase
          .from('linkedin_jobs')
          .update(cleanedData)
          .eq('job_posting_id', cleanedData.job_posting_id)
          .eq('user_id', userId); // CORRECCIÓN: Filtrar por user_id

        if (updateError) {
          console.error('Error detallado al actualizar trabajo:', updateError);
          return {
            success: false,
            message: 'Error al actualizar trabajo en la base de datos',
            error: updateError.message
          };
        }

        return {
          success: true,
          message: 'Datos de la oferta de trabajo actualizados correctamente',
          data: cleanedData
        };
      } else {
        // Crear nuevo trabajo
        console.log(`Creando nuevo trabajo con ID: ${cleanedData.job_posting_id}`);
        
        // Intento con RLS desactivado (si es posible)
        const { data: insertData, error: insertError } = await supabase
          .from('linkedin_jobs')
          .insert([cleanedData])
          .select();

        if (insertError) {
          console.error('Error detallado al insertar trabajo:', {
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
            message: insertError.message
          });
          
          // Intentar obtener información sobre el esquema actual
          try {
            console.log('Obteniendo información del esquema para diagnóstico...');
            const { data: schemaInfo } = await supabase
              .from('linkedin_jobs')
              .select('*')
              .limit(1);
              
            if (schemaInfo && schemaInfo.length > 0) {
              console.log('Columnas existentes en la tabla:', Object.keys(schemaInfo[0]).join(', '));
            }
          } catch (schemaError) {
            console.error('No se pudo obtener información del esquema:', schemaError);
          }
          
          return {
            success: false,
            message: 'Error al insertar trabajo en la base de datos',
            error: insertError.message
          };
        }

        return {
          success: true,
          message: 'Datos de la oferta de trabajo guardados correctamente',
          data: insertData ? insertData[0] : cleanedData
        };
      }
    } catch (dbError) {
      console.error('Error inesperado en la operación de base de datos:', dbError);
      return {
        success: false,
        message: 'Error inesperado en la operación de base de datos',
        error: dbError instanceof Error ? dbError.message : String(dbError)
      };
    }
  } catch (error) {
    console.error('Error general en saveJobToDatabase:', error);
    return {
      success: false,
      message: 'Error al procesar datos para guardar en la base de datos',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Limpia y valida los datos del trabajo para garantizar la compatibilidad con el esquema de base de datos
 */
function cleanJobDataForDB(jobData: BrightDataItem): Record<string, any> {
  // Crear una copia limpia de los datos
  const cleanedData: Record<string, any> = { ...jobData };
  
  // Eliminar campos problemáticos que no existen en el esquema
  const fieldsToRemove = [
    'input', 
    '__v', 
    '_id', 
    'discovery_output', 
    'job_num_applicants', 
    'job_posted_time',    
    'job_base_pay',       
    'job_description',    
    'applicants',         
    'job_employment_type' 
  ];
  
  fieldsToRemove.forEach(field => {
    if (field in cleanedData) {
      delete cleanedData[field];
    }
  });
  
  // Asegurar que los campos obligatorios existan
  cleanedData.job_posting_id = String(cleanedData.job_posting_id || '');
  cleanedData.job_title = String(cleanedData.job_title || 'Sin título');
  cleanedData.company_name = String(cleanedData.company_name || 'Empresa desconocida');
  cleanedData.job_location = String(cleanedData.job_location || 'Ubicación desconocida');
  
  // Manejar específicamente el campo job_industries para asegurar que sea un array válido
  if ('job_industries' in cleanedData) {
    try {
      let industriesArray: string[] = [];
      
      // Si ya es un array, usarlo directamente
      if (Array.isArray(cleanedData.job_industries)) {
        industriesArray = cleanedData.job_industries.map(i => String(i).trim());
      }
      // Si es un string, convertirlo a array
      else if (typeof cleanedData.job_industries === 'string') {
        // Intentar detectar si es un string que ya parece un array JSON
        if (cleanedData.job_industries.startsWith('[') && cleanedData.job_industries.endsWith(']')) {
          try {
            // Intentar parsearlo como JSON
            const parsed = JSON.parse(cleanedData.job_industries);
            if (Array.isArray(parsed)) {
              industriesArray = parsed.map(i => String(i).trim());
            } else {
              industriesArray = [String(cleanedData.job_industries).trim()];
            }
          } catch {
            // Si falla el parseo JSON, tratar como string normal
            industriesArray = cleanedData.job_industries.split(',').map(i => i.trim());
          }
        } 
        // Si es un string simple con comas
        else if (cleanedData.job_industries.includes(',')) {
          industriesArray = cleanedData.job_industries.split(',').map(i => i.trim());
        }
        // Si es un string simple
        else {
          industriesArray = [String(cleanedData.job_industries).trim()];
        }
      }
      
      // Limpiar el array: eliminar elementos vacíos y duplicados
      industriesArray = industriesArray.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      
      // Asignar el array final
      cleanedData.job_industries = industriesArray;
      
      // También crear un string para company_industry
      if (industriesArray.length > 0) {
        cleanedData.company_industry = industriesArray.join(', ');
      }
    } catch (e) {
      console.warn('Error al procesar job_industries:', e);
      // Si hay algún error, usar un array vacío
      cleanedData.job_industries = [];
      delete cleanedData.company_industry;
    }
  }
  
  // Asegurar que los objetos JSON sean válidos
  ['job_requirements', 'job_qualifications', 'discovery_input', 'job_poster', 'base_salary'].forEach(field => {
    if (field in cleanedData && typeof cleanedData[field] === 'string') {
      try {
        cleanedData[field] = JSON.parse(cleanedData[field]);
      } catch (e) {
        console.warn(`Error al parsear JSON para ${field}:`, e);
        // Mantener como string si no se puede parsear
      }
    }
  });
  
  // Asegurar que los campos de fecha son válidos
  ['created_at', 'job_posted_date', 'job_posted_date_timestamp'].forEach(field => {
    if (field in cleanedData && cleanedData[field]) {
      try {
        // Intentar convertir a fecha si es string
        if (typeof cleanedData[field] === 'string') {
          const date = new Date(cleanedData[field]);
          if (isNaN(date.getTime())) {
            cleanedData[field] = null;
          }
        }
      } catch (e) {
        console.warn(`Error al procesar fecha ${field}:`, e);
        cleanedData[field] = null;
      }
    }
  });

  // Verificar que solo se usen columnas que existen en la tabla
  const columnasExistentes = [
    'job_uuid', 'user_id', 'job_posting_id', 'job_title', 'company_name',
    'job_location', 'job_work_type', 'job_base_pay_range', 'job_posted_time_ago',
    'job_description_formatted', 'job_requirements', 'job_qualifications',
    'company_industry', 'company_description', 'applicant_count', 'created_at',
    'job_seniority_level', 'job_function', 'job_industries', 'company_url',
    'company_logo', 'job_posted_date', 'apply_link', 'job_summary',
    'country_code', 'title_id', 'company_id', 'application_availability',
    'job_posted_date_timestamp', 'discovery_input', 'job_poster', 'base_salary'
  ];

  // Eliminar campos que no están en la lista de columnas permitidas
  Object.keys(cleanedData).forEach(key => {
    if (!columnasExistentes.includes(key)) {
      console.warn(`Eliminando campo no existente en el esquema: ${key}`);
      delete cleanedData[key];
    }
  });

  // IMPORTANTE: NO convertir arrays a JSON strings
  // Preservar arrays nativos para los campos que son de tipo array en PostgreSQL
  const arrayFields = ['job_industries']; 
  
  // Convertir objetos complejos (excepto arrays) a JSON string para evitar errores
  Object.keys(cleanedData).forEach(key => {
    if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
      // No convertir a string si es un campo de tipo array
      if (arrayFields.includes(key)) {
        // Validar que realmente sea un array
        if (!Array.isArray(cleanedData[key])) {
          console.warn(`Campo ${key} debería ser un array pero no lo es. Forzando array vacío.`);
          cleanedData[key] = [];
        }
      } else {
        // Para otros objetos, convertir a JSON string
        try {
          cleanedData[key] = JSON.stringify(cleanedData[key]);
        } catch (e) {
          console.warn(`Error al convertir objeto a JSON para ${key}:`, e);
          delete cleanedData[key]; // Eliminar campos que no se pueden convertir
        }
      }
    }
  });

  // Añadir logging adicional para diagnóstico
  if ('job_industries' in cleanedData) {
    console.log('job_industries antes de enviar:', 
      Array.isArray(cleanedData.job_industries) 
        ? `Array de ${cleanedData.job_industries.length} elementos` 
        : typeof cleanedData.job_industries);
  }
  
  return cleanedData;
} 