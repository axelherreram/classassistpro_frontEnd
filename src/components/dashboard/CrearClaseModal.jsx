import { useState, useEffect } from 'react';
import { X, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';

export default function CrearClaseModal({ isOpen, onClose, onClaseCreada, claseAEditar = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);

  // Populate form if we have a class to edit
  useEffect(() => {
    if (claseAEditar && isOpen) {
      setFormData({
        nombre: claseAEditar.nombre || '',
        descripcion: claseAEditar.descripcion || ''
      });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
  }, [claseAEditar, isOpen]);

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
      if (!formData.nombre.trim()) {
        throw new Error('El nombre de la clase es obligatorio');
      }

      if (claseAEditar) {
        await claseService.actualizarClase(claseAEditar.id, formData);
        toast.success('Clase actualizada exitosamente');
      } else {
        await claseService.crearClase(formData.nombre, formData.descripcion);
        toast.success('Clase creada exitosamente');
      }
      
      // Limpiar formulario y cerrar on success
      setFormData({ nombre: '', descripcion: '' });
      onClaseCreada(); // Refrescar o notificar al padre
      onClose();
    } catch (err) {
      toast.error(err.message);
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
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="text-xl font-bold text-gray-900">
            {claseAEditar ? 'Editar Clase' : 'Nueva Clase'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre de la Clase *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Matemáticas Avanzadas"
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descripción (Opcional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Breve descripción del curso..."
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#201b18] border border-transparent text-white rounded-xl font-medium hover:bg-[#322d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#201b18] disabled:opacity-70 transition-colors"
              >
                {loading ? 'Guardando...' : (claseAEditar ? 'Guardar Cambios' : 'Crear Clase')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}