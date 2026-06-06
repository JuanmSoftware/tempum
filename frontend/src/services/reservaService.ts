export interface Reserva {
    id?: number;
    nameClient: string;
    startDate: string;
    endDate: string;
    service: string;
    estado?: string;
    motivoCancelacion?: string;
}

import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/reservas`;

// Función helper para obtener las cabeceras HTTP necesarias, incluyendo el JWT
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Función para obtener todas las reservas
export const getReservas = async (): Promise<Reserva[]> => {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
            throw new Error('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
        }
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error al obtener las reservas');
    }

    return response.json();
};

// Función para crear una nueva reserva
export const crearReserva = async (reserva: Reserva): Promise<void> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reserva)
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error al crear la reserva');
    }

    return response.json();
};

// Función para eliminar una reserva
export const eliminarReserva = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error al eliminar la reserva');
    }
};

// Función para confirmar una reserva
export const confirmarReserva = async (id: number): Promise<any> => {
    const response = await fetch(`${API_URL}/${id}/confirmar`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error al confirmar la reserva');
    }

    return response.json();
};

// Función para cancelar una reserva con un motivo opcional
export const cancelarReserva = async (id: number, motivo?: string): Promise<any> => {
    const url = motivo 
        ? `${API_URL}/${id}/cancelar?motivo=${encodeURIComponent(motivo)}` 
        : `${API_URL}/${id}/cancelar`;
        
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error al cancelar la reserva');
    }

    return response.json();
};