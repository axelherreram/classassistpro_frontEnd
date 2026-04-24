import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ShieldAlert, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { catedraticoService } from '../../services/catedratico.service';
import CatedraticoModal from './CatedraticoModal';
import DashboardLayout from '../layout/DashboardLayout';

export default function Catedraticos() {
  const [catedraticos, setCatedraticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatedratico, setSelectedCatedratico] = useState(null);

  const fetchCatedraticos = async () => {
    try {
      setLoading(true);
      const data = await catedraticoService.getCatedraticos();
      setCatedraticos(data);
    } catch (error) {
      toast.error('No se pudieron cargar los catedráticos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatedraticos();
  }, []);

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await catedraticoService.deleteCatedratico(id);
        toast.success('Catedrático eliminado exitosamente');
        fetchCatedraticos();
      } catch (error) {
        toast.error('No se pudo eliminar al catedrático');
      }
    }
  };

  const handleEdit = (catedratico) => {
    setSelectedCatedratico(catedratico);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCatedratico(null);
    setIsModalOpen(true);
  };

  const filteredCatedraticos = catedraticos.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Catedráticos</h1>
          <p className="text-gray-500 mt-1">Administra los accesos y credenciales de los profesores.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-[#201b18] hover:bg-[#322d2a] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Catedrático</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7a5d]/20 focus:border-[#2d7a5d] transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#2d7a5d]/30 border-t-[#2d7a5d] rounded-full animate-spin" />
                      <p>Cargando catedráticos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCatedraticos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron catedráticos.
                  </td>
                </tr>
              ) : (
                filteredCatedraticos.map((catedratico) => (
                  <tr key={catedratico.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-[#2d7a5d] p-2 rounded-lg">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{catedratico.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{catedratico.correo}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        catedratico.rol === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {catedratico.rol === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                        {catedratico.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(catedratico)}
                          className="p-2 text-gray-400 hover:text-[#2d7a5d] hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(catedratico.id, catedratico.nombre)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CatedraticoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        catedratico={selectedCatedratico}
        onSaved={fetchCatedraticos}
      />
      </div>
    </DashboardLayout>
  );
}
