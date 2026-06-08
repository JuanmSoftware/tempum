import { API_BASE_URL } from './apiConfig';

const AUTH_API_URL = `${API_BASE_URL}/auth`;

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    nombre: string;
    email: string;
    password: string;
    rol: string;
}

/**
 * Realiza la llamada al backend para iniciar sesión.
 * Si las credenciales son válidas, el backend responde con el token JWT en texto plano.
 */
export const login = async (request: LoginRequest): Promise<string> => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        // Si hay un error (por ejemplo, credenciales incorrectas), lanzamos una excepción con el mensaje del backend
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Credenciales incorrectas o error en el servidor');
    }

    // El backend devuelve el token directamente en formato texto plano
    const token = await response.text();
    return token;
};

/**
 * Realiza la llamada al backend para registrar un nuevo usuario.
 */
export const register = async (request: RegisterRequest): Promise<string> => {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Error al registrar el usuario');
    }

    return await response.text();
};

