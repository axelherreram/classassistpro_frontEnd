import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import DashboardLayout from '../layout/DashboardLayout';

const Perfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const forceUpdate = location.state?.forceUpdate || false;

  const [formData, setFormData] = useState({
    correo: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (forceUpdate && !formData.newPassword) {
      toast.error('Debes ingresar una nueva contraseña obligatoriamente.');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {};
      if (formData.correo) dataToSubmit.correo = formData.correo;
      if (formData.newPassword) {
        dataToSubmit.oldPassword = formData.oldPassword;
        dataToSubmit.newPassword = formData.newPassword;
      }

      await authService.updateProfile(dataToSubmit);
      
      toast.success('Perfil actualizado correctamente');
      
      if (forceUpdate) {
         navigate('/dashboard');
      } else {
         // Resetear forms
         setFormData(prev => ({
           ...prev,
           oldPassword: '',
           newPassword: '',
           confirmPassword: ''
         }));
      }

    } catch (error) {
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-[#2d7a5d] text-white flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
              <p className="text-emerald-100 mt-1">Configura tus datos de acceso a ClassAssist</p>
            </div>
          </div>

          <div className="p-8">
            {forceUpdate && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
                <AlertTriangle className="shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold">Actualización de seguridad requerida</h3>
                  <p className="text-sm">
                    Estás usando credenciales por defecto. Por favor, personaliza tu correo o contraseña antes de continuar al sistema.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#2d7a5d]" />
                  Actualizar Correo (Opcional)
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nuevo Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="Dejar en blanco si no quieres cambiarlo"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d] transition-all"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#2d7a5d]" />
                  Actualizar Contraseña
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña Actual {forceUpdate && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      required={!!formData.newPassword || forceUpdate}
                      placeholder="Contraseña actual"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nueva contraseña"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-[#2d7a5d] hover:bg-[#225d46] text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70"
                >
                  <Save size={20} />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
