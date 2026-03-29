import { useState, useEffect } from 'react';
import { X, QrCode, Clock, Copy, Check } from 'lucide-react';
import { asistenciaService } from '../../services/asistencia.service';
import toast from 'react-hot-toast';

export default function GenerarQRModal({ isOpen, onClose, sesionId }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && sesionId) {
      const fetchQR = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await asistenciaService.generarQR(sesionId);
          setQrData(data);
        } catch (err) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchQR();
    } else {
      setQrData(null);
    }
  }, [isOpen, sesionId]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (qrData?.token) {
      // In a real scenario, this would be your external frontend route for students
      // We will read VITE_FRONTEND_URL. If omitted fallback to current window location origin
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const url = `${baseUrl}/registro-asistencia?token=${qrData.token}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Enlace de asistencia copiado al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up flex flex-col text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2d7a5d] hover:bg-[#2d7a5d]/10 rounded-lg transition-colors border border-[#2d7a5d]/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar link manual'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}