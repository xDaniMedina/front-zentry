'use server'

import { cookies } from 'next/headers';

export async function obtenerDatosSeguros(endpoint: string){

    const token = (await cookies()).get('zentry_session')?.value;

    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Error al obtener datos: ${response.status}`);
            return {error: `Error, No es posible obtener datos de`, data: null};
        }

        const data = await response.json();
        return {error: null, data};

    } catch (error) {
        return {error: `Error, No es posible obtener datos`, data: null};
    }
}