"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Key, 
  Notebook, 
  Brain,
  Coffee,
  Library,
  Sparkles,
  Lock
} from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/20 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100/30">
        {/* Elementos decorativos de fondo */}
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-200/10 blur-xl" />
        <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-indigo-200/10 blur-xl" />
        
        {/* Partículas decorativas */}
        <div className="absolute top-10 right-10 text-4xl opacity-10">📖</div>
        <div className="absolute bottom-10 left-10 text-4xl opacity-10">✏️</div>
        
        <div className="relative p-1">
          <Card className="border-blue-200/30 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 rounded-full bg-amber-500 shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Bienvenido de Vuelta
                  </CardTitle>
                  <CardDescription className="text-blue-700/80 mt-2 text-base">
                    Continúa tu viaje de aprendizaje
                  </CardDescription>
                </div>
              </div>
              
              {/* Mensaje de bienvenida */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Coffee className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Tu sesión de estudio te espera
                    </p>
                    <p className="text-xs text-blue-600/70 mt-1">
                      Accede a tus recursos y notas guardadas
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  {/* Email - Estilo académico */}
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                        <BookOpen className="h-5 w-5 text-blue-700" />
                      </div>
                      <Label htmlFor="email" className="text-blue-900 font-medium">
                        Correo Académico
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="estudiante@universidad.edu"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 border-blue-300 focus:border-blue-500 focus:ring-blue-500/30 bg-white/95 text-blue-900 placeholder-blue-400/60"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <span className="text-blue-600 text-lg">📧</span>
                      </div>
                    </div>
                  </div>

                  {/* Password - Estilo seguridad */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200">
                          <Lock className="h-5 w-5 text-indigo-700" />
                        </div>
                        <Label htmlFor="password" className="text-indigo-900 font-medium">
                          Contraseña
                        </Label>
                      </div>
                      <Link
                        href="/auth/forgot-password"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Key className="h-3 w-3" />
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/30 bg-white/95 text-indigo-900 placeholder-indigo-400/60"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <span className="text-indigo-600 text-lg">🔐</span>
                      </div>
                    </div>
                  </div>

                  {/* Error message - Estilo amigable */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/50">
                      <div className="p-2 rounded-full bg-red-100">
                        <Brain className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          ¡Ups! Algo no está bien
                        </p>
                        <p className="text-sm text-red-600/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Button - Estilo llamativo */}
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Accediendo a tu espacio...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <span className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                          <Notebook className="h-5 w-5" />
                        </span>
                        <span>Iniciar Sesión de Estudio</span>
                      </span>
                    )}
                  </Button>

                  {/* Separador decorativo */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-blue-200/50"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-blue-500/70 font-medium">
                        Tu progreso te espera
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Link to sign up */}
                <div className="mt-8 pt-6 border-t border-blue-200/50">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Library className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        ¿Nuevo en la academia?
                      </span>
                    </div>
                    <Link 
                      href="/auth/sign-up" 
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Crear Nueva Cuenta Estudiantil
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Notas de pie de página */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/30">
          <div className="text-xs font-medium text-blue-700 mb-1">🏆 Tu Progreso</div>
          <div className="text-xs text-blue-600/70">Continúa donde lo dejaste</div>
        </div>
        <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-200/30">
          <div className="text-xs font-medium text-indigo-700 mb-1">📚 Recursos</div>
          <div className="text-xs text-indigo-600/70">Acceso ilimitado disponible</div>
        </div>
        <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/30">
          <div className="text-xs font-medium text-amber-700 mb-1">👥 Comunidad</div>
          <div className="text-xs text-amber-600/70">Por medio de nuestas IA todos estan conectado y aprendiendo en conjunto</div>
        </div>
      </div>
    </div>
  );
}