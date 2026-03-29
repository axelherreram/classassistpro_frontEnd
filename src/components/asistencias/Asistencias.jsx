import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import GruposModal from './GruposModal';
import RuletaModal from './RuletaModal';
import { Calendar, BookOpen, Plus, QrCode, Search, CheckCircle2, Clock, Users, Dices, UsersRound , Timer, Maximize } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';
import { asistenciaService } from '../../services/asistencia.service';
import { useNavigate } from 'react-router-dom';
import NuevaSesionModal from './NuevaSesionModal';
import GenerarQRModal from './GenerarQRModal';
import DetallesSesionModal from './DetallesSesionModal';
import TimerModal from './TimerModal';

export default function Asistencias() {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [sesiones, setSesiones] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [loadingSesiones, setLoadingSesiones] = useState(false);

  // Modals
  const [isNuevaSesionModalOpen, setIsNuevaSesionModalOpen] = useState(false);  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [sesionSeleccionadaParaQr, setSesionSeleccionadaParaQr] = useState(null);

  const [isListaModalOpen, setIsListaModalOpen] = useState(false);
  const [sesionSeleccionadaParaLista, setSesionSeleccionadaParaLista] = useState(null);
  const [isRuletaModalOpen, setIsRuletaModalOpen] = useState(false);
  const [sesionSeleccionadaParaRuleta, setSesionSeleccionadaParaRuleta] = useState(null);
  const [isGruposModalOpen, setIsGruposModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [sesionSeleccionadaParaGrupos, setSesionSeleccionadaParaGrupos] = useState(null);

  // 1. Cargar las clases
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoadingClases(true);
        const data = await claseService.obtenerClases();
        const listaClases = data.clases || data || [];
        setClases(listaClases);

        if (listaClases.length > 0) {
          setClaseSeleccionada(listaClases[0].id.toString());
        }
      } catch (error) {
        toast.error('Error al cargar las clases');
      } finally {
        setLoadingClases(false);
      }
    };
    fetchClases();
  }, []);

  // 2. Cargar sesiones cuando cambia la clase
  const fetchSesiones = async () => {
    if (!claseSeleccionada) return;
    try {
      setLoadingSesiones(true);
      const data = await asistenciaService.obtenerSesiones(claseSeleccionada);  
      setSesiones(data.sesiones || []);
    } catch (error) {
      toast.error('Error al cargar las sesiones');
      setSesiones([]);
    } finally {
      setLoadingSesiones(false);
    }
  };

  useEffect(() => {
    fetchSesiones();
  }, [claseSeleccionada]);

  const handleVerAsistencias = (sesionId) => {
    setSesionSeleccionadaParaLista(sesionId);
    setIsListaModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-8">
        <div className="bg-[#201b18] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-emerald-400" />
                Control de Asistencias
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Crea sesiones, genera códigos QR dinámicos y supervisa la asistencia de tus estudiantes.
              </p>
            </div>

            {claseSeleccionada && (
              <button
                onClick={() => setIsNuevaSesionModalOpen(true)}
                className="flex items-center gap-2 bg-[#2d7a5d] hover:bg-[#225d46] text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-center"       
              >
                <Plus className="w-5 h-5" />
                Nueva Sesión
              </button>
            )}
          </div>
        </div>

        {/* Seleccionador de clase */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">    
            Filtrar por Clase
          </label>
          {loadingClases ? (
            <div className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>   
          ) : clases.length === 0 ? (
            <div className="text-gray-500 py-2">
              No tienes clases creadas aún.{' '}
              <button onClick={() => navigate('/dashboard/clases')} className="text-[#2d7a5d] hover:underline font-medium">Crear una clase</button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={claseSeleccionada}
                onChange={(e) => setClaseSeleccionada(e.target.value)}
                className="block w-full pl-11 pr-10 py-3 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all font-medium appearance-none"
              >
                {clases.map((clase) => (
                  <option key={clase.id} value={clase.id}>
                    {clase.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Sesiones */}
        {claseSeleccionada && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Historial de Sesiones
            </h2>

            {loadingSesiones ? (
               <div className="text-center py-10 text-gray-400 animate-pulse">Cargando sesiones...</div>
            ) : sesiones.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
                <div className="bg-emerald-50 p-4 rounded-full mb-4 text-[#2d7a5d]">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no hay sesiones</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  Crea tu primera sesión de clase para comenzar a registrar la asistencia de tus alumnos.
                </p>
                <button
                  onClick={() => setIsNuevaSesionModalOpen(true)}
                  className="px-5 py-2.5 bg-[#f4f7fb] text-[#2d7a5d] rounded-xl font-medium hover:bg-emerald-50 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sesiones.map((sesion) => (
                  <div key={sesion.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-gray-200 transition-all flex flex-col">
                     <div className="flex justify-between items-start mb-4">    
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          {new Date(sesion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <button
                          onClick={() => navigate(`/dashboard/proyectar/${sesion.id}`)}
                          className="flex items-center gap-1 text-xs py-1.5 px-3 bg-[#2d7a5d] hover:bg-emerald-700 text-white rounded-full font-medium transition shadow-sm"
                          title="Pantalla de Clase"
                        >
                          <Maximize className="w-3 h-3" /> Proyectar
                        </button>
                     </div>
                     <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                       {sesion.tema || 'Sesión Regular'}
                     </h3>

                     <div className="mt-auto pt-4 flex flex-wrap gap-2 w-full border-t border-gray-50">
                        <button
                          onClick={() => handleVerAsistencias(sesion.id)}       
                          className="flex-[1_1_100%] sm:flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-[#f4f7fb] text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Users className="w-4 h-4" /> Ver
                        </button>
                        <button
                          onClick={() => {
                            setSesionSeleccionadaParaRuleta(sesion.id);
                            setIsRuletaModalOpen(true);
                          }}
                          className="flex-[1_1_100%] sm:flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-100 border border-purple-100 transition-colors"   
                        >
                          <Dices className="w-4 h-4" /> Ruleta
                        </button>
                        <button
                          onClick={() => {
                            setSesionSeleccionadaParaGrupos(sesion.id);
                            setIsGruposModalOpen(true);
                          }}
                          className="flex-[1_1_100%] sm:flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-100 border border-teal-100 transition-colors"
                        >
                          <UsersRound className="w-4 h-4" /> Grupos
                        </button>
                        <button
                          onClick={() => setIsTimerModalOpen(true)}
                          className="flex-[1_1_100%] sm:flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-100 border border-orange-100 transition-colors"   
                        >
                          <Timer className="w-4 h-4" /> Tiempo
                        </button>
                        
                        <button
                          onClick={() => {
                            setSesionSeleccionadaParaQr(sesion.id);
                            setIsQrModalOpen(true);
                          }}
                          className="flex-[1_1_100%] sm:flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-[#2d7a5d]/10 text-[#2d7a5d] text-xs font-semibold rounded-lg hover:bg-[#2d7a5d]/20 border border-[#2d7a5d]/20 transition-colors"
                        >
                          <QrCode className="w-4 h-4" /> QR
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NuevaSesionModal
        isOpen={isNuevaSesionModalOpen}
        onClose={() => setIsNuevaSesionModalOpen(false)}
        claseId={claseSeleccionada}
        onSuccess={fetchSesiones}
      />

      <GenerarQRModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSesionSeleccionadaParaQr(null);
        }}
        sesionId={sesionSeleccionadaParaQr}
      />

      <DetallesSesionModal
        isOpen={isListaModalOpen}
        onClose={() => {
          setIsListaModalOpen(false);
          setSesionSeleccionadaParaLista(null);
        }}
        sesionId={sesionSeleccionadaParaLista}
      />

      <RuletaModal
        isOpen={isRuletaModalOpen}
        onClose={() => {
          setIsRuletaModalOpen(false);
          setSesionSeleccionadaParaRuleta(null);
        }}
        sesionId={sesionSeleccionadaParaRuleta}
      />

                  <GruposModal
        isOpen={isGruposModalOpen}
        onClose={() => {
          setIsGruposModalOpen(false);
          setSesionSeleccionadaParaGrupos(null);
        }}
        sesionId={sesionSeleccionadaParaGrupos}
      />

      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />
    </DashboardLayout>
  );
}