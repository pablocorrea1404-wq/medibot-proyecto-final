const axios = require('axios');
require('dotenv').config();

async function check() {
    const url = `${process.env.BACKEND_URL}/patients?phone=644403121`;
    const res = await axios.get(url);
    console.log('URL:', url);
    console.log('Keys:', Object.keys(res.data));
    console.log('Total Items:', res.data['hydra:totalItems']);
    console.log('Member type:', typeof res.data['hydra:member']);
    if (Array.isArray(res.data['hydra:member'])) {
        console.log('Member length:', res.data['hydra:member'].length);
        if (res.data['hydra:member'].length > 0) {
            console.log('First patient name:', res.data['hydra:member'][0].name);
        }
    }
}
check();
