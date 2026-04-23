import { useState } from 'react';
import { X, User, Hash, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { estudianteService } from '../../services/estudiante.service';

export default function CrearEstudianteModal({ isOpen, onClose, claseId, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    carnet: '',
    correo: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nombre.trim() || !formData.carnet.trim()) {
        throw new Error('El nombre y carnet son obligatorios');
      }

      await estudianteService.crearEstudiante(claseId, formData);
      toast.success('Estudiante añadido a la clase');
      
      setFormData({ nombre: '', carnet: '', correo: '' });
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
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Añadir Estudiante</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de Carné *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="carnet"
                  value={formData.carnet}
                  onChange={handleChange}
                  required
                  placeholder="Ej. 1890-xx-xxx"
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="estudiante@ejemplo.com"
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
                className="flex-1 px-4 py-2.5 bg-[#201b18] border border-transparent text-white rounded-xl font-medium hover:bg-[#322d2a] disabled:opacity-70 transition-colors"
              >
                {loading ? 'Guardando...' : 'Añadir Estudiante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}