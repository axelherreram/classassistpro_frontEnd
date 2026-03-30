import { BookOpen, Users, Home, Calendar, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function Sidebar({ isOpen }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel de Control', path: '/dashboard', id: 'tour-dashboard' },   
    { icon: BookOpen, label: 'Mis Clases', path: '/dashboard/clases', id: 'tour-clases' },
    { icon: Users, label: 'Estudiantes', path: '/dashboard/estudiantes', id: 'tour-estudiantes' },      
    { icon: Calendar, label: 'Asistencias', path: '/dashboard/asistencias', id: 'tour-asistencias' },   
  ];

  const iniciarGuia = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Terminar',
      steps: [
        { 
          element: '#tour-dashboard', 
          popover: { 
            title: 'Panel de Control', 
            description: 'Aquí verás un resumen rápido de tus clases, estudiantes y estadísticas generales.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#tour-clases', 
          popover: { 
            title: 'Gestión de Clases', 
            description: 'Acá podrás crear tus materias, asignarles un nombre y describirlas.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#tour-estudiantes', 
          popover: { 
            title: 'Base de Datos de Alumnos', 
            description: 'Visualiza la lista de estudiantes inscritos, o impórtalos fácilmente usando un archivo Excel.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#tour-asistencias', 
          popover: { 
            title: 'Asistencias y Participación', 
            description: 'El núcleo de ClassAssist. Genera códigos QR, elige alumnos al azar con la ruleta y asigna calificaciones.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#tour-profile', 
          popover: { 
            title: 'Tu Cuenta', 
            description: 'Cambia tu contraseña, actualiza tu correo, o cierra sesión desde este menú.', 
            side: 'bottom', 
            align: 'end' 
          } 
        }
      ]
    });
    driverObj.drive();
  };

  return (
    <aside 
      className={`${
        isOpen ? 'w-64 sm:w-72' : 'w-20 hidden md:flex'
      } bg-[#201b18] h-full text-white transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 border-r border-[#322d2a]`}
    >
      <div className="h-16 flex items-center justify-center border-b border-[#322d2a] px-4">
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="bg-[#322d2a] p-2 rounded-xl flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <span className="font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden transition-all">
              ClassAssist
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
        {isOpen && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-2">
            Menú Principal
          </div>
        )}
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            id={item.id}
            end={item.path === '/dashboard'}
            title={!isOpen ? item.label : ""}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </div>
      
      {/* Mini banner al fondo si está abierto */}
      {isOpen && (
        <div className="p-4 mt-auto">
          <div className="bg-[#322d2a] rounded-2xl p-4 border border-white/5">
            <h4 className="text-sm font-semibold mb-1">¿Necesitas ayuda?</h4>
            <p className="text-xs text-gray-400 mb-3">Consulta la documentación de ClassAssist</p>
            <button 
              onClick={iniciarGuia}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg transition-colors"
            >
              Ver Guía
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}