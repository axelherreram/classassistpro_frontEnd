import { useState, useEffect } from 'react';
import { X, Users, UserCheck, Clock, Download, Search, Award, UsersRound, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { asistenciaService } from '../../services/asistencia.service';
import { participacionService } from '../../services/participacion.service';
import { grupoService } from '../../services/grupo.service';

export default function DetallesSesionModal({ isOpen, onClose, sesionId }) {
  const [activeTab, setActiveTab] = useState('asistencias'); // 'asistencias', 'participaciones', 'grupos'
  const [dataAsistencias, setDataAsistencias] = useState(null);
  const [dataParticipaciones, setDataParticipaciones] = useState([]);
  const [dataGrupos, setDataGrupos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !sesionId) {
      setActiveTab('asistencias');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (activeTab === 'asistencias') {
          const result = await asistenciaService.obtenerAsistencias(sesionId);
          setDataAsistencias(result);
        } else if (activeTab === 'participaciones') {
          const result = await participacionService.obtenerParticipaciones(sesionId);
          setDataParticipaciones(result.participaciones || []);
        } else if (activeTab === 'grupos') {
          const result = await grupoService.obtenerGrupos(sesionId);
          setDataGrupos(result.grupos || []);
        }
      } catch (error) {
        toast.error(`Error al cargar ${activeTab}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, sesionId, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header estático */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-[#2d7a5d] text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Detalles de la Sesión
              </h2>
              {dataAsistencias && dataAsistencias.sesion && (
                <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(dataAsistencias.sesion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                  — {dataAsistencias.sesion.tema}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-black/10 p-1.5 rounded-xl overflow-x-auto w-full sm:w-auto sm:self-start scrollbar-hide">
            <button
              onClick={() => setActiveTab('asistencias')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'asistencias' ? 'bg-white text-[#2d7a5d] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" /> Asistencias
            </button>
            <button
              onClick={() => setActiveTab('participaciones')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'participaciones' ? 'bg-white text-[#2d7a5d] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4" /> Participaciones
            </button>
            <button
              onClick={() => setActiveTab('grupos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'grupos' ? 'bg-white text-[#2d7a5d] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <UsersRound className="w-4 h-4" /> Grupos Formados
            </button>
          </div>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
          {isLoading ? (
            <div className="m-auto flex flex-col items-center justify-center text-gray-400 animate-pulse">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* TAB ASISTENCIAS */}
              {activeTab === 'asistencias' && (
                <>
                  {!dataAsistencias || !dataAsistencias.asistencias || dataAsistencias.asistencias.length === 0 ? (
                    <div className="m-auto text-center py-16 bg-white rounded-2xl border border-gray-200 w-full max-w-2xl">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-700">Nadie ha registrado asistencia</h3>
                      <p className="text-gray-500 mt-2">Los alumnos aparecerán aquí cuando escaneen el código QR.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full font-bold">
                            {dataAsistencias.totalAsistentes}
                          </div>
                          <div>
                            <h4 className="text-gray-700 font-bold">Total Asistentes</h4>
                            <span className="text-sm text-gray-500">Han verificado su asistencia</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dataAsistencias.asistencias.map((asistencia) => (
                          <div key={asistencia.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-100 shrink-0 relative group">
                              {asistencia.foto ? (
                                <>
                                  <img
                                    src={import.meta.env.VITE_API_URL.replace('/api', '') + asistencia.foto}
                                    alt={`Selfie`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (asistencia.Estudiante?.nombre || 'X') + '&background=random' }}
                                  />
                                  <a href={import.meta.env.VITE_API_URL.replace('/api', '') + asistencia.foto} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Search className="text-white w-6 h-6" />
                                  </a>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <UserCheck className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-bold text-gray-900 truncate" title={asistencia.Estudiante?.nombre}>
                                  {asistencia.Estudiante?.nombre || 'Estudiante'}
                                </h4>
                                {asistencia.tarde && (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 shrink-0">
                                    TARDE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 font-medium">Carné: {asistencia.Estudiante?.carnet}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(asistencia.createdAt).toLocaleTimeString('es-ES', {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* TAB PARTICIPACIONES */}
              {activeTab === 'participaciones' && (
                <>
                  {!dataParticipaciones || dataParticipaciones.length === 0 ? (
                    <div className="m-auto text-center py-16 bg-white rounded-2xl border border-gray-200 w-full max-w-2xl">
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-700">No hay participaciones evaluadas</h3>
                      <p className="text-gray-500 mt-2">Usa la Ruleta o la calificación de Grupos para evaluar alumnos.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dataParticipaciones.map((part) => (
                        <div key={part.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
                          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl font-bold text-lg shrink-0">
                            +{part.puntos}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {part.Estudiante?.nombre || 'Estudiante eliminado'}
                            </h4>
                            <p className="text-sm text-gray-500 mb-1">Carné: {part.Estudiante?.carnet}</p>
                            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span className="font-medium text-gray-500">Motivo:</span> {part.descripcion}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 sm:self-start">
                            <Clock className="w-3 h-3" />
                            {new Date(part.createdAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB GRUPOS */}
              {activeTab === 'grupos' && (
                <>
                  {!dataGrupos || dataGrupos.length === 0 ? (
                    <div className="m-auto text-center py-16 bg-white rounded-2xl border border-gray-200 w-full max-w-2xl">
                      <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersRound className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-700">No se han formado grupos</h3>
                      <p className="text-gray-500 mt-2">Ve al módulo de Grupos para organizar a los estudiantes presentes.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataGrupos.map((grupo) => (
                        <div key={grupo.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm flex flex-col h-full">
                          <div className="p-4 bg-teal-50 border-b border-teal-100">
                            <h3 className="font-bold text-teal-900 text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white text-teal-700 flex items-center justify-center text-sm shadow-sm">
                                {grupo.id}
                              </div>
                              {grupo.nombre}
                            </h3>
                          </div>
                          <div className="p-4 flex-1">
                            <ul className="space-y-3">
                              {grupo.Estudiantes?.map((est, i) => (
                                <li key={est.id} className="flex items-center gap-3 text-sm text-gray-700">
                                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                                    {i + 1}
                                  </span>
                                  <div className="truncate">
                                    <p className="font-medium text-gray-900 truncate" title={est.nombre}>{est.nombre}</p>
                                    <p className="text-xs text-gray-500">{est.carnet}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
