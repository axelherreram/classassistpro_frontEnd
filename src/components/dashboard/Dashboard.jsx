import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { Users, BookOpen, UserCheck, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import CrearClaseModal from './CrearClaseModal';
import { dashboardService } from '../../services/dashboard.service';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metrica, setMetrica] = useState({
    clasesActivas: 0,
    totalEstudiantes: 0,
    asistenciaPromedio: 0,
    sesionesRestantes: 0,
    clasesHoy: []
  });
  const [loading, setLoading] = useState(true);

  // Redirigir al admin fuera del panel de catedráticos si entra por URL
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      navigate('/dashboard/catedraticos');
    }
  }, [isAdmin, navigate]);

  const cargarMetricas = async () => {
    if (isAdmin) return; // Evitar llamada a métricas si es admin
    try {
      setLoading(true);
      const data = await dashboardService.obtenerMetricas();
      setMetrica(data);
    } catch (error) {
      toast.error('Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  const handleClaseCreada = () => {
    toast.success('¡Clase creada exitosamente!');
    cargarMetricas();
  };

  if (isAdmin) return null; // Prevenir renderizado fugaz mientras redirige

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 mt-1">Bienvenido de vuelta. Aquí tienes un resumen de tus clases de hoy.</p>
        </div>
        
        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
              <RefreshCw className="animate-spin text-gray-400" />
            </div>
          )}
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">        
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Clases Activas</h3>
              <p className="text-3xl font-bold text-gray-900">{metrica.clasesActivas}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-2xl">      
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Estudiantes</h3>
              <p className="text-3xl font-bold text-gray-900">{metrica.totalEstudiantes}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">    
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Asistencia Promedio</h3>
              <p className="text-3xl font-bold text-gray-900">{metrica.asistenciaPromedio}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">    
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Sesiones Restantes</h3>
              <p className="text-3xl font-bold text-gray-900">{metrica.sesionesRestantes}</p>
            </div>
          </div>
        </div>

        {/* Sección de Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Clases de Hoy</h2>
                <button 
                  onClick={() => navigate('/dashboard/clases')}
                  className="text-sm font-medium text-[#2d7a5d] hover:text-[#225d46]">
                  Ver todas
                </button>
              </div>
              {metrica.clasesHoy && metrica.clasesHoy.length > 0 ? (
                <div className="space-y-4">
                  {metrica.clasesHoy.map((clase, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <h3 className="font-bold text-gray-900">{clase.nombreClase}</h3>
                        <p className="text-sm text-gray-500">{clase.tema || "Sin tema especificado"}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100 mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay clases programadas</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Parece que tienes el día libre. Puedes crear una nueva clase si necesitas reunirte con estudiantes.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
                      <BookOpen className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="font-medium text-gray-900">Crear Clase</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Crear Clase */}
      <CrearClaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClaseCreada={handleClaseCreada}
      />
    </DashboardLayout>
  );
}