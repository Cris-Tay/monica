import Link from "next/link";
import { BarChart3, Brain, Target, Zap, ArrowRight, BookOpen } from "lucide-react";
import { HomeFooter } from "@/components/home-footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      
      {/* ================= NAVBAR ================= */}
      <nav className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
          <Link href="/" className="font-bold text-lg">
            PAES Pro
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center py-20 space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Prepárate para la PAES de forma inteligente
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practica con ensayos reales, analiza tu rendimiento y mejora tus
            resultados con estadísticas claras y seguimiento personalizado.
          </p>

          <div className="flex justify-center gap-4 pt-6">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Comenzar Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Brain className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Análisis Inteligente
            </h3>
            <p className="text-gray-600 text-sm">
              Visualiza tu precisión, errores frecuentes y desempeño por tema.
              Identifica rápidamente tus debilidades.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Seguimiento de Progreso
            </h3>
            <p className="text-gray-600 text-sm">
              Monitorea tu evolución con gráficos claros y comparaciones entre
              ensayos.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Target className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Simulación Real
            </h3>
            <p className="text-gray-600 text-sm">
              Ensayos en formato similar a la prueba oficial para entrenar en
              condiciones reales.
            </p>
          </div>

        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-bold">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-left">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <BookOpen className="h-5 w-5 text-blue-600" />
                1. Rinde un ensayo
              </div>
              <p className="text-gray-600 text-sm">
                Elige una materia y completa el ensayo cronometrado.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Zap className="h-5 w-5 text-orange-600" />
                2. Recibe tu puntaje
              </div>
              <p className="text-gray-600 text-sm">
                Obtén tu score en escala PAES y revisa tus respuestas.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                3. Analiza tu progreso
              </div>
              <p className="text-gray-600 text-sm">
                Observa tu rendimiento por tema y mejora estratégicamente.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="bg-blue-600 py-20 px-6 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">
            Empieza hoy y mejora tu puntaje
          </h2>

          <p className="text-blue-100">
            Miles de estudiantes ya están entrenando con datos reales.
            Tú puedes ser el siguiente.
          </p>

          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <HomeFooter />
    </main>
  );
}
