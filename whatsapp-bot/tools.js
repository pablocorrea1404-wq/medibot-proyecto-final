const axios = require('axios');
const { DateTime } = require('luxon');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL;

function getSafeErrorMessage(error) {
    let msg = error.response?.data?.['hydra:description'] || error.response?.data?.detail || error.message || 'Error desconocido';
    if (typeof msg === 'string' && (msg.includes('<html') || msg.includes('SQLSTATE') || msg.length > 200)) {
        return 'Error interno del servidor o datos no válidos.';
    }
    return msg;
}

async function consultar_disponibilidad(args) {
    const { fecha, staff_id } = args;
    const cleanFecha = fecha ? fecha.replace(/\//g, '-') : fecha;
    try {
        const response = await axios.get(`${API_URL}/availability`, {
            params: { date: cleanFecha, staffId: staff_id }
        });
        return JSON.stringify(response.data);
    } catch (error) {
        return JSON.stringify({ error: 'Error al consultar disponibilidad' });
    }
}

async function buscar_paciente(args) {
    const { telefono } = args;
    try {
        const response = await axios.get(`${API_URL}/patients`, { params: { phone: telefono } });
        // Soportar tanto 'member' como 'hydra:member' como un array directo
        const data = response.data;
        const patients = data['member'] || data['hydra:member'] || (Array.isArray(data) ? data : []);
        
        if (patients.length > 0) {
            return JSON.stringify(patients[0]);
        }
        return JSON.stringify({ mensaje: 'No encontrado' });
    } catch (error) {
        return JSON.stringify({ error: 'Error al buscar en la base de datos' });
    }
}

async function crear_paciente(args) {
    const { nombre, email, telefono, dni, fecha_nacimiento, direccion } = args;
    if (!nombre || !email || !telefono || !dni || !fecha_nacimiento || !direccion) {
        return JSON.stringify({ error: 'Faltan datos obligatorios: nombre, email, telefono, dni, fecha_nacimiento o direccion' });
    }
    let parsedBirth = fecha_nacimiento;
    const match = fecha_nacimiento.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (match) {
        parsedBirth = `${match[3]}-${match[2]}-${match[1]}`;
    }

    try {
        const response = await axios.post(`${API_URL}/patients`, {
            name: nombre,
            email: email,
            phone: telefono,
            dni: dni,
            birthDate: parsedBirth + 'T00:00:00+00:00',
            address: direccion
        });
        return JSON.stringify(response.data);
    } catch (error) {
        const msg = getSafeErrorMessage(error);
        return JSON.stringify({ error: `No se pudo crear: ${msg}` });
    }
}

async function crear_cita(args) {
    const { paciente_id, fecha_hora, servicio, staff_id, servicio_id } = args;
    if (!paciente_id || !fecha_hora || !staff_id) {
        return JSON.stringify({ error: 'Faltan datos: paciente_id, fecha_hora o staff_id' });
    }

    // La LLM genera la hora en hora local española (Europe/Madrid).
    // Hay que convertirla a UTC teniendo en cuenta los cambios de hora (verano/invierno).
    let cleanDate = fecha_hora.replace(/\//g, '-').replace(' ', 'T').replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    const d = DateTime.fromISO(cleanDate, { zone: 'Europe/Madrid' });
    if (!d.isValid) {
        return JSON.stringify({ error: `Error interno: formato de fecha inválido (${cleanDate}). Usa YYYY-MM-DD HH:MM:SS.` });
    }
    const isoDate = d.toUTC().toISO(); // p.ej. "2026-05-15T08:00:00.000Z"

    try {
        const body = {
            patient: `/api/patients/${paciente_id}`,
            staff: `/api/staff/${staff_id}`,
            appointmentDate: isoDate,
            status: 'pending',
            notes: servicio || ''
        };
        if (servicio_id) {
            body.service = `/api/medical_services/${servicio_id}`;
        }
        const response = await axios.post(`${API_URL}/appointments`, body);
        return JSON.stringify({ mensaje: 'Cita creada con exito', id: response.data.id });
    } catch (error) {
        const msg = getSafeErrorMessage(error);
        return JSON.stringify({ error: `Error al crear la cita: ${msg}` });
    }
}

async function consultar_servicios() {
    try {
        const response = await axios.get(`${API_URL}/medical_services`);
        const data = response.data;
        const services = data['member'] || data['hydra:member'] || (Array.isArray(data) ? data : []);
        return JSON.stringify(services);
    } catch (error) {
        return JSON.stringify({ error: 'Error al listar servicios' });
    }
}

async function consultar_staff() {
    try {
        const response = await axios.get(`${API_URL}/staff`);
        const data = response.data;
        const staffList = data['member'] || data['hydra:member'] || (Array.isArray(data) ? data : []);
        return JSON.stringify(staffList);
    } catch (error) {
        return JSON.stringify({ error: 'Error al listar doctores' });
    }
}

async function buscar_citas_paciente(args) {
    const { paciente_id } = args;
    try {
        const response = await axios.get(`${API_URL}/appointments`, { params: { patient: paciente_id } });
        const data = response.data;
        const appointments = data['member'] || data['hydra:member'] || (Array.isArray(data) ? data : []);
        
        // Convertir la fecha UTC a hora local de Madrid para que la IA no se confunda
        const localizedAppointments = appointments.map(app => {
            if (app.appointmentDate) {
                const d = DateTime.fromISO(app.appointmentDate).setZone('Europe/Madrid');
                if (d.isValid) {
                    app.appointmentDate = d.toFormat('yyyy-MM-dd HH:mm:ss');
                }
            }
            return app;
        });

        return JSON.stringify(localizedAppointments);
    } catch (error) {
        return JSON.stringify({ error: 'Error al buscar citas del paciente' });
    }
}

async function eliminar_cita(args) {
    const { cita_id } = args;
    try {
        await axios.delete(`${API_URL}/appointments/${cita_id}`);
        return JSON.stringify({ mensaje: 'Cita eliminada correctamente' });
    } catch (error) {
        const msg = getSafeErrorMessage(error);
        return JSON.stringify({ error: `Error al eliminar la cita: ${msg}` });
    }
}

async function modificar_cita(args) {
    const { cita_id, nueva_fecha_hora } = args;
    if (!cita_id || !nueva_fecha_hora) {
        return JSON.stringify({ error: 'Faltan datos: cita_id o nueva_fecha_hora' });
    }

    let cleanDate = nueva_fecha_hora.replace(/\//g, '-').replace(' ', 'T').replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    const d = DateTime.fromISO(cleanDate, { zone: 'Europe/Madrid' });
    if (!d.isValid) {
        return JSON.stringify({ error: `Error interno: formato de fecha inválido (${cleanDate}). Usa YYYY-MM-DD HH:MM:SS.` });
    }
    const isoDate = d.toUTC().toISO();

    try {
        const body = { appointmentDate: isoDate };
        const response = await axios.patch(`${API_URL}/appointments/${cita_id}`, body, {
            headers: { 'Content-Type': 'application/merge-patch+json' }
        });
        return JSON.stringify({ mensaje: 'Cita modificada con éxito', id: response.data.id });
    } catch (error) {
        const msg = getSafeErrorMessage(error);
        return JSON.stringify({ error: `Error al modificar la cita: ${msg}` });
    }
}

async function crear_presupuesto(args) {
    const { paciente_id, titulo, items, notas } = args;
    if (!paciente_id || !items || items.length === 0) {
        return JSON.stringify({ error: 'Faltan datos: paciente_id o items' });
    }

    // Helper para parsear precios de forma segura (por si la IA usa coma en lugar de punto)
    const parsePriceSafe = (priceVal) => parseFloat(String(priceVal || "0").replace(',', '.'));

    // Calcular totales a partir de los items
    const totalAmount = items.reduce((sum, it) => sum + parsePriceSafe(it.price), 0);
    const finalAmount = totalAmount; // sin descuento desde el bot

    const body = {
        patient: `/api/patients/${paciente_id}`,
        title: titulo || 'Presupuesto desde WhatsApp',
        status: 'presented',
        totalAmount: totalAmount.toFixed(2),
        discountPercent: '0.00',
        finalAmount: finalAmount.toFixed(2),
        notes: notas || '',
        items: items.map(it => ({
            service: it.servicio || it.service || '',
            description: it.descripcion || it.description || it.servicio || '',
            price: parsePriceSafe(it.price).toFixed(2),
            toothNumber: it.diente || '',
            status: 'pending'
        }))
    };

    try {
        const response = await axios.post(`${API_URL}/treatment_plans`, body);
        return JSON.stringify({
            mensaje: 'Presupuesto creado correctamente',
            id: response.data.id,
            total: finalAmount.toFixed(2)
        });
    } catch (error) {
        const msg = getSafeErrorMessage(error);
        return JSON.stringify({ error: `No se pudo crear el presupuesto: ${msg}` });
    }
}

module.exports = {
    consultar_disponibilidad,
    buscar_paciente,
    crear_paciente,
    crear_cita,
    consultar_servicios,
    consultar_staff,
    buscar_citas_paciente,
    eliminar_cita,
    modificar_cita,
    crear_presupuesto
};
