import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { catedraticoService } from '../../services/catedratico.service';

export default function CatedraticoModal({ isOpen, onClose, catedratico, onSaved }) {
  const isEditing = !!catedratico;
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (catedratico) {
      setFormData({
        nombre: catedratico.nombre || '',
        correo: catedratico.correo || '',
        password: '' // No se carga la contraseña, se deja vacía
      });
    } else {
      setFormData({ nombre: '', correo: '', password: '' });
    }
  }, [catedratico, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // En edición, si la contraseña está vacía, no se envía
        const dataToSend = { nombre: formData.nombre, correo: formData.correo };
        if (formData.password.trim() !== '') {
          dataToSend.password = formData.password;
        }
        await catedraticoService.updateCatedratico(catedratico.id, dataToSend);
        toast.success('Catedrático actualizado exitosamente');
      } else {
        if (!formData.nombre || !formData.correo || !formData.password) {
          throw new Error('Todos los campos son obligatorios');
        }
        await catedraticoService.createCatedratico(formData);
        toast.success('Catedrático creado exitosamente');
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isEditing ? 'Editar Catedrático' : 'Nuevo Catedrático'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7a5d]/20 focus:border-[#2d7a5d] outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7a5d]/20 focus:border-[#2d7a5d] outline-none transition-all"
                  placeholder="ejemplo@universidad.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña {isEditing && <span className="text-gray-400 font-normal">(Opcional para mantener actual)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7a5d]/20 focus:border-[#2d7a5d] outline-none transition-all"
                  placeholder={isEditing ? "••••••••" : "Introduce una contraseña segura"}
                  required={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#201b18] hover:bg-[#322d2a] text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditing ? 'Guardar Cambios' : 'Crear Catedrático'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
