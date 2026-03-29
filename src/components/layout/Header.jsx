import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex-shrink-0 flex items-center justify-between px-6 z-20">
      <button 
        onClick={toggleSidebar} 
        className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-colors"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 leading-none mb-1">Catedrático</span>
            <span className="text-xs text-gray-500 leading-none">Profesor</span>
          </div>
          <div className="w-9 h-9 bg-green-50 text-[#2d7a5d] border border-green-200 rounded-full flex items-center justify-center font-bold text-sm">
            C
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-1.5 overflow-hidden origin-top-right transition-all">
            <div className="px-4 py-3 border-b border-gray-100/80 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900">Perfil de Usuario</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">conectado</p>
            </div>
            
            <div className="p-1.5">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl flex items-center gap-3 transition-colors">
                <User className="w-4 h-4 text-gray-400" /> Mi Cuenta
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl flex items-center gap-3 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" /> Configuración
              </button>
            </div>
            
            <div className="border-t border-gray-100 my-0.5"></div>
            
            <div className="p-1.5">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}