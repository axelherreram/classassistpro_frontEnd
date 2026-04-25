import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Star, Target, TrendingUp, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { desempenoService } from '../../services/desempeno.service';
import ExcelJS from 'exceljs';

const DesempenoModal = ({ isOpen, onClose, sesionId, claseId, isEmbedded = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && (sesionId || claseId)) {
      cargarRanking();
    }
  }, [isOpen, sesionId, claseId]);

  const cargarRanking = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      if (claseId) {
        response = await desempenoService.obtenerRankingPorClase(claseId);
      } else {
        response = await desempenoService.obtenerRankingPorSesion(sesionId);
      }
      setData(response);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el ranking de desempeño');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    if (!data || !data.ranking || data.ranking.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Desempeño y Asistencia');

    worksheet.columns = [
      { header: 'Rank', key: 'Rank', width: 10 },
      { header: 'Carnet', key: 'Carnet', width: 15 },
      { header: 'Nombre', key: 'Nombre', width: 30 },
      { header: 'Asistencias', key: 'Asistencias', width: 15 },
      { header: 'Puntos Asistencia', key: 'Puntos Asistencia', width: 20 },
      { header: 'Participaciones', key: 'Participaciones', width: 15 },
      { header: 'Puntos Participacion', key: 'Puntos Participacion', width: 20 },
      { header: 'Puntaje Total', key: 'Puntaje Total', width: 15 }
    ];

    data.ranking.forEach((row, index) => {
      worksheet.addRow({
        Rank: index + 1,
        Carnet: row.estudiante.carnet,
        Nombre: row.estudiante.nombre,
        Asistencias: row.detalles.asistencias,
        'Puntos Asistencia': row.detalles.puntosAsistencia,
        Participaciones: row.detalles.participaciones,
        'Puntos Participacion': row.detalles.puntosParticipacion,
        'Puntaje Total': row.puntajeTotal
      });
    });

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const prefijo = claseId ? 'General' : 'Sesion';
    const nombreArchivo = `Desempeño_${prefijo}_${data.clase || 'Clase'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  const wrapperClass = isEmbedded 
    ? "w-full h-full flex items-center justify-center z-10 animate-fade-in p-4" 
    : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm";

  const innerClass = isEmbedded
    ? "bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-full max-h-[800px] border border-gray-200"
    : "bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300";

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
          <div className="flex items-center gap-2">
            <Trophy size={24} />
            <h2 className="text-xl font-bold">Desempeño de Estudiantes</h2>
          </div>
          {!isEmbedded && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-12 h-12 mb-4 text-amber-500 animate-spin" />
              <p className="text-lg font-medium">Calculando ranking...</p>
            </div>
          ) : data && data.ranking && data.ranking.length > 0 ? (
            <div className="space-y-6">

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                      {claseId ? 'Clase Actual' : 'Sesión Actual'}
                    </h3>
                    <p className="text-lg tracking-tight font-semibold text-gray-800">{data.clase}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg border border-amber-100 px-4">
                      <Target className="text-amber-500 w-5 h-5" />
                      <span className="text-sm font-medium text-amber-800">
                        Fórmula: (Asistencias x 10) + Participaciones
                      </span>
                    </div>
                    <button 
                      onClick={exportarExcel}
                      className="flex items-center gap-2 bg-[#2d7a5d] hover:bg-[#225d46] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Exportar a Excel
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold text-center w-16">Rank</th>
                      <th className="p-4 font-semibold">Estudiante</th>
                      <th className="p-4 font-semibold text-center">Asistencias</th>
                      <th className="p-4 font-semibold text-center">Participaciones</th>
                      <th className="p-4 font-semibold text-center text-amber-700">Puntos Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.ranking.map((row, index) => {
                      // Top 3 gets special treatment
                      const isTop1 = index === 0;
                      const isTop2 = index === 1;
                      const isTop3 = index === 2;
                      
                      return (
                        <tr key={row.estudiante.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-4 text-center font-bold">
                            {isTop1 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                             isTop2 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                             isTop3 ? <Medal className="w-6 h-6 text-amber-700 mx-auto" /> :
                             <span className="text-gray-400">{index + 1}</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isTop1 ? 'bg-yellow-100 text-yellow-700' : isTop2 ? 'bg-gray-200 text-gray-700' : isTop3 ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                                {row.estudiante.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{row.estudiante.nombre}</p>
                                <p className="text-xs text-gray-500">{row.estudiante.carnet}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-gray-700">{row.detalles.asistencias}</span>
                            <p className="text-[10px] text-gray-400">({row.detalles.puntosAsistencia} pts)</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-gray-700">{row.detalles.participaciones}</span>
                            <p className="text-[10px] text-gray-400">({row.detalles.puntosParticipacion} pts)</p>
                          </td>
                          <td className="p-4 text-center border-l border-gray-100 bg-gray-50/50 group-hover:bg-amber-50/30">
                            <span className={`text-lg font-bold ${isTop1 ? 'text-yellow-600' : isTop2 ? 'text-gray-600' : isTop3 ? 'text-amber-700' : 'text-emerald-600'}`}>
                              {row.puntajeTotal}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Aún no hay estudiantes en la clase</h3>
              <p className="text-gray-500 mt-2">Los estudiantes aparecerán en el ranking cuando se unan a la clase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesempenoModal;
