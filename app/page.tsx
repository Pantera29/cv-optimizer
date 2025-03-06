import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">CV Optimizer</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                Características
              </Link>
              <Link href="/app">
                <Button>
                  Ingresar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-40">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
              <span className="flex items-center gap-1">
                🚀 ¡Lanzamiento Oficial!
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl">
                Potenciá tu CV,{' '}
              <span className="text-blue-600">
                con IA
              </span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
              Potencia tu búsqueda laboral con inteligencia artificial. Optimiza tu CV, destaca tus habilidades y aumenta tus posibilidades de éxito.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/app">
                <Button size="lg" className="text-base px-6">
                  Comenzar ahora
                </Button>
              </Link>
              <Link href="#features" className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-1">
                Ver características <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Características principales
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para destacar
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Herramientas avanzadas diseñadas para maximizar el impacto de tu CV en el mercado laboral actual.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-blue-50 p-2 ring-1 ring-blue-600/20">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">Optimización con IA</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Análisis inteligente de tu CV para identificar áreas de mejora y sugerir optimizaciones específicas para cada puesto.
                </dd>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-blue-50 p-2 ring-1 ring-blue-600/20">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">Formato profesional</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Plantillas diseñadas profesionalmente que destacan tu experiencia y habilidades de manera efectiva.
                </dd>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-blue-50 p-2 ring-1 ring-blue-600/20">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">Fácil de usar</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Interfaz intuitiva que te permite crear y optimizar tu CV en minutos, sin complicaciones.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="col-span-12 md:col-span-6 lg:col-span-8">
              <h3 className="text-xl font-bold text-gray-900">CV Optimizer</h3>
              <p className="mt-3 text-base text-gray-600 max-w-md">
                Potenciá tus oportunidades laborales con inteligencia artificial. Únete a miles de profesionales que ya mejoraron su CV.
              </p>
            </div>

            {/* Producto */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <h3 className="text-base font-semibold text-gray-900">Producto</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                    Funciones
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                    Planes
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600">
              © 2025 CV Optimizer. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 