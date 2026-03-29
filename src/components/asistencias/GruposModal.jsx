import React, { useState, useEffect } from 'react';
import { X, Users, Shuffle, Award, RefreshCw, Send, CheckCircle, AlertCircle, Settings2, UserPlus } from 'lucide-react';
import { grupoService } from '../../services/grupo.service';

const GruposModal = ({ isOpen, onClose, sesionId, isSidePanel = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [grupos, setGrupos] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  
  const [limiteTipo, setLimiteTipo] = useState('grupos'); // 'grupos' o 'estudiantes'
  const [limiteCantidad, setLimiteCantidad] = useState(2);

  const [calificandoId, setCalificandoId] = useState(null);
  const [puntos, setPuntos] = useState('');
  const [descripcion, setDescripcion] = useState('Actividad grupal.');

  useEffect(() => {
    if (isOpen && sesionId) {
      cargarGrupos();
    } else {
      reiniciarEstado();
    }
  }, [isOpen, sesionId]);

  const reiniciarEstado = () => {
    setLoading(false);
    setError('');
    setSuccessMsg('');
    setGrupos([]);
    setShowConfig(false);
    setCalificandoId(null);
    setPuntos('');
    setDescripcion('Actividad grupal.');
  };

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await grupoService.obtenerGrupos(sesionId);
      
      if (data.grupos && data.grupos.length > 0) {
        setGrupos(data.grupos);
        setShowConfig(false);
      } else {
        setGrupos([]);
        setShowConfig(true); // Si no hay grupos, mostrar config por defecto
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al cargar los grupos.');
    } finally {
      setLoading(false);
    }
  };

  const generarNuevosGrupos = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      
      const data = await grupoService.generarGrupos(sesionId, {
        tipo: limiteTipo,
        cantidad: Number(limiteCantidad)
      });
      
      setGrupos(data.grupos || []);
      setShowConfig(false);
      setSuccessMsg('Grupos generados exitosamente.');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al generar los grupos. Verifica que haya estudiantes con asistencia.');
    } finally {
      setLoading(false);
    }
  };

  const calificarGrupo = async (grupoId) => {
    if (!puntos) return;
    
    try {
      setLoading(true);
      setError('');
      
      await grupoService.calificarGrupo(grupoId, {
        puntos: Number(puntos),
        descripcion
      });
      
      setSuccessMsg(`Se aplicó calificación al grupo exitosamente.`);
      setCalificandoId(null); // cerrar form
      setPuntos('');
      
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al calificar el grupo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={isSidePanel ? "fixed top-0 right-0 bottom-0 w-full sm:w-[600px] md:w-[800px] shadow-2xl z-[150] bg-white border-l border-gray-200 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right-8" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm"}>
      <div className={isSidePanel ? "w-full h-full flex flex-col overflow-hidden" : "bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]"}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <Users size={24} />
            <h2 className="text-xl font-bold">Módulo de Grupos Aleatorios</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 border border-green-100">
              <CheckCircle size={18} />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          )}

          {/* Panel de Configuración de Generación */}
          {showConfig ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto mt-4 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-700 mb-4 border-b border-emerald-100 pb-3">
                <Settings2 size={24} />
                <h3 className="text-lg font-bold">Configuración de Grupos</h3>
              </div>
              
              <div className="space-y-5 text-gray-700">
                <p className="text-sm">Se utilizará a los <strong>estudiantes que registraron asistencia</strong> hoy.</p>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Método de División</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <input 
                          type="radio" 
                          name="limiteTipo" 
                          value="grupos" 
                          checked={limiteTipo === 'grupos'}
                          onChange={() => setLimiteTipo('grupos')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm">Por Cantidad de Grupos</span>
                      </label>
                      <label className="flex items-center gap-2 flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <input 
                          type="radio" 
                          name="limiteTipo" 
                          value="estudiantes" 
                          checked={limiteTipo === 'estudiantes'}
                          onChange={() => setLimiteTipo('estudiantes')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm">Por Límite de Alumnos</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {limiteTipo === 'grupos' ? '¿Cuántos grupos deseas crear?' : '¿Cuántos alumnos máximo por grupo?'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={limiteCantidad}
                      onChange={(e) => setLimiteCantidad(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  {grupos.length > 0 && (
                     <button
                       onClick={() => setShowConfig(false)}
                       className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                     >
                       Cancelar
                     </button>
                  )}
                  <button
                    onClick={generarNuevosGrupos}
                    disabled={loading || limiteCantidad < 1}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                    Generar Ahora
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vista de Grupos */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                <p className="text-sm text-gray-600 font-medium mb-3 sm:mb-0">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold mr-2">{grupos.length}</span> 
                  Grupos creados para esta sesión
                </p>
              </div>

              {loading && !grupos.length ? (
                 <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-emerald-600" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grupos.map((grupo) => (
                    <div key={grupo.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col h-full">
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                             {grupo.id}
                           </div>
                           {grupo.nombre}
                        </h3>
                        {calificandoId !== grupo.id && (
                          <button
                            onClick={() => {
                              setCalificandoId(grupo.id);
                              setPuntos('');
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Calificar Grupo"
                          >
                            <Award size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="p-4 flex-1">
                        <ul className="space-y-3">
                           {grupo.Estudiantes?.map((est, i) => (
                             <li key={est.id} className="flex items-center gap-3 text-sm text-gray-700">
                               <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                                 {i + 1}
                               </span>
                               <div className="truncate">
                                  <p className="font-medium truncate" title={est.nombre}>{est.nombre}</p>
                                  <p className="text-xs text-gray-500">{est.carnet}</p>
                               </div>
                             </li>
                           ))}
                        </ul>
                      </div>

                      {/* Dropdown / Panel de Calificación in-card */}
                      {calificandoId === grupo.id && (
                        <div className="mt-auto border-t border-emerald-100 bg-emerald-50 p-4 animate-in slide-in-from-bottom-2 fade-in">
                          <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-wide">Calificar Integrantes</h4>
                          <div className="space-y-3">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Puntos a otorgar"
                              className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              value={puntos}
                              onChange={e => setPuntos(e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Motivo (ej. Buen trabajo)"
                              className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              value={descripcion}
                              onChange={e => setDescripcion(e.target.value)}
                            />
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => setCalificandoId(null)}
                                className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => calificarGrupo(grupo.id)}
                                disabled={!puntos || loading}
                                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GruposModal;
