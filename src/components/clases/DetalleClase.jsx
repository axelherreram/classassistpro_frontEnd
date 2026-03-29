import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { ArrowLeft, Users, FileUp, Plus, UserPlus, Search, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';
import { estudianteService } from '../../services/estudiante.service';
import CrearEstudianteModal from '../estudiantes/CrearEstudianteModal';
import SubirExcelModal from '../estudiantes/SubirExcelModal';
import DesempenoModal from '../asistencias/DesempenoModal';
import Swal from 'sweetalert2';

export default function DetalleClase() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [clase, setClase] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAgregarModalOpen, setIsAgregarModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDesempenoModalOpen, setIsDesempenoModalOpen] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [claseData, estudiantesData] = await Promise.all([
        claseService.obtenerClasePorId(id),
        estudianteService.obtenerEstudiantesPorClase(id)
      ]);
      
      setClase(claseData.clase || claseData);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : estudiantesData.estudiantes || estudiantesData.data || []);
    } catch (error) {
      toast.error(error.message);
      if (error.message.includes('No encontrado') || error.message.includes('404')) {
        navigate('/dashboard/clases');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const estudiantesFiltrados = estudiantes.filter(est => 
    est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    est.carnet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoverEstudiante = (estId) => {
    Swal.fire({
      title: '¿Remover estudiante?',
      text: "El estudiante será desvinculado de esta clase.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, remover',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await estudianteService.removerEstudiante(id, estId);
          toast.success('Estudiante removido de la clase');
          cargarDatos();
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-8">
        {/* Botón Volver */}
        <button 
          onClick={() => navigate('/dashboard/clases')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Clases
        </button>

        {loading && !clase ? (
          <div className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse mb-8"></div>
        ) : (
          <div className="bg-[#201b18] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="relative z-10">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-emerald-500/30">
                Clase Activa
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{clase?.nombre}</h1>
              <p className="text-gray-400 text-lg max-w-2xl">{clase?.descripcion || 'Sin descripción asignada'}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Estudiantes Inscritos ({estudiantes.length})
          </h2>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDesempenoModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Desempeño</span>
            </button>
            <button 
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Carga Masiva</span>
            </button>
            <button 
              onClick={() => setIsAgregarModalOpen(true)}
              className="flex items-center gap-2 bg-[#2d7a5d] hover:bg-[#225d46] text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Alumno
            </button>
          </div>
        </div>

        {/* Buscador de estudiantes */}
        <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre o carnet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-3 py-2 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
            />
          </div>
        </div>

        {/* Tabla de Estudiantes */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Cargando estudiantes...</div>
          ) : estudiantesFiltrados.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sin estudiantes</h3>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                {searchTerm ? 'No hay resultados para tu búsqueda.' : 'Aún no hay estudiantes en esta clase. Agrega uno manualmente o sube un archivo Excel.'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setIsExcelModalOpen(true)}
                  className="text-[#2d7a5d] font-semibold hover:text-[#225d46] transition-colors text-sm"
                >
                  Subir archivo Excel
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="py-3 px-6">Carnét</th>
                    <th className="py-3 px-6">Nombre Completo</th>
                    <th className="py-3 px-6">Correo</th>
                    <th className="py-3 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {estudiantesFiltrados.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                        {/* <div className="w-8 h-8 rounded-full bg-[#f4f7fb] text-gray-600 flex items-center justify-center text-xs font-bold">
                          {estudiante.carnet.substring(0, 2)}
                        </div> */}
                        {estudiante.carnet}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{estudiante.nombre}</td>
                      <td className="py-4 px-6 text-gray-500">{estudiante.correo || '-'}</td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <button 
                          onClick={() => handleRemoverEstudiante(estudiante.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CrearEstudianteModal 
        isOpen={isAgregarModalOpen} 
        onClose={() => setIsAgregarModalOpen(false)} 
        claseId={id} 
        onSuccess={cargarDatos} 
      />

      <SubirExcelModal 
        isOpen={isExcelModalOpen} 
        onClose={() => setIsExcelModalOpen(false)} 
        claseId={id} 
        onSuccess={cargarDatos} 
      />
    
      <DesempenoModal
        isOpen={isDesempenoModalOpen}
        onClose={() => setIsDesempenoModalOpen(false)}
        claseId={id}
      />
    </DashboardLayout>
  );
}