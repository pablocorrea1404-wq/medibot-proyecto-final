const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL;
const PHONE = '644403121';

async function test() {
    try {
        console.log(`Buscando telefono: ${PHONE} en ${API_URL}/patients`);
        const response = await axios.get(`${API_URL}/patients`, { params: { phone: PHONE } });
        console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
        
        const patients = response.data['hydra:member'] || response.data;
        console.log('Pacientes encontrados:', patients.length);
        if (patients.length > 0) {
            console.log('Primer paciente:', patients[0]);
        } else {
            console.log('No se encontro ningun paciente.');
        }
    } catch (error) {
        console.error('Error en la peticion:', error.message);
        if (error.response) {
            console.error('Data del error:', error.response.data);
        }
    }
}

test();
