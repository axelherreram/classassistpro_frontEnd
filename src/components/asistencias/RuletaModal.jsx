import React, { useState, useEffect, useRef } from 'react';
import { X, Dices, Award, RefreshCw, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { participacionService } from '../../services/participacion.service';

const RuletaModal = ({ isOpen, onClose, sesionId, isSidePanel = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [presentes, setPresentes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  
  // Estados de la animación
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentEstudiante, setCurrentEstudiante] = useState(null);
  const [spinCompleted, setSpinCompleted] = useState(false);
  
  // Formulario de calificación
  const [puntos, setPuntos] = useState('');
  const [descripcion, setDescripcion] = useState('Participación en clase.');
  const [calificando, setCalificando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Ref para el intervalo de animación
  const spinInterval = useRef(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (isOpen && sesionId) {
      cargarRuleta();
    } else {
      reiniciarEstado();
    }
    
    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current);
    };
  }, [isOpen, sesionId]);

  const reiniciarEstado = () => {
    setLoading(false);
    setError('');
    setSuccessMsg('');
    setPresentes([]);
    setSeleccionado(null);
    setIsSpinning(false);
    setCurrentEstudiante(null);
    setSpinCompleted(false);
    setPuntos('');
    setDescripcion('Participación en clase.');
    submitLockRef.current = false;
    if (spinInterval.current) clearInterval(spinInterval.current);
  };

  const cargarRuleta = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      setSpinCompleted(false);
      setSeleccionado(null);
      setCurrentEstudiante(null);
      
      const response = await participacionService.generarRuleta(sesionId);
      
      setPresentes(response.presentes || []);
      setSeleccionado(response.seleccionado);
      setCurrentEstudiante(response.presentes[0] || null);
    } catch (err) {
      console.error('Error al cargar ruleta:', err);
      setError(err.response?.data?.error || 'No se pudo cargar la ruleta. Asegúrate de que haya alumnos con asistencia.');
    } finally {
      setLoading(false);
    }
  };

  const iniciarRuleta = () => {
    if (!presentes.length || !seleccionado) return;
    
    setIsSpinning(true);
    setSpinCompleted(false);
    setSuccessMsg('');
    setError('');
    
    let counter = 0;
    const maxSpins = 30; // Número de veces que cambiará el nombre
    let delay = 50; // Velocidad inicial
    
    const spin = () => {
      counter++;
      
      // Mostrar un estudiante aleatorio de los presentes
      const randomIdx = Math.floor(Math.random() * presentes.length);
      setCurrentEstudiante(presentes[randomIdx]);
      
      if (counter >= maxSpins) {
        // Detener animación y mostrar al ganador real del backend
        clearInterval(spinInterval.current);
        setCurrentEstudiante(seleccionado);
        setIsSpinning(false);
        setSpinCompleted(true);
      } else {
        // Desacelerar poco a poco
        if (counter > 20) delay += 30;
        
        clearInterval(spinInterval.current);
        spinInterval.current = setInterval(spin, delay);
      }
    };
    
    // Iniciar el ciclo inicial
    spinInterval.current = setInterval(spin, delay);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!seleccionado || !puntos || submitLockRef.current) return;
    submitLockRef.current = true;
    
    try {
      setCalificando(true);
      setError('');
      
      await participacionService.registrarParticipacion(sesionId, {
        estudianteId: seleccionado.id,
        puntos: Number(puntos),
        descripcion
      });

      // Cerrar de inmediato para evitar esperas y dobles clics
      onClose();
      reiniciarEstado();
      
    } catch (err) {
      console.error('Error al guardar participación:', err);
      setError(err.response?.data?.error || 'Ocurrió un error al guardar la calificación.');
      submitLockRef.current = false;
    } finally {
      setCalificando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={isSidePanel ? "fixed top-0 right-0 bottom-0 w-full sm:w-[450px] shadow-2xl z-[150] bg-white border-l border-gray-200 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right-8" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm"}>
      <div className={isSidePanel ? "w-full h-full flex flex-col overflow-hidden" : "bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <Dices size={24} className={isSpinning ? "animate-spin" : ""} />
            <h2 className="text-xl font-bold">Ruleta de Participación</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            disabled={isSpinning}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500">Preparando ruleta...</p>
            </div>
          ) : error && !spinCompleted ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error al cargar</p>
                <p className="text-sm">{error}</p>
                <div className="mt-3">
                   <button 
                     onClick={onClose}
                     className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                   >
                     Cerrar
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Animation Box */}
              <div className={`relative overflow-hidden rounded-2xl border-4 transition-colors duration-500 ${
                spinCompleted ? 'border-green-500 bg-green-50 text-green-900' : 
                isSpinning ? 'border-purple-500 bg-purple-50 text-purple-900' : 
                'border-gray-200 bg-gray-50 text-gray-800'
              }`}>
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-70">
                    Estudiante Seleccionado
                  </p>
                  
                  {currentEstudiante ? (
                    <div className="space-y-2">
                      <h3 className={`text-3xl font-bold transition-all ${isSpinning ? 'scale-110 blur-[1px]' : 'scale-100'}`}>
                        {currentEstudiante.nombre}
                      </h3>
                      <p className="text-lg opacity-80 font-mono">
                        {currentEstudiante.carnet}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl italic opacity-60">¿Quién será el afortunado?</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              {!spinCompleted ? (
                <div className="flex justify-center">
                  <button
                    onClick={iniciarRuleta}
                    disabled={isSpinning || presentes.length === 0}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <RefreshCw className={isSpinning ? "animate-spin" : ""} size={24} />
                    {isSpinning ? 'Girando...' : '¡Girar Ruleta!'}
                  </button>
                </div>
              ) : (
                /* Grading Form */
                <form onSubmit={manejarEnvio} className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-2">
                      <Award size={20} />
                      <h4 className="font-semibold">Calificar Participación</h4>
                    </div>
                    
                    {error && (
                      <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                    
                    {successMsg && (
                      <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle size={16} />
                        {successMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puntos</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          value={puntos}
                          onChange={(e) => setPuntos(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0.0"
                          disabled={calificando}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
                        <input
                          type="text"
                          required
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej. Respondió pregunta clave"
                          disabled={calificando}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={calificando || !puntos}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                      >
                        {calificando ? (
                          <>
                            <RefreshCw className="animate-spin" size={18} />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Guardar Nota
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuletaModal;
