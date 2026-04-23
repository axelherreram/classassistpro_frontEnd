import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { estudianteService } from '../../services/estudiante.service';

export default function SubirExcelModal({ isOpen, onClose, claseId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') || 
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile);
      } else {
        toast.error('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        droppedFile.type === 'application/vnd.ms-excel' ||
        droppedFile.name.endsWith('.xlsx') || 
        droppedFile.name.endsWith('.xls')
      ) {
        setFile(droppedFile);
      } else {
        toast.error('Solo se admiten archivos Excel');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    try {
      const response = await estudianteService.subirExcel(claseId, file);
      toast.success(response.message || 'Estudiantes importados correctamente');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Importar Estudiantes</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100/50">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium mb-1 line-clamp-1">Formato requerido del Excel</p>
              <p className="text-blue-700/80">
                El archivo debe contener las siguientes columnas en la primera fila:
                <br />
                <span className="font-semibold bg-white px-1.5 py-0.5 rounded text-xs mt-1 inline-block">carnet</span>, {' '}
                <span className="font-semibold bg-white px-1.5 py-0.5 rounded text-xs mt-1 inline-block">nombre</span>, {' '}
                <span className="font-semibold bg-white px-1.5 py-0.5 rounded text-xs mt-1 inline-block">correo</span> (opcional)
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                file 
                ? 'border-[#2d7a5d] bg-[#2d7a5d]/5' 
                : 'border-gray-300 hover:border-[#2d7a5d]/50 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload"
              />
              
              <label 
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-4"
              >
                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#2d7a5d]/10 flex items-center justify-center text-[#2d7a5d]">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Haz clic para buscar o arrastra un archivo
                      </p>
                      <p className="text-xs text-gray-500">
                        Solo archivos .xlsx o .xls
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="flex-1 px-4 py-2.5 bg-[#2d7a5d] border border-transparent text-white rounded-xl font-medium hover:bg-[#25664d] shadow-lg shadow-[#2d7a5d]/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {loading ? 'Subiendo...' : 'Importar Datos'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}