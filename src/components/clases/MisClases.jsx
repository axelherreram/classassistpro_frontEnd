import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { BookOpen, Plus, MoreVertical, Trash2, Edit, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';
import CrearClaseModal from '../dashboard/CrearClaseModal';
import Swal from 'sweetalert2';

export default function MisClases() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claseAEditar, setClaseAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  const cargarClases = async () => {
    try {
      setLoading(true);
      const data = await claseService.obtenerClases();
      // Asegurarse de que data sea un arreglo (dependiendo de la estructura exacta de tu backend)
      setClases(Array.isArray(data) ? data : data.clases || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  const handleEliminarClase = async (id, nombre) => {
    Swal.fire({
      title: '¿Eliminar clase?',
      html: `Estás a punto de eliminar la clase <b>"${nombre}"</b>.<br/>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await claseService.eliminarClase(id);
          toast.success(`Clase "${nombre}" eliminada correctamente`);
          cargarClases(); // Recargar la lista
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  const handleAbrirModalCrear = () => {
    setClaseAEditar(null);
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (clase) => {
    setClaseAEditar(clase);
    setIsModalOpen(true);
  };

  // Filtrado de clases
  const clasesFiltradas = clases.filter(clase => 
    clase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (clase.descripcion && clase.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-8">
        {/* Header de la sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Clases</h1>
            <p className="text-gray-500 mt-1">
              Gestiona todas tus asignaturas, alumnos y asistencias desde aquí.
            </p>
          </div>
          
          <button 
            onClick={handleAbrirModalCrear}
            className="flex items-center gap-2 bg-[#2d7a5d] hover:bg-[#225d46] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap w-fit shrink-0"
          >
            <Plus className="w-5 h-5" />
            Nueva Clase
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar clase por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all sm:text-sm"
            />
          </div>
        </div>

        {/* Contenido / Estado de carga */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-3xl p-6 border border-gray-100 h-48 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded-md mb-3"></div>
                <div className="w-full h-4 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : clasesFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron clases</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {searchTerm 
                ? 'No hay clases que coincidan con tu búsqueda. Intenta con otros términos.'
                : 'Aún no has creado ninguna clase. Comienza agregando tu primera materia.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAbrirModalCrear}
                className="text-[#2d7a5d] font-semibold hover:text-[#225d46] transition-colors"
              >
                + Crear primera clase
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clasesFiltradas.map((clase) => (
              <div 
                key={clase.id} 
                className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-[#2d7a5d] p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {/* Badge de estado */}
                    <span 
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        clase.activo 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' 
                          : 'bg-red-50 text-red-600 border-red-200/50'
                      }`}
                    >
                      {clase.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  {/* Menú de Opciones (Simple en hover para desktop) */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirModalEditar(clase);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#2d7a5d] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarClase(clase.id, clase.nombre);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" title={clase.nombre}>
                  {clase.nombre}
                </h3>
                
                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">
                  {clase.descripcion || 'Sin descripción'}
                </p>
                
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <button 
                    onClick={() => navigate(`/dashboard/clases/${clase.id}`)}
                    className="w-full text-center text-sm font-medium text-[#2d7a5d] hover:text-[#225d46] transition-colors py-1"
                  >
                    Ver Detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CrearClaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClaseCreada={cargarClases} 
        claseAEditar={claseAEditar}
      />
    </DashboardLayout>
  );
}