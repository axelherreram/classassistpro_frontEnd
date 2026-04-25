import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, Timer as TimerIcon, Bell } from 'lucide-react';

const TimerModal = ({ isOpen, onClose, isSidePanel = false, isEmbedded = false }) => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const alarmAudioRef = useRef(null);

  const playAlarm = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new AudioContextClass();
      }

      const audioContext = alarmAudioRef.current;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error(error);
    }
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (alarmAudioRef.current) {
      if (alarmAudioRef.current.state !== 'closed') {
        alarmAudioRef.current.close().catch(() => {});
      }
      alarmAudioRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearInterval(timerRef.current);
      stopAlarm();
      setTimeout(() => setIsRunning(false), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      setTimeout(() => {
        setIsRunning(false);
        setIsFinished(true);
      }, 0);
      
      if (!alarmIntervalRef.current) {
        playAlarm();
        alarmIntervalRef.current = setInterval(playAlarm, 950);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // Si no está corriendo ni terminado, mantenemos sincronizado el tiempo con los inputs
  useEffect(() => {
    if (!isRunning && !isFinished) {
      const min = parseInt(minutes) || 0;
      const sec = parseInt(seconds) || 0;
      setTimeout(() => setTimeLeft(min * 60 + sec), 0);
    }
  }, [minutes, seconds, isRunning, isFinished]);

  const handleStart = () => {
    const min = parseInt(minutes) || 0;
    const sec = parseInt(seconds) || 0;
    
    if (timeLeft === 0 && !isRunning && isFinished) {
      setTimeLeft(min * 60 + sec);
      setIsFinished(false);
    } else if (timeLeft === 0) {
      setTimeLeft(min * 60 + sec);
    }
    
    setIsFinished(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarm();
    const min = parseInt(minutes) || 0;
    const sec = parseInt(seconds) || 0;
    setTimeLeft(min * 60 + sec);
  };

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = timeInSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const wrapperClass = isEmbedded 
    ? "w-full h-full flex items-center justify-center z-10 animate-fade-in"
    : (isSidePanel ? "fixed bottom-6 right-6 w-full max-w-[380px] shadow-2xl z-[150] transform transition-transform duration-300 animate-in slide-in-from-bottom-8" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm");

  const innerClass = isEmbedded
    ? "bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-gray-200"
    : (isSidePanel ? "bg-white rounded-3xl shadow-xl w-full overflow-hidden flex flex-col border border-gray-200" : "bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col");

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center gap-2">
            <TimerIcon size={24} />
            <h2 className="text-xl font-bold">Temporizador</h2>
          </div>
          {!isEmbedded && (
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center bg-gray-50 flex-1">
          {isFinished ? (
            <div className="text-center animate-bounce mb-6">
              <Bell className="w-16 h-16 text-red-500 mx-auto mb-2 animate-pulse" />
              <h3 className="text-2xl font-bold text-red-600">¡Tiempo agotado!</h3>
            </div>
          ) : (
            <div className="mb-8">
              <div className="text-7xl font-mono font-bold text-gray-800 tracking-wider">
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          {!isRunning && !isFinished && (
            <div className="flex gap-4 mb-8 w-full justify-center">
              <div className="flex flex-col items-center">
                <label className="text-sm text-gray-500 font-medium mb-1">Minutos</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-20 text-center text-xl p-2 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="text-3xl font-bold text-gray-400 mt-6">:</div>
              <div className="flex flex-col items-center">
                <label className="text-sm text-gray-500 font-medium mb-1">Segundos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-20 text-center text-xl p-2 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 w-full px-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={isFinished}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl shadow-md transition-all ${isFinished ? 'bg-orange-300 text-white/70 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'}`}
              >
                <Play size={20} /> Iniciar
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Pause size={20} /> Pausar
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Square size={20} /> Detener
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;
