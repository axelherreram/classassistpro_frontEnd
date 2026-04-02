import { useState, useEffect } from 'react';
import { X, QrCode, Clock, Copy, Check, Users } from 'lucide-react';
import { asistenciaService } from '../../services/asistencia.service';
import { socket } from '../../services/socket.service';
import toast from 'react-hot-toast';

export default function GenerarQRModal({ isOpen, onClose, sesionId }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [asistenciasEnVivo, setAsistenciasEnVivo] = useState([]);

  useEffect(() => {
    if (isOpen && sesionId) {
      const fetchQR = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await asistenciaService.generarQR(sesionId);
          setQrData(data);

          // Conectar a WebSockets
          socket.connect();
          socket.emit('join-sesion', sesionId);

          const manejarNuevaAsistencia = (data) => {
            // Añadir al principio del arreglo para que salga de primera
            setAsistenciasEnVivo((prev) => [data, ...prev]);
            toast.success(`¡${data.Estudiante.nombre} registró su asistencia!`, {
              icon: '👋'
            });
          };

          socket.on('nueva-asistencia', manejarNuevaAsistencia);
        } catch (err) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchQR();

      return () => {
        socket.off('nueva-asistencia');
        socket.disconnect();
      };
    } else {
      setQrData(null);
      setAsistenciasEnVivo([]);
    }
  }, [isOpen, sesionId]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (qrData?.token) {
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const url = `${baseUrl}/registro-asistencia?token=${qrData.token}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => showSuccess())
          .catch(err => fallbackCopyTextToClipboard(url));
      } else {
        fallbackCopyTextToClipboard(url);
      }
    }
  };

  const showSuccess = () => {
    setCopied(true);
    toast.success('Enlace de asistencia copiado al portapapeles');
    setTimeout(() => setCopied(false), 3000);
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showSuccess();
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    } catch (err) {
      toast.error('Error al intentar copiar el enlace');
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] shadow-2xl overflow-y-auto animate-fade-in-up flex flex-col text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#2d7a5d]" />
            Código QR de Asistencia
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7a5d] mb-4"></div>
              <p className="text-gray-500">Generando código seguro...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-red-500">
              <p>{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : qrData ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-2xl border-4 border-[#2d7a5d] shadow-sm mb-4 inline-block">
                <img src={qrData.qrImage} alt="QR Sesion" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
              </div>
              
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Válido por {qrData.venceEn || '10 minutos'}
              </div>

              <p className="text-sm text-gray-500 mb-4 px-4">
                Pide a tus alumnos escanear este código QR para registrar su asistencia a esta sesión.
              </p>
              
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2d7a5d] hover:bg-[#2d7a5d]/10 rounded-lg transition-colors border border-[#2d7a5d]/20 mb-6"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar link manual'}
              </button>

              {/* Feed en vivo de Asistencias */}
              {asistenciasEnVivo.length > 0 && (
                <div className="w-full mt-4 border-t border-gray-100 pt-6 animate-fade-in text-left">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Registros en tiempo real ({asistenciasEnVivo.length})
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping-absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {asistenciasEnVivo.map((asist, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                           <img 
                             src={import.meta.env.VITE_API_URL.replace('/api', '') + asist.foto} 
                             alt="selfie" 
                             className="w-full h-full object-cover"
                             onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + asist.Estudiante.nombre; }}
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate" title={asist.Estudiante.nombre}>
                            {asist.Estudiante.nombre}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{asist.Estudiante.carnet}</p>
                        </div>
                        <div className="shrink-0 text-emerald-500">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}