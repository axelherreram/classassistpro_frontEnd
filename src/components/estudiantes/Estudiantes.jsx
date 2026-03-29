import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Users, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { claseService } from '../../services/clase.service';
import { estudianteService } from '../../services/estudiante.service';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Estudiantes() {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Cargar las clases
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoadingClases(true);
        const data = await claseService.obtenerClases();
        const listaClases = data.clases || data || [];
        setClases(listaClases);

        // Auto-seleccionar la primera clase si hay
        if (listaClases.length > 0) {
          setClaseSeleccionada(listaClases[0].id.toString());
        }
      } catch (error) {
        toast.error('Error al cargar las clases');
      } finally {
        setLoadingClases(false);
      }
    };
    fetchClases();
  }, []);

  // 2. Cargar estudiantes cuando cambia la clase seleccionada
  useEffect(() => {
    if (!claseSeleccionada) return;

    const fetchEstudiantes = async () => {
      try {
        setLoadingEstudiantes(true);
        const data = await estudianteService.obtenerEstudiantesPorClase(claseSeleccionada);
        setEstudiantes(Array.isArray(data) ? data : data.estudiantes || data.data || []);
      } catch (error) {
        toast.error('Error al cargar los estudiantes');
        setEstudiantes([]);
      } finally {
        setLoadingEstudiantes(false);
      }
    };

    fetchEstudiantes();
  }, [claseSeleccionada]);

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
          await estudianteService.removerEstudiante(claseSeleccionada, estId);
          toast.success('Estudiante removido de la clase');
          // Actualizar estudiantes filtrados localmente o recargar
          setEstudiantes(estudiantes.filter(est => est.id !== estId));
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-8">
        <div className="bg-[#201b18] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              Directorio de Estudiantes
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Selecciona una clase para ver y gestionar la lista completa de sus estudiantes inscritos.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filtrar por Clase
          </label>
          {loadingClases ? (
            <div className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>
          ) : clases.length === 0 ? (
            <div className="text-gray-500 py-2">
              No tienes clases creadas aún.{' '}
              <button onClick={() => navigate('/dashboard/clases')} className="text-[#2d7a5d] hover:underline font-medium">Crear una clase</button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={claseSeleccionada}
                onChange={(e) => setClaseSeleccionada(e.target.value)}
                className="block w-full pl-11 pr-10 py-3 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2d7a5d]/30 focus:border-[#2d7a5d]/50 transition-all font-medium appearance-none"
              >
                {clases.map((clase) => (
                  <option key={clase.id} value={clase.id}>
                    {clase.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          )}
        </div>

        {claseSeleccionada && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#f4f7fb] px-3 py-1 rounded-lg text-[#2d7a5d] text-sm">
                  {estudiantes.length}
                </span>
                Estudiantes Inscritos
              </h2>
              
              <div className="bg-white p-2 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex-1 max-w-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
              {loadingEstudiantes ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Cargando lista de estudiantes...</div>
              ) : estudiantesFiltrados.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-4">
                    {searchTerm ? 'Ningún estudiante coincide con tu búsqueda.' : 'No hay estudiantes matriculados en esta clase.'}
                  </p>
                  {!searchTerm && (
                    <button 
                      onClick={() => navigate(`/dashboard/clases/${claseSeleccionada}`)}
                      className="px-5 py-2.5 bg-[#2d7a5d] text-white rounded-xl font-medium hover:bg-[#225d46] transition-colors"
                    >
                      Ir a editar clase para añadir
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="py-4 px-6">Carnét</th>
                        <th className="py-4 px-6">Nombre Completo</th>
                        <th className="py-4 px-6">Correo</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {estudiantesFiltrados.map((estudiante) => (
                        <tr key={estudiante.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                            {/* <div className="w-8 h-8 rounded-full bg-[#2d7a5d]/10 text-[#2d7a5d] flex items-center justify-center text-xs font-bold">
                              {estudiante.carnet.substring(0, 2)}
                            </div> */}
                            {estudiante.carnet}
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-medium">{estudiante.nombre}</td>
                          <td className="py-4 px-6 text-gray-500">{estudiante.correo || '-'}</td>
                          <td className="py-4 px-6 text-right">
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}