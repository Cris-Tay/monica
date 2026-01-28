import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="min-h-svh w-full relative bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 text-amber-200/30">
        <div className="text-6xl">📚</div>
      </div>
      <div className="absolute bottom-10 right-10 text-blue-200/30">
        <div className="text-6xl">✏️</div>
      </div>
      
      <div className="relative flex items-center justify-center p-6 md:p-10 min-h-svh">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              Monica TU tutora paes de bolsillo
            </h1>
            <p className="text-amber-700/70">
              Tu espacio para crecer y aprender
            </p>
          </div>
          <SignUpForm />
          <div className="mt-8 text-center">
            <p className="text-sm text-amber-700/60">
              Al registrarte, aceptas nuestros términos académicos y políticas de estudio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}