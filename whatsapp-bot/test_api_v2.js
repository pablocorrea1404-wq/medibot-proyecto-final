const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL;
const PHONE = '644403121';

async function test() {
    try {
        const url = `${API_URL}/patients?phone=${PHONE}`;
        console.log(`Llamando a: ${url}`);
        const response = await axios.get(url);
        console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
