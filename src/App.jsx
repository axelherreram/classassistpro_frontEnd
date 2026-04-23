import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import MisClases from './components/clases/MisClases';
import DetalleClase from './components/clases/DetalleClase';
import Estudiantes from './components/estudiantes/Estudiantes';
import Asistencias from './components/asistencias/Asistencias';
import PantallaClase from './components/asistencias/PantallaClase';
import RegistroAsistencia from './components/asistencias/RegistroAsistencia';   
import Perfil from './components/perfil/Perfil';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  const isTokenExpired = (jwtToken) => {
    try {
      const payloadBase64 = jwtToken.split('.')[1];
      if (!payloadBase64) return true;
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTimestamp;
    } catch (e) {
      return true;
    }
  };

  if (!token || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro-asistencia" element={<RegistroAsistencia />} />

          {/* Rutas Privadas / Dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clases" element={<MisClases />} />
                  <Route path="/clases/:id" element={<DetalleClase />} />       
                  <Route path="/estudiantes" element={<Estudiantes />} />       
                  <Route path="/asistencias" element={<Asistencias />} />
                  <Route path="/proyectar/:sesionId" element={<PantallaClase />} />                  <Route path="/perfil" element={<Perfil />} />                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

