'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Save, GraduationCap, School, BookOpen, UserCircle } from 'lucide-react';

// Definimos la forma de los datos del perfil
interface ProfileData {
  full_name: string | null;
  age: number | null;
  academic_level: string | null;
  target_university: string | null;
  target_degree: string | null;
  email: string | null;
}

export default function ProfilePage() {
  // ✅ CORREGIDO: createBrowserClient en lugar de createClientComponentClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    age: null,
    academic_level: '',
    target_university: '',
    target_degree: '',
    email: '',
  });

  // 1. Cargar datos al iniciar
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            age: data.age || '',
            academic_level: data.academic_level || '',
            target_university: data.target_university || '',
            target_degree: data.target_degree || '',
            email: user.email || '',
          });
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [supabase]);

  // 2. Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Guardar cambios
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: formData.age ? Number(formData.age) : null,
          academic_level: formData.academic_level,
          target_university: formData.target_university,
          target_degree: formData.target_degree,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Error actualizando:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10 text-gray-500">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Encabezado de la Sección */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mi Perfil de Estudiante</h1>
        <p className="text-gray-600">Completa tu información para que podamos personalizar tus ensayos y plan de estudio.</p>
      </div>

      {/* Formulario Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <form onSubmit={updateProfile} className="space-y-8">
            
            {/* SECCIÓN 1: Datos Personales */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-indigo-500" />
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email (Solo lectura) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                  <input
                    type="text"
                    value={formData.email || ''}
                    disabled
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Nombre Completo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Edad */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Edad</label>
                  <input
                    name="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={handleChange}
                    placeholder="17"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECCIÓN 2: Metas Académicas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                Metas Académicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nivel Académico */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Situación Actual</label>
                  <div className="relative">
                    <School className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select
                      name="academic_level"
                      value={formData.academic_level || ''}
                      onChange={handleChange}
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                    >
                      <option value="">Selecciona tu nivel...</option>
                      <option value="3ro Medio">3ro Medio</option>
                      <option value="4to Medio">4to Medio</option>
                      <option value="Egresado">Egresado / Año Sabático</option>
                      <option value="Trabajando">Trabajando y Estudiando</option>
                    </select>
                  </div>
                </div>

                {/* Universidad Objetivo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Universidad Objetivo</label>
                  <div className="relative">
                    <School className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      name="target_university"
                      type="text"
                      value={formData.target_university || ''}
                      onChange={handleChange}
                      placeholder="Ej: Universidad de Chile"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Carrera Objetivo */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Carrera que deseas estudiar</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      name="target_degree"
                      type="text"
                      value={formData.target_degree || ''}
                      onChange={handleChange}
                      placeholder="Ej: Ingeniería Civil Informática"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Mensajes de Feedback */}
            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Botón Guardar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Perfil
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}