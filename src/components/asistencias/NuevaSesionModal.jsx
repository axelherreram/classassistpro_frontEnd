import { useState } from 'react';
import { X, Calendar as CalendarIcon, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { asistenciaService } from '../../services/asistencia.service';

export default function NuevaSesionModal({ isOpen, onClose, claseId, onSuccess }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    tema: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await asistenciaService.crearSesion({
        claseId: parseInt(claseId, 10),
        fecha: formData.fecha,
        tema: formData.tema
      });
      toast.success('Sesión iniciada correctamente');
      setFormData({ fecha: new Date().toISOString().split('T')[0], tema: '' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="text-xl font-bold text-gray-900">Iniciar Nueva Sesión</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tema u Objetivo (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="tema"
                  value={formData.tema}
                  onChange={(e) => setFormData({...formData, tema: e.target.value})}
                  placeholder="Ej. Introducción a React"
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#2d7a5d] border border-transparent text-white rounded-xl font-medium hover:bg-[#225d46] disabled:opacity-70 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}