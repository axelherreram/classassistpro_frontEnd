import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Calendar, BookOpen, Plus, QrCode, CheckCircle2, Clock, Users, XCircle, Maximize, CheckCheck, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';
import { asistenciaService } from '../../services/asistencia.service';
import { useNavigate } from 'react-router-dom';
import NuevaSesionModal from './NuevaSesionModal';
import GenerarQRModal from './GenerarQRModal';
import DetallesSesionModal from './DetallesSesionModal';
import DesempenoModal from './DesempenoModal';

export default function Asistencias() {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [sesiones, setSesiones] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [finalizandoId, setFinalizandoId] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);

  // Modal Desempeño por sesión
  const [isDesempenoModalOpen, setIsDesempenoModalOpen] = useState(false);
  const [sesionSeleccionadaParaDesempeno, setSesionSeleccionadaParaDesempeno] = useState(null);

  // Modals
  const [isNuevaSesionModalOpen, setIsNuevaSesionModalOpen] = useState(false);  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [sesionSeleccionadaParaQr, setSesionSeleccionadaParaQr] = useState(null);

  const [isListaModalOpen, setIsListaModalOpen] = useState(false);
  const [sesionSeleccionadaParaLista, setSesionSeleccionadaParaLista] = useState(null);

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

  const handleFinalizarSesion = async (sesionId) => {
    try {
      setFinalizandoId(sesionId);
      await asistenciaService.finalizarSesion(sesionId);
      toast.success('Sesión finalizada correctamente');
      setConfirmandoId(null);
      // Actualizar estado localmente sin recargar todo
      setSesiones(prev =>
        prev.map(s => s.id === sesionId ? { ...s, estado: 'finalizada' } : s)
      );
    } catch (error) {
      toast.error(error.message || 'Error al finalizar la sesión');
    } finally {
      setFinalizandoId(null);
    }
  };

  const EstadoBadge = ({ estado }) => {
    if (estado === 'finalizada') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          <XCircle className="w-3 h-3" />
          Finalizada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Activa
      </span>
    );
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
                {sesiones.map((sesion) => {
                  const esFinalizada = sesion.estado === 'finalizada';
                  const estaConfirmando = confirmandoId === sesion.id;
                  const estaFinalizando = finalizandoId === sesion.id;

                  return (
                    <div
                      key={sesion.id}
                      className={`bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border transition-all flex flex-col ${
                        esFinalizada ? 'border-gray-200 opacity-80' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {/* Header: fecha + estado */}
                      <div className="flex justify-between items-start mb-3">    
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <Clock className="w-4 h-4 shrink-0" />
                          {new Date(sesion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <EstadoBadge estado={sesion.estado || 'creada'} />
                      </div>

                      {/* Tema */}
                      <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 min-h-[3.5rem]">
                        {sesion.tema || 'Sesión Regular'}
                      </h3>

                      {/* Acciones */}
                      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-50">
                        {/* Fila: Ver asistencias + QR + Proyectar */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerAsistencias(sesion.id)}       
                            className="flex-1 flex justify-center items-center gap-1 py-2 px-2 bg-[#f4f7fb] text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Users className="w-4 h-4" /> Ver
                          </button>
                          
                          <button
                            onClick={() => {
                              if (esFinalizada) {
                                toast.error('No puedes generar QR para una sesión finalizada.');
                                return;
                              }
                              setSesionSeleccionadaParaQr(sesion.id);
                              setIsQrModalOpen(true);
                            }}
                            disabled={esFinalizada}
                            className={`flex-1 flex justify-center items-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                              esFinalizada
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                : 'bg-[#2d7a5d]/10 text-[#2d7a5d] border-[#2d7a5d]/20 hover:bg-[#2d7a5d]/20'
                            }`}
                          >
                            <QrCode className="w-4 h-4" /> QR
                          </button>

                          <button
                            onClick={() => {
                              if (esFinalizada) {
                                toast.error('Esta sesión está finalizada.');
                                return;
                              }
                              navigate(`/dashboard/proyectar/${sesion.id}`);
                            }}
                            disabled={esFinalizada}
                            className={`flex-1 flex justify-center items-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors ${
                              esFinalizada
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'bg-[#2d7a5d] hover:bg-emerald-700 text-white'
                            }`}
                            title="Pantalla de Clase"
                          >
                            <Maximize className="w-3 h-3" /> Proyectar
                          </button>
                        </div>

                        {/* Botón finalizar */}
                        {!esFinalizada && (
                          estaConfirmando ? (
                            <div className="flex gap-2 animate-fade-in">
                              <button
                                onClick={() => setConfirmandoId(null)}
                                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleFinalizarSesion(sesion.id)}
                                disabled={estaFinalizando}
                                className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
                              >
                                {estaFinalizando ? (
                                  <span className="animate-pulse">Finalizando...</span>
                                ) : (
                                  <>
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Confirmar finalizar
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmandoId(sesion.id)}
                              className="w-full py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Finalizar Sesión
                            </button>
                          )
                        )}

                        {esFinalizada && (
                          <button
                            onClick={() => {
                              setSesionSeleccionadaParaDesempeno(sesion.id);
                              setIsDesempenoModalOpen(true);
                            }}
                            className="w-full flex justify-center items-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            Ver Desempeño de Sesión
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

      <DesempenoModal
        isOpen={isDesempenoModalOpen}
        onClose={() => {
          setIsDesempenoModalOpen(false);
          setSesionSeleccionadaParaDesempeno(null);
        }}
        sesionId={sesionSeleccionadaParaDesempeno}
      />
    </DashboardLayout>
  );
}