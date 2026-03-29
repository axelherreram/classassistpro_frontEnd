import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Dices, UsersRound, Timer, Activity, ChevronLeft, Maximize, Clock, Users, X, Trophy } from 'lucide-react';
import { asistenciaService } from '../../services/asistencia.service';

// Import our existing modals to use them in "modal mode" from the dashboard, 
// OR we can import them and render them.
import RuletaModal from './RuletaModal';
import GruposModal from './GruposModal';
import TimerModal from './TimerModal';
import DesempenoModal from './DesempenoModal';

import DetallesSesionModal from './DetallesSesionModal';
// We'll reimplement the QR and Noise meter natively here for better UX 
import toast from 'react-hot-toast';

export default function PantallaClase() {
  const { sesionId } = useParams();
  const navigate = useNavigate();
  
  const [activeTool, setActiveTool] = useState('home'); // home, qr, ruleta, grupos, timer, noise
  
  // Modals state (if we use modals)
  const [isRuletaOpen, setIsRuletaOpen] = useState(false);
  const [isGruposOpen, setIsGruposOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isDesempenoOpen, setIsDesempenoOpen] = useState(false);
  
  // QR State
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  
  // Noise Meter State
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const rafRef = useRef(null);

  // Funciones de Ruido
  const startNoiseMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      setIsRecording(true);
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateNoise = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0 to 100 roughly
        setNoiseLevel(Math.min(100, Math.round((average / 128) * 100)));
        rafRef.current = requestAnimationFrame(updateNoise);
      };
      updateNoise();
    } catch (err) {
      toast.error('No se pudo acceder al micrófono');
      console.error(err);
    }
  };

  const stopNoiseMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (microphoneRef.current) microphoneRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsRecording(false);
    setNoiseLevel(0);
  };

  useEffect(() => {
    // Only stop when leaving noise tab, but do not auto start
    if (activeTool !== 'noise' && isRecording) {
      stopNoiseMeter();
    }
    return () => {
      if (isRecording) stopNoiseMeter();
    };
  }, [activeTool, isRecording]);

  // QR Loader
  const loadQR = async () => {
    setQrLoading(true);
    try {
      const data = await asistenciaService.generarQR(sesionId);
      setQrData(data);
    } catch (err) {
      toast.error('Error al generar QR');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    if (activeTool === 'qr' && !qrData) {
      loadQR();
    }
  }, [activeTool]);
  
  const handleToolClick = (tool) => {
    setActiveTool(tool);
    setIsRuletaOpen(tool === 'ruleta');
    setIsGruposOpen(tool === 'grupos');
    setIsTimerOpen(tool === 'timer');
    setIsDesempenoOpen(tool === 'desempeno');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const TopBar = () => (
    <div className="flex justify-between items-center bg-gray-900 text-white p-4 shadow-md z-10 relative">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2">
          <ChevronLeft className="w-6 h-6" /> <span className="hidden sm:inline">Volver</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Pantalla de Clase</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={toggleFullscreen} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors" title="Pantalla Completa">
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 z-[100] font-sans h-screen w-screen overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Dock */}
        <div className="w-20 md:w-28 bg-gray-900 border-t border-gray-800 flex flex-col items-center py-6 gap-6 shadow-2xl z-10 shrink-0">
          <MenuButton 
            icon={<QrCode />} label="QR" 
            active={activeTool === 'qr'} 
            onClick={() => handleToolClick('qr')} 
            color="text-emerald-400"
          />
          <MenuButton 
            icon={<Dices />} label="Ruleta" 
            active={activeTool === 'ruleta'} 
            onClick={() => handleToolClick('ruleta')} 
            color="text-purple-400"
          />
          <MenuButton 
            icon={<UsersRound />} label="Grupos" 
            active={activeTool === 'grupos'} 
            onClick={() => handleToolClick('grupos')} 
            color="text-teal-400"
          />
          <MenuButton 
            icon={<Timer />} label="Tiempo" 
            active={activeTool === 'timer'} 
            onClick={() => handleToolClick('timer')} 
            color="text-orange-400"
          />
          <MenuButton 
            icon={<Trophy />} label="Desempeño" 
            active={activeTool === 'desempeno'} 
            onClick={() => handleToolClick('desempeno')} 
            color="text-yellow-400"
          />
          <MenuButton 
            icon={<Activity />} label="Ruido" 
            active={activeTool === 'noise'} 
            onClick={() => handleToolClick('noise')} 
            color="text-red-400"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 relative p-4 sm:p-10">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

          {activeTool === 'home' && (
            <div className="text-center text-white animate-fade-in z-10">
              <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
                Bienvenido a la Clase
              </h2>
              <p className="text-lg sm:text-2xl text-gray-400">Selecciona una herramienta del panel lateral para proyectar.</p>
            </div>
          )}

          {activeTool === 'qr' && (
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-2xl w-full animate-fade-in z-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Asistencia</h2>
              <p className="text-gray-500 mb-8 max-w-md">Escanea este código con la cámara de tu teléfono para registrar asistencia</p>
              
              {qrLoading ? (
                 <div className="w-64 h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div></div>
              ) : qrData ? (
                <>
                  <div className="bg-white p-4 rounded-3xl border-8 border-emerald-500 shadow-xl mb-6 inline-block transform hover:scale-105 transition-transform duration-500">
                    <img src={qrData.qrImage} alt="QR Sesion" className="w-64 h-64 sm:w-80 sm:h-80 object-contain" />
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-2xl text-lg font-bold">
                    <Clock className="w-6 h-6" /> Válido por {qrData.venceEn || '10 minutos'}
                  </div>
                </>
              ) : (
                <div className="text-red-500">No se pudo cargar el QR</div>
              )}
            </div>
          )}

          {activeTool === 'noise' && (
            <div className="flex flex-col items-center justify-center w-full max-w-3xl animate-fade-in z-10">
              <div className="flex flex-col items-center mb-12 gap-6">
                <h2 className="text-5xl font-bold text-white flex items-center gap-4">
                  <Activity className={`w-12 h-12 ${noiseLevel > 75 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                Medidor de Ruido
                </h2>
                <button
                  onClick={isRecording ? stopNoiseMeter : startNoiseMeter}
                  className={`px-6 py-2 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {isRecording ? 'Apagar Micrófono' : 'Encender Micrófono'}
                </button>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-24 p-2 shadow-inner overflow-hidden border border-gray-700">
                <div 
                  className={`h-full rounded-full transition-all duration-150 ease-out flex items-center justify-end px-4 ${
                    noiseLevel < 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 
                    noiseLevel < 75 ? 'bg-gradient-to-r from-green-400 to-amber-500' : 
                    'bg-gradient-to-r from-amber-500 to-red-600'
                  }`}
                  style={{ width: `${Math.max(5, noiseLevel)}%` }}
                >
                  {noiseLevel > 15 && <span className="text-white/80 font-bold text-xl drop-shadow-md">{noiseLevel}%</span>}
                </div>
              </div>
              
              <div className="mt-8 text-center bg-gray-800/80 backdrop-blur px-8 py-4 rounded-3xl border border-gray-700/50">
                <p className="text-2xl font-medium text-gray-300">
                  {noiseLevel < 40 ? ' Silencio perfecto ' : 
                   noiseLevel < 70 ? ' Nivel de ruido aceptable ' : 
                   ' ¡Demasiado ruido! '}
                </p>
              </div>
            </div>
          )}

          {/* Placeholder for when Modals are open, showing what tool is active in background */}
          {(activeTool === 'ruleta' || activeTool === 'grupos' || activeTool === 'timer' || activeTool === 'desempeno' || activeTool === 'desempeno') && (
            <div className="text-white z-10 flex flex-col items-center opacity-50">
               {activeTool === 'ruleta' && <Dices className="w-32 h-32 mb-4 text-purple-400" />}
               {activeTool === 'grupos' && <UsersRound className="w-32 h-32 mb-4 text-teal-400" />}
               {activeTool === 'timer' && <Timer className="w-32 h-32 mb-4 text-orange-400" />}
               {activeTool === 'desempeno' && <Trophy className="w-32 h-32 mb-4 text-yellow-400" />}
               {activeTool === 'desempeno' && <Trophy className="w-32 h-32 mb-4 text-yellow-400" />}
               <h2 className="text-3xl font-bold">Usando herramienta...</h2>
               <button 
                 onClick={() => {
                   if(activeTool === 'ruleta') setIsRuletaOpen(true);
                   if(activeTool === 'grupos') setIsGruposOpen(true);
                   if(activeTool === 'timer') setIsTimerOpen(true);
                   if(activeTool === 'desempeno') setIsDesempenoOpen(true);
                   if(activeTool === 'desempeno') setIsDesempenoOpen(true);
                 }}
                 className="mt-6 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition"
                >
                 Reabrir Ventana
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Modals seamlessly */}
      <RuletaModal
        isOpen={isRuletaOpen}
        onClose={() => { setIsRuletaOpen(false); setActiveTool('home'); }}
        sesionId={sesionId}
      />
      <GruposModal
        isOpen={isGruposOpen}
        onClose={() => { setIsGruposOpen(false); setActiveTool('home'); }}
        sesionId={sesionId}
      />
      <DesempenoModal
        isOpen={isDesempenoOpen}
        onClose={() => { setIsDesempenoOpen(false); setActiveTool('home'); }}
        sesionId={sesionId}
      />
      <TimerModal
        isOpen={isTimerOpen}
        onClose={() => { setIsTimerOpen(false); setActiveTool('home'); }}
      />
    </div>
  );
}

const MenuButton = ({ icon, label, active, onClick, color }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 ${
      active 
        ? `bg-gray-800 shadow-lg ${color} scale-110` 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:scale-105'
    }`}
  >
    <div className="p-2">
      {React.cloneElement(icon, { className: 'w-7 h-7 md:w-8 md:h-8' })}
    </div>
    <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">{label}</span>
  </button>
);
