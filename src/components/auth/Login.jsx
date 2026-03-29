import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.correo || !formData.password) {
        throw new Error('Por favor, ingresa tus credenciales.');
      }

      // Utilizando el servicio en lugar de llamar axios directamente
      const data = await authService.login(formData.correo, formData.password);
      
      // Guardar el token en localStorage
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      } else {
        localStorage.setItem('token', 'token_temporal_por_si_acaso');
      }
      
      toast.success('¡Bienvenido a ClassAssist!');
      // Redirigir al dashboard
      navigate('/dashboard');
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      {/* Panel Izquierdo - Información */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#201b18] text-white p-12 relative overflow-hidden">
        {/* Fondo punteado decorativo (simplificado con CSS radial-gradient) */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        ></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#322d2a] p-2 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-wide">ClassAssist</span>
        </div>

        <div className="relative z-10 max-w-lg mt-12 mb-auto">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Gestiona tus clases de forma inteligente
          </h1>
          <p className="text-gray-300 text-lg mb-12">
            La plataforma que simplifica la administración educativa para profesores y estudiantes.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="bg-[#322d2a] rounded-full p-1">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[15px]">Control de asistencia automatizado</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="bg-[#322d2a] rounded-full p-1">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[15px]">Gestión de calificaciones en tiempo real</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="bg-[#322d2a] rounded-full p-1">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[15px]">Comunicación directa con estudiantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  placeholder="catedratico@prueba.com"
                  className="block w-full pl-11 pr-3 py-2.5 bg-[#f4f7fb] border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-600/20 focus:border-green-600/30 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <a href="#" className="text-sm font-medium text-[#2d7a5d] hover:text-[#225d46]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-10 py-2.5 bg-green-50/30 border border-green-600/30 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-600/30 focus:border-green-600/50 transition-all sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#201b18] hover:bg-[#322d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#201b18] disabled:opacity-70 transition-colors mt-2"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
                  ¿Nuevo en ClassAssist?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full flex justify-center py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                Crear una cuenta
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="underline hover:text-gray-700">Términos de Servicio</a>
            {' '}y{' '}
            <a href="#" className="underline hover:text-gray-700">Política de Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;