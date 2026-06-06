import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente Guard que protege las rutas privadas en el frontend.
 * Si no existe un token válido en localStorage, redirige al usuario a la página de Login.
 */
const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // Si no hay token, redirigimos a /login de inmediato
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si hay token, permitimos que se rendericen las rutas secundarias/hijas (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
