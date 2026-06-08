import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { Mail, Lock, LogIn, Loader2, AlertCircle, User, Shield } from 'lucide-react';

/**
 * Página de Login 
 * Permite a los usuarios autenticarse o registrarse.
 */
const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('USER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                // Registrar nuevo usuario
                await register({ nombre, email, password, rol });
            }

            // Iniciar sesión automáticamente después de registrarse o iniciar sesión directamente
            const token = await login({ email, password });

            // 1. Guardamos el token en localStorage con la clave "token"
            localStorage.setItem('token', token);

            // 2. Redirigimos al usuario a la página de inicio protegida
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/30 px-4 py-12">
            {/* Decoraciones de fondo modernas (Glows) */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Contenedor tipo Card principal */}
            <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">

                {/* Cabecera / Identidad visual */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 mb-4">
                        <LogIn className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">
                        Tempum
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        {isRegister ? 'Crea una cuenta para comenzar' : 'Inicia sesión para gestionar tus reservas'}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Alerta de Error */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">Error: </span>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Campo de Nombre (solo en registro) */}
                    {isRegister && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">
                                Nombre completo
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                        </div>
                    )}

                    {/* Campo de Correo Electrónico */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">
                            Correo electrónico
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="ejemplo@tempum.com"
                            />
                        </div>
                    </div>

                    {/* Campo de Contraseña */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">
                            Contraseña
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Campo de Rol (solo en registro) */}
                    {isRegister && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">
                                Rol
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-slate-400" />
                                </div>
                                <select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                                >
                                    <option value="USER">Usuario (Cliente)</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                {isRegister ? 'Registrando usuario...' : 'Validando credenciales...'}
                            </>
                        ) : (
                            isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'
                        )}
                    </button>
                </form>

                {/* Enlace para alternar entre Login y Registro */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-indigo-600 hover:underline transition-colors"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

