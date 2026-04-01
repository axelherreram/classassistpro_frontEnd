import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Send, CheckCircle, AlertCircle, X, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { asistenciaService } from '../../services/asistencia.service';
import * as faceapi from '@vladmandic/face-api';

export default function RegistroAsistencia() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [carnet, setCarnet] = useState('');
  const [foto, setFoto] = useState(null); // guardará el base64 de la foto
  const [isCarga, setIsCarga] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [resultado, setResultado] = useState(null); // 'exito' | 'error' | null
  const [mensajeError, setMensajeError] = useState('');
  const [modelosCargados, setModelosCargados] = useState(false);
  const [analizandoRostro, setAnalizandoRostro] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Cargar modelos de face-api
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        setModelosCargados(true);
      } catch (error) {
        console.error('Error al cargar modelos:', error);
        toast.error('No se pudieron cargar los modelos de IA. Recarga la página.');
      }
    };
    loadModels();
  }, []);

  // Activar la cámara
  const encenderCamara = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no permite acceso a la cámara. Si estás desde un móvil/IP, necesitas HTTPS para usar la cámara en la web.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, // usar cámara frontal
        audio: false 
      });
      streamRef.current = stream;
      setCamaraActiva(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
  };

  // Efecto para asignar el stream al video cuando el elemento ya esté renderizado
  useEffect(() => {
    // Si la cámara está activa y ya se montó el elemento <video>
    if (camaraActiva && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camaraActiva]);

  // Apagar la cámara
  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCamaraActiva(false);
  }, []);

  // Capturar la imagen
  const tomarFoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Validar si los modelos de IA están listos
    if (!modelosCargados) {
      toast.error('Esperando a que la IA se inicialice. Intenta de nuevo en unos segundos.');
      return;
    }
    
    // Dibujar la imagen del video en el canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Validar que el video ya tenga dimensiones cargadas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('La cámara aún se está inicializando, intenta de nuevo en un segundo.');
      return;
    }
    
    setAnalizandoRostro(true);

    try {
      // 1. Detectar el rostro en vivo directamente del video para validación
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      
      if (!detections || detections.length === 0) {
         toast.error('❌ No se detectó ningún rostro vivo. ¡Asegúrate de mirar a la cámara!');
         setAnalizandoRostro(false);
         return;
      }
      if (detections.length > 1) {
         toast.error('❌ Se detectó más de una persona. Por favor, toma la foto solo.');
         setAnalizandoRostro(false);
         return;
      }

      // Si todo está bien (1 rostro), se toma la foto normal
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      // Aplicar modo espejo al canvas para que guarde la foto tal como la ve el usuario
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir canvas a base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8); // 80% calidad
      setFoto(imageData);
      toast.success('¡Rostro detectado correctamente!');
      detenerCamara();
    } catch (error) {
      console.error(error);
      toast.error('Error al analizar la imagen.');
    } finally {
      setAnalizandoRostro(false);
    }
  };

  const descartarFoto = () => {
    setFoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Enlace inválido. El código QR no contiene el token.');
      return;
    }
    if (!carnet.trim()) {
      toast.error('Debes ingresar tu número de carné.');
      return;
    }
    if (!foto) {
      toast.error('Debes tomarte una foto (selfie) para registrar asistencia.');
      return;
    }

    setIsCarga(true);
    setResultado(null);
    setMensajeError('');

    try {

      await asistenciaService.marcarAsistencia({
        token,
        carnet: carnet.trim(),
        foto
      });
      setResultado('exito');
    } catch (error) {
      setResultado('error');
      setMensajeError(error.message || 'Error desconocido al marcar asistencia.');
    } finally {
      setIsCarga(false);
    }
  };

  // Si no hay token de entrada, mostrar un mensaje de error de una vez
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center text-red-500">
           <AlertCircle className="w-16 h-16 mx-auto mb-4" />
           <h2 className="text-2xl font-bold mb-2">Enlace no válido</h2>
           <p className="text-gray-600">Por favor, escanea el código QR de nuevo. (Falta el token de sesión).</p>
        </div>
      </div>
    );
  }

  // Si ya marcó la asistencia (Éxito o Error de la API)
  if (resultado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          {resultado === 'exito' ? (
            <div className="text-emerald-500 animate-fade-in">
               <CheckCircle className="w-20 h-20 mx-auto mb-4 text-emerald-500 drop-shadow-md" />
               <h2 className="text-3xl font-bold mb-2 text-gray-800">¡Asistencia Registrada!</h2>
               <p className="text-gray-600">Tu asistencia y foto han sido guardadas. Ya puedes cerrar esta ventana.</p>
            </div>
          ) : (
            <div className="text-red-500 animate-fade-in">
               <X className="w-20 h-20 mx-auto mb-4 text-red-500 drop-shadow-md" />
               <h2 className="text-2xl font-bold mb-2 text-gray-800">Error</h2>
               <p className="text-gray-600">{mensajeError}</p>
               <button 
                 onClick={() => setResultado(null)}
                 className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition flex justify-center items-center gap-2"
               >
                 <RefreshCw className="w-5 h-5" />
                 Intentar de Nuevo
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista principal del formulario
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="bg-[#2d7a5d] p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Registro de Asistencia</h1>
          <p className="text-emerald-100 text-sm mt-1">Verificación con Selfie</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Input Carnet */}
          <div className="space-y-2">
            <label htmlFor="carnet" className="block text-sm font-semibold text-gray-700">
              Número de Carné
            </label>
            <input
              id="carnet"
              type="text"
              required
              value={carnet}
              onChange={(e) => setCarnet(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium text-center tracking-widest focus:ring-2 focus:ring-[#2d7a5d] outline-none"
              placeholder="Ej: 20260123"
            />
          </div>

          {/* Sección Selfie */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Foto (Selfie)
            </label>
            
            {/* Estado 1: No hay foto y la cámara NO está activa */}
            {!foto && !camaraActiva && (
              <div 
                className="w-full aspect-[3/4] sm:aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={encenderCamara}
              >
                <div className="p-4 bg-white rounded-full shadow-sm">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-gray-500 font-medium">Tocar para abrir la cámara</span>
              </div>
            )}

            {/* Estado 2: Cámara activa, viendo el feed */}
            {!foto && camaraActiva && (
              <div className="relative w-full aspect-[3/4] sm:aspect-square bg-black rounded-2xl overflow-hidden group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Botón flotante para tomar la foto */}
                <div className="absolute inset-x-0 bottom-6 flex justify-center">
                  <button
                    type="button"
                    onClick={tomarFoto}
                    disabled={analizandoRostro || !modelosCargados}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center p-1 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                  >
                    {analizandoRostro ? (
                      <Loader2 className="w-8 h-8 text-[#2d7a5d] animate-spin" />
                    ) : (
                      <div className="w-full h-full bg-[#2d7a5d] rounded-full"></div>
                    )}
                  </button>
                </div>
                {/* Indicador de carga de IA */}
                {!modelosCargados && (
                  <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-md flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Cargando IA...
                  </div>
                )}
                {/* Botón para cerrar cámara */}
                <button
                  type="button"
                  onClick={detenerCamara}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Estado 3: Foto tomada, previsualizar */}
            {foto && (
              <div className="relative w-full aspect-[3/4] sm:aspect-square bg-black rounded-2xl overflow-hidden">
                <img src={foto} alt="Selfie tomada" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={descartarFoto}
                  className="absolute top-4 right-4 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-semibold rounded-lg backdrop-blur-md transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retomar
                </button>
                <div className="absolute bottom-4 left-4 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-md flex items-center gap-1 shadow-lg">
                  <CheckCircle className="w-3 h-3" /> Lista
                </div>
              </div>
            )}

            {/* Canvas oculto necesario para extraer la foto del video */}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <button
            type="submit"
            disabled={isCarga}
            className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
              isCarga 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#1b1717] hover:bg-black text-white hover:shadow-lg'
            }`}
          >
            {isCarga ? (
              'Enviando...'
            ) : (
              <>
                Confirmar Asistencia <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}