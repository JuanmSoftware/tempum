import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getReservas, 
    crearReserva, 
    eliminarReserva, 
    confirmarReserva, 
    cancelarReserva, 
    type Reserva 
} from './services/reservaService';
import CalendarView from './components/CalendarView';
import { 
    Calendar as CalendarIcon, 
    LogOut, 
    Plus, 
    Trash2, 
    Check, 
    X, 
    Clock, 
    CalendarDays, 
    User, 
    Briefcase, 
    AlertCircle, 
    Info, 
    Loader2 
} from 'lucide-react';

function App() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [motivoCancelacionText, setMotivoCancelacionText] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reservaIdParaEliminar, setReservaIdParaEliminar] = useState<number | null>(null);

    const [form, setForm] = useState({
        nameClient: '',
        startDate: '',
        endDate: '',
        service: ''
    });

    const navigate = useNavigate();

    // Obtener el rol del usuario decodificando el token JWT (Base64)
    const token = localStorage.getItem('token');
    let userRole = 'USER';

    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window.atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userRole = decoded.rol || 'USER';
        } catch (e) {
            console.error('Error al decodificar el token:', e);
        }
    }

    useEffect(() => {
        cargarReservas();
    }, []);

    // Desvanecer mensaje de éxito automáticamente
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Desvanecer mensaje de error automáticamente
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const data = await getReservas();
            setReservas(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await crearReserva(form);
            setSuccessMessage("¡Reserva creada correctamente!");
            setForm({
                nameClient: '',
                startDate: '',
                endDate: '',
                service: ''
            });
            setIsCreateModalOpen(false);
            cargarReservas();
        } catch (err: any) {
            setError(err.message || 'Error al guardar la reserva.');
            setIsCreateModalOpen(false); // Cerramos el modal para que el error sea visible en el Dashboard
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        setReservaIdParaEliminar(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmarEliminacion = async () => {
        if (reservaIdParaEliminar === null) return;
        try {
            await eliminarReserva(reservaIdParaEliminar);
            setSuccessMessage("Reserva eliminada con éxito.");
            setIsDeleteModalOpen(false);
            setReservaIdParaEliminar(null);
            setEventoSeleccionado(null);
            cargarReservas();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la reserva.');
            setIsDeleteModalOpen(false);
            setReservaIdParaEliminar(null);
        }
    };

    const handleCancelarEliminacion = () => {
        setIsDeleteModalOpen(false);
        setReservaIdParaEliminar(null);
    };

    const handleConfirmar = async () => {
        if (!eventoSeleccionado) return;
        try {
            await confirmarReserva(eventoSeleccionado.id);
            setSuccessMessage("Reserva confirmada con éxito.");
            setEventoSeleccionado(null);
            cargarReservas();
        } catch (err: any) {
            setError(err.message || 'Error al confirmar la reserva.');
        }
    };

    const handleCancelar = () => {
        if (!eventoSeleccionado) return;
        setMotivoCancelacionText('');
        setIsCancelModalOpen(true); // Abrimos nuestro modal personalizado de cancelación
    };

    const handleConfirmarCancelacion = async () => {
        if (!eventoSeleccionado) return;
        try {
            await cancelarReserva(eventoSeleccionado.id, motivoCancelacionText);
            setSuccessMessage("Reserva cancelada correctamente.");
            setIsCancelModalOpen(false);
            setEventoSeleccionado(null);
            cargarReservas();
        } catch (err: any) {
            setError(err.message || 'Error al cancelar la reserva.');
            setIsCancelModalOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Mapeo para react-big-calendar
    const eventos = reservas.map((r) => ({
        title: `${r.nameClient} - ${r.service}`,
        start: new Date(r.startDate),
        end: new Date(r.endDate),
        estado: r.estado,
        id: r.id,
        motivoCancelacion: r.motivoCancelacion, // Cargamos el motivo en el evento
    }));

    // Estadísticas rápidas para el dashboard (SaaS)
    const totalReservas = reservas.length;
    const confirmadasCount = reservas.filter(r => r.estado === 'CONFIRMADA').length;
    const pendientesCount = reservas.filter(r => r.estado === 'PENDIENTE').length;

    return (
        <div className="min-h-screen text-slate-100 flex flex-col font-sans">
            
            {/* 1. BARRA SUPERIOR (NAVBAR) */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Tempum
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setError('');
                                setIsCreateModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nueva Reserva</span>
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* ALERTAS DE ESTADO */}
                {successMessage && (
                    <div className="bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 p-4 rounded-xl flex items-center gap-3 shadow-md backdrop-blur-md animate-fade-in">
                        <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-950/50 border border-red-800/50 text-red-300 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md backdrop-blur-md animate-fade-in">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="text-red-400 hover:text-red-200 hover:bg-red-500/10 p-1 rounded-lg transition-all"
                            title="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* TARJETAS DE MÉTRICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 shadow-xl backdrop-blur-md flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservas</p>
                            <h3 className="text-2xl font-black text-slate-100">{loading ? '...' : totalReservas}</h3>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 shadow-xl backdrop-blur-md flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmadas</p>
                            <h3 className="text-2xl font-black text-slate-100">{loading ? '...' : confirmadasCount}</h3>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 shadow-xl backdrop-blur-md flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes</p>
                            <h3 className="text-2xl font-black text-slate-100">{loading ? '...' : pendientesCount}</h3>
                        </div>
                    </div>
                </div>

                {/* FILA DEL CALENDARIO + LISTADO */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* CALENDARIO */}
                    <div className="lg:col-span-3 bg-slate-900/30 p-6 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-md flex flex-col min-h-[600px]">
                        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-400" />
                            <span>Calendario de Citas</span>
                        </h2>

                        {loading && reservas.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                                <p className="text-slate-400 text-sm font-medium">Cargando tus citas del mes...</p>
                            </div>
                        ) : (
                            <div className="flex-1">
                                <CalendarView
                                    events={eventos}
                                    onSelectEvent={(event) => setEventoSeleccionado(event)}
                                />
                            </div>
                        )}
                    </div>

                    {/* PANEL DE RESERVAS LATERAL */}
                    <div className="bg-slate-900/30 p-6 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-md flex flex-col h-[655px]">
                        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-400" />
                            <span>Listado de Citas</span>
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                            {loading && reservas.length === 0 ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="border border-slate-800/50 p-4 rounded-xl space-y-2 animate-pulse">
                                        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                                        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                                        <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                                    </div>
                                ))
                            ) : reservas.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-500 mb-4">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-300">Sin Reservas</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
                                        Comienza creando una nueva cita con el botón superior.
                                    </p>
                                </div>
                            ) : (
                                reservas.map((r) => (
                                    <div 
                                        key={r.id} 
                                        className="p-4 rounded-xl border border-slate-800/40 bg-slate-950/20 hover:bg-slate-950/40 hover:border-slate-850/80 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-bold text-slate-200 text-sm">{r.nameClient}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    r.estado === 'CONFIRMADA' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/20' :
                                                    r.estado === 'CANCELADA' ? 'bg-red-950/50 text-red-400 border border-red-800/20' :
                                                    'bg-amber-950/50 text-amber-400 border border-amber-800/20'
                                                }`}>
                                                    {r.estado}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-1 text-xs text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>{r.service}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="text-[11px] leading-tight">
                                                        {new Date(r.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                {r.estado === 'CANCELADA' && r.motivoCancelacion && (
                                                    <div className="text-[10px] text-red-400 font-semibold italic mt-1.5 border-t border-slate-800/20 pt-1">
                                                        Motivo: "{r.motivoCancelacion}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-3 border-t border-slate-800/60 pt-2">
                                            <button 
                                                onClick={() => handleDelete(r.id!)}
                                                className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Eliminar cita"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* 4. MODAL DE CREACIÓN DE RESERVAS */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    
                    {/* Modal Card */}
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
                        <div className="bg-slate-950/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-indigo-400" />
                                <span>Crear Nueva Reserva</span>
                            </h3>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                                    Nombre del Cliente
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        name="nameClient"
                                        type="text"
                                        value={form.nameClient}
                                        onChange={handleChange}
                                        placeholder="Ej. Juan Pérez"
                                        className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 transition-all placeholder-slate-650"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-455 uppercase tracking-wider block">
                                    Servicio
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        name="service"
                                        type="text"
                                        value={form.service}
                                        onChange={handleChange}
                                        placeholder="Ej. Consulta Médica, Corte de Pelo..."
                                        className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-slate-855 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 transition-all placeholder-slate-655"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        required
                                        name="startDate"
                                        type="datetime-local"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                                        Fecha de Fin
                                    </label>
                                    <input
                                        required
                                        name="endDate"
                                        type="datetime-local"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <span>Crear Reserva</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. MODAL DE GESTIÓN DE EVENTOS SELECCIONADOS */}
            {eventoSeleccionado && !isCancelModalOpen && !isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm animate-fade-in">
                    
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
                        <div className="bg-slate-950/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-100">Detalles de la Cita</h3>
                            <button 
                                onClick={() => setEventoSeleccionado(null)}
                                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Cliente - Servicio</p>
                                    <h4 className="text-lg font-black text-slate-100">{eventoSeleccionado.title}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Inicio</p>
                                        <p className="text-xs font-semibold text-slate-300">
                                            {new Date(eventoSeleccionado.start).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Fin</p>
                                        <p className="text-xs font-semibold text-slate-300">
                                            {new Date(eventoSeleccionado.end).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Estado Actual</p>
                                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                                        eventoSeleccionado.estado === 'CONFIRMADA' ? 'bg-emerald-950/50 text-emerald-450 border border-emerald-800/20' :
                                        eventoSeleccionado.estado === 'CANCELADA' ? 'bg-red-950/50 text-red-450 border border-red-800/20' :
                                        'bg-amber-950/50 text-amber-450 border border-amber-800/20'
                                    }`}>
                                        {eventoSeleccionado.estado}
                                    </span>
                                    {eventoSeleccionado.estado === 'CANCELADA' && eventoSeleccionado.motivoCancelacion && (
                                        <div className="mt-2.5 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-350 text-xs leading-relaxed">
                                            <span className="font-bold block uppercase tracking-wider text-[9px] text-red-450 mb-0.5">Motivo de Cancelación</span>
                                            "{eventoSeleccionado.motivoCancelacion}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                                {userRole === 'ADMIN' && eventoSeleccionado.estado !== 'CONFIRMADA' && (
                                    <button
                                        onClick={handleConfirmar}
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Confirmar
                                    </button>
                                )}

                                {userRole === 'ADMIN' && eventoSeleccionado.estado !== 'CANCELADA' && (
                                    <button
                                        onClick={handleCancelar}
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancelar Cita
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(eventoSeleccionado.id)}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-950/50 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-bold transition-colors shadow-sm ml-auto border border-red-900/25"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. MODAL DE MOTIVO DE CANCELACIÓN (CUSTOM REACT MODAL) */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
                        <div className="bg-slate-950/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <span>Cancelar Cita</span>
                            </h3>
                            <button 
                                onClick={() => setIsCancelModalOpen(false)}
                                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">
                                Por favor, ingresa el motivo por el cual cancelas esta cita. Esta nota se le mostrará al cliente.
                            </p>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                                    Motivo de Cancelación
                                </label>
                                <textarea
                                    value={motivoCancelacionText}
                                    onChange={(e) => setMotivoCancelacionText(e.target.value)}
                                    placeholder="Ej. No estaré disponible en ese horario / Mantenimiento de equipo..."
                                    className="block w-full px-3 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 h-28 resize-none placeholder-slate-650"
                                />
                            </div>

                            <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleConfirmarCancelacion}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                                >
                                    Confirmar Cancelación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (CUSTOM REACT MODAL) */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
                        <div className="bg-slate-950/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-red-500" />
                                <span>Eliminar Reserva</span>
                            </h3>
                            <button 
                                onClick={handleCancelarEliminacion}
                                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">
                                ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer y liberará el horario seleccionado.
                            </p>

                            <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCancelarEliminacion}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmarEliminacion}
                                    className="px-4 py-2 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                                >
                                    Confirmar Eliminación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;