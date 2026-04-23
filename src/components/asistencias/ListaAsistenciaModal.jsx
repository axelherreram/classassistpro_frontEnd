import { useState, useEffect } from 'react';
import { X, Users, UserCheck, Clock, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { asistenciaService } from '../../services/asistencia.service';

export default function ListaAsistenciaModal({ isOpen, onClose, sesionId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !sesionId) return;

    const fetchAsistencias = async () => {
      try {
        setIsLoading(true);
        const result = await asistenciaService.obtenerAsistencias(sesionId);
        setData(result);
      } catch (error) {
        toast.error('Error al cargar la lista de asistentes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsistencias();
  }, [isOpen, sesionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header estático */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#2d7a5d] text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Asistencias de la Sesión
            </h2>
            {data && data.sesion && (
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                {new Date(data.sesion.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })} 
                — {data.sesion.tema}
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

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
              <UserCheck className="w-12 h-12 mb-4 text-emerald-500 opacity-50" />
              <p className="text-lg font-medium">Cargando lista de asistentes...</p>
            </div>
          ) : !data || !data.asistencias || data.asistencias.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Nadie ha registrado asistencia</h3>
              <p className="text-gray-500 mt-2">Los alumnos aparecerán aquí cuando escaneen el código QR.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full font-bold">
                    {data.totalAsistentes}
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-bold">Total Asistentes</h4>
                    <span className="text-sm text-gray-500">Han verificado su asistencia</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.asistencias.map((asistencia) => (
                  <div key={asistencia.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Selfie de verificación */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-100 shrink-0 relative group">
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

                    {/* Datos del estudiante */}
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="font-bold text-gray-900 truncate" title={asistencia.Estudiante?.nombre}>
                        {asistencia.Estudiante?.nombre || 'Estudiante'}
                      </h4>
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
        </div>
      </div>
    </div>
  );
}
