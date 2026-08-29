const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
const { DateTime } = require('luxon');
const tools = require('./tools');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sessions = new Map();

console.log('--- MediBot V17 (Gestión Inteligente de Especialidades) ---');

function normalizePhone(phone) {
    if (!phone) return "";
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('34') && clean.length > 9) return clean.substring(2);
    return clean;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
});

let myId = "";
let myPhone = "";

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => {
    myId = client.info.wid._serialized;
    myPhone = normalizePhone(client.info.wid.user);
    console.log(`[OK] CONECTADO.`);
});

client.on('message_create', async (msg) => {
    try {
        if (msg.from.includes('status') || msg.to.includes('status')) return;
        if (msg.from.includes('@g.us') || msg.to.includes('@g.us')) return;
        if (msg.type !== 'chat') return;

        const isFromMe = msg.fromMe;
        const isToMe = msg.to === myId || msg.to.includes('@lid') || msg.to.includes(myPhone);
        if (isFromMe && !isToMe) return;

        const sessionId = isFromMe ? msg.to : msg.from;
        
        // WhatsApp ahora usa @lid (Local ID) para ocultar números. 
        // Para obtener el número real, tenemos que consultar el contacto.
        let rawPhone = "";
        try {
            const contact = await msg.getContact();
            if (contact && contact.number) {
                rawPhone = contact.number;
            } else {
                rawPhone = isFromMe ? client.info.wid.user : msg.from.split('@')[0];
            }
        } catch (e) {
            rawPhone = isFromMe ? client.info.wid.user : msg.from.split('@')[0];
        }
        
        let userPhone = normalizePhone(rawPhone);
        
        const session = sessions.get(sessionId) || { history: [], lastBotBody: "" };
        if (msg.body === session.lastBotBody) return;
        
        console.log(`\n=========================================`);
        console.log(`[NUEVO MENSAJE RECIBIDO]`);
        console.log(`- De: ${msg.from}`);
        console.log(`- Para: ${msg.to}`);
        console.log(`- Teléfono extraído automáticamente: ${userPhone}`);
        console.log(`- Texto: ${msg.body}`);
        console.log(`=========================================\n`);

        await handleConversation(msg, session, sessionId, userPhone);
    } catch (e) { console.error(e); }
});

let clinicCache = null;
let clinicCacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

async function getClinicData() {
    const now = Date.now();
    if (!clinicCache || clinicCache.services.length === 0 || (now - clinicCacheTime) > CACHE_TTL_MS) {
        try {
            const serv = await tools.consultar_servicios();
            const stf = await tools.consultar_staff();
            const parsedServ = JSON.parse(serv);
            const parsedStf = JSON.parse(stf);
            clinicCache = {
                services: Array.isArray(parsedServ) ? parsedServ : [],
                staff: Array.isArray(parsedStf) ? parsedStf : []
            };
            clinicCacheTime = now;
        } catch (e) {
            console.error("Error fetching clinic data", e);
            if (!clinicCache) clinicCache = { services: [], staff: [] };
        }
    }
    return clinicCache;
}

async function handleConversation(msg, session, targetId, userPhone) {
    // Usar hora local de España (el bot corre en la máquina del usuario, zona Europe/Madrid)
    const now = new Date();
    const options = { timeZone: 'Europe/Madrid', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateStr = now.toLocaleString('es-ES', options);
    
    const holidays = "1 de enero, 6 de enero, 2 de abril, 3 de abril, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre, 6 de diciembre, 8 de diciembre, 25 de diciembre";

    const isoDateStr = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })).toISOString().split('T')[0];

    // Generar calendario de 60 días usando Luxon para evitar desfases
    const madridNow = DateTime.now().setZone('Europe/Madrid');
    let calendarDays = [];
    let currentWeekNum = madridNow.weekNumber;
    let weeksCount = 0;
    
    for (let i = 0; i < 60; i++) {
        const d = madridNow.plus({ days: i });
        const yyyy = d.toFormat('yyyy');
        const mm = d.toFormat('MM');
        const dd = d.toFormat('dd');
        const weekday = d.setLocale('es').toFormat('EEEE');
        const dayNum = parseInt(dd);
        const monthName = d.setLocale('es').toFormat('LLLL');
        
        // Etiqueta relativa al día
        let dayLabel = "";
        if (i === 0) dayLabel = "HOY ";
        else if (i === 1) dayLabel = "MAÑANA ";
        else if (i === 2) dayLabel = "PASADO_MAÑANA ";
        
        // Etiqueta de semana
        let weekLabel = "";
        if (d.weekNumber !== currentWeekNum && i > 0) {
            currentWeekNum = d.weekNumber;
            weeksCount++;
        }
        
        if (weeksCount === 0) weekLabel = "[ESTA_SEMANA]";
        else if (weeksCount === 1) weekLabel = "[PRÓXIMA_SEMANA]";
        else if (weeksCount === 2) weekLabel = "[LA_OTRA_SEMANA]";
        else if (weeksCount === 3) weekLabel = "[DENTRO_DE_3_SEMANAS]";
        else weekLabel = `[DENTRO_DE_${weeksCount}_SEMANAS]`;

        // Etiqueta de posición en el mes (principios / mediados / finales)
        let posLabel = "";
        if (dayNum <= 10) posLabel = "PRINCIPIOS_DE_" + monthName.toUpperCase();
        else if (dayNum <= 20) posLabel = "MEDIADOS_DE_" + monthName.toUpperCase();
        else posLabel = "FINALES_DE_" + monthName.toUpperCase();

        calendarDays.push(`${dayLabel}${weekLabel} [${posLabel}] ${yyyy}-${mm}-${dd} (${weekday})`);
    }
    const calendarText = calendarDays.join('\n            ');


    const clinic = await getClinicData();
    const servicesText = clinic.services.length > 0
        ? clinic.services.map(s => `- ID: ${s.id} | ${s.name} | Precio: ${parseFloat(s.price).toFixed(2)}€ | Duración: ${s.durationMinutes || 30} min`).join('\n            ')
        : "(No hay servicios cargados actualmente en el sistema)";
    const staffText = clinic.staff.length > 0
        ? clinic.staff.map(s => `- ID: ${s.id} | ${s.name} (Especialidad: ${s.specialty})`).join('\n            ')
        : "(No hay doctores cargados actualmente)";

    // Precargar datos del paciente para evitar que la IA invente el ID (Hallucination)
    let patientData = null;
    try {
        const patientSearchStr = await tools.buscar_paciente({ telefono: userPhone });
        const parsed = JSON.parse(patientSearchStr);
        if (parsed.id) patientData = parsed;
    } catch(e) { }

    const pacienteStr = patientData 
        ? `- Estado del paciente: REGISTRADO (ID: ${patientData.id}, Nombre: ${patientData.name})`
        : `- Estado del paciente: NO REGISTRADO (No existe en la base de datos)`;

    const systemPrompt = `Eres MediBot, la recepcionista virtual oficial de esta clínica dental.
            Actúas exactamente como lo haría una recepcionista humana: eres amable, profesional, concisa y nunca haces nada sin confirmar antes con el paciente.

            DATOS ACTUALES:
            - Paciente Telf: ${userPhone}
            ${pacienteStr}
            - Fecha y hora actuales: ${dateStr} (Formato ISO: ${isoDateStr})
            - Festivos (España): ${holidays}.

            CALENDARIO DE REFERENCIA (PRÓXIMOS 60 DÍAS):
            - ${calendarText}

            ═══════════════════════════════════════════
            REGLA DE ORO DE FECHAS (¡PROHIBIDO CALCULAR MENTALMENTE!)
            ═══════════════════════════════════════════
            La clínica cierra sábados, domingos y festivos.
            Arriba tienes un calendario con ETIQUETAS. Tu ÚNICO trabajo es buscar la etiqueta correcta, leer la fecha YYYY-MM-DD que hay al lado y usarla. ¡NUNCA sumes ni restes días!

            DICCIONARIO DE EXPRESIONES → ETIQUETA A BUSCAR:
            ─────────────────────────────────────────────────
            EXPRESIONES DE DÍA CONCRETO:
            • "hoy" → busca la línea que empiece por HOY
            • "mañana" → busca la línea que empiece por MAÑANA
            • "pasado mañana" / "pasadomañana" → busca PASADO_MAÑANA

            EXPRESIONES DE SEMANA:
            • "esta semana" → [ESTA_SEMANA]
            • "la semana que viene" / "la próxima semana" / "la siguiente semana" / "la que viene" → [PRÓXIMA_SEMANA]
            • "la otra semana" / "la otra" / "no la que viene, la siguiente" / "la semana que viene no, la otra" / "dentro de dos semanas" / "en dos semanas" → [LA_OTRA_SEMANA]
            • "dentro de tres semanas" / "en tres semanas" → [DENTRO_DE_3_SEMANAS]

            EXPRESIONES DE MES:
            • "a principios de [mes]" / "a primeros de [mes]" / "para principios de [mes]" → busca líneas con PRINCIPIOS_DE_[MES]
            • "a mediados de [mes]" / "para mediados" / "a mitad de [mes]" → busca líneas con MEDIADOS_DE_[MES]
            • "a finales de [mes]" / "para finales" / "a final de [mes]" / "a últimos de [mes]" / "para final de mes" → busca líneas con FINALES_DE_[MES]
            • "el mes que viene" / "el próximo mes" / "el siguiente mes" → busca el primer día del mes siguiente al actual en la lista

            EXPRESIONES CON DÍA DE LA SEMANA:
            • "el lunes" / "el martes" / etc. (sin más) → busca el PRIMER día con ese nombre en la lista
            • "el lunes que viene" / "el próximo lunes" / "este lunes" → busca el primer (lunes) en [ESTA_SEMANA] o [PRÓXIMA_SEMANA]
            • "el lunes de la otra semana" / "el lunes de la otra" / "no este lunes, el siguiente" / "el lunes no de esta semana, de la otra" → busca (lunes) en [LA_OTRA_SEMANA]

            EXPRESIONES CON FECHA EXACTA:
            • "el día 25" / "el 25" / "para el 25" → busca la línea que contenga -25 en la fecha
            • "el 3 de junio" / "para el 3 de junio" → busca 06-03 en la lista

            EXPRESIONES VAGAS:
            • "cuando pueda" / "lo antes posible" / "cuanto antes" / "el primer hueco" → ofrece el primer día laborable de la lista (HOY o MAÑANA si es laborable)
            • "para más adelante" / "no tengo prisa" / "sin prisas" → ofrece opciones en [DENTRO_DE_3_SEMANAS] o posterior
            • "después de vacaciones" / "cuando vuelva" → pregúntale qué fecha exacta tiene en mente

            Si la expresión no encaja con ninguna de estas, PREGUNTA al paciente para aclarar. ¡NUNCA adivines!

            SERVICIOS DISPONIBLES (con precios reales):
            ${servicesText}

            DOCTORES DISPONIBLES:
            ${staffText}

            ═══════════════════════════════════════════
            PROTOCOLO DE ATENCIÓN (sigue este orden)
            ═══════════════════════════════════════════

            PASO 1 — IDENTIFICACIÓN:
            Comprueba en los DATOS ACTUALES de arriba si el paciente está REGISTRADO o NO REGISTRADO.
            • Si está REGISTRADO → ya tienes su ID para usarlo en cualquier reserva o trámite.
            • Si NO está REGISTRADO → Primero salúdalo y pregúntale en qué le puedes ayudar o si quiere reservar cita.
            • SOLO cuando confirme que quiere agendar, dile: "Como es la primera vez que vienes, necesito unos datos para registrarte: Nombre completo, DNI, Email, Fecha de nacimiento (DD/MM/AAAA) y Dirección".
            Cuando te los dé, usa 'crear_paciente'.

            PASO 2 — MOTIVO Y PREFERENCIA DE FECHA:
            Pregunta qué servicio necesita y qué día y hora aproximada le viene bien.
            • NUNCA propongas tú una fecha o una hora. Espera a que el paciente la diga.
            • Si pregunta qué servicios hay, muéstrale la lista con precios del apartado SERVICIOS DISPONIBLES.
            • Elige el doctor cuya especialidad encaje mejor con el servicio.

            PASO 3 — CONSULTAR DISPONIBILIDAD:
            Llama a 'consultar_disponibilidad' con la fecha pedida (y el staff_id elegido).
            • Si la hora que pide el paciente aparece en la lista → confirmada, pasa al PASO 4.
            • Si NO aparece → dile cuáles SÍ hay disponibles (en formato HH:00h) y espera a que elija.

            PASO 4 — CONFIRMACIÓN OBLIGATORIA ANTES DE RESERVAR:
            ANTES de llamar a 'crear_cita', di siempre algo como:
            "Perfecto, te confirmo la cita:
            📅 [día y fecha completa]
            🕐 [hora]
            👨‍⚕️ [nombre del doctor]
            🦷 [nombre del servicio]
            ¿Lo confirmo?"
            Solo llama a 'crear_cita' cuando el paciente responda afirmativamente (sí, confirmo, perfecto, vale, ok...).

            PASO 5 — CANCELAR O MODIFICAR CITA:
            Para cancelar o cambiar, usa 'buscar_citas_paciente' pasándole el paciente_id que tienes en los DATOS ACTUALES.
            Muéstrale la lista y pregúntale cuál quiere cancelar/cambiar.
            - Para cancelar definitivamente: usa 'eliminar_cita'.
            - Para CAMBIAR fecha/hora (reprogramar): 
              1º Verifica disponibilidad en la nueva fecha con 'consultar_disponibilidad'.
              2º Si hay hueco, usa ÚNICA Y EXCLUSIVAMENTE 'modificar_cita' con la nueva fecha/hora. ¡NUNCA USES 'eliminar_cita' PARA UN CAMBIO DE HORA! ¡NUNCA BORRES Y CREES OTRA, SOLO MODIFICA!

            PASO 6 — PRECIOS Y PRESUPUESTOS:
            • Si el paciente solo pregunta el precio de un servicio simple (ej: limpieza, revisión): Dale el precio de forma natural y conversacional (ej: "La limpieza cuesta 50€. ¿Te gustaría ir mirando algún hueco para agendarla?"). ¡No le ofrezcas registrar un presupuesto oficial por algo tan sencillo!
            • Si el paciente pide un presupuesto complejo (varios servicios) o pide explícitamente "un presupuesto":
              1. Haz un desglose claro:
                 📋 *Presupuesto orientativo:*
                 • [Servicio 1]: XX,XX €
                 • [Servicio 2]: XX,XX €
                 ─────────────────────
                 💰 *Total: XX,XX €*
              2. Pregúntale de forma amable: "¿Te gustaría que deje guardado este presupuesto en tu ficha para cuando vengas a la clínica?"
              3. Si dice SÍ, usa 'crear_presupuesto' con el ID del paciente.
              4. Confirma: "✅ Presupuesto guardado. El doctor lo tendrá a mano en tu próxima visita."

            ═══════════════════════════════════════════
            REGLAS INAMOVIBLES
            ═══════════════════════════════════════════
            - NUNCA inventes precios, IDs, servicios ni doctores. Solo usa los de las listas de arriba.
            - NUNCA reserves una cita sin confirmación explícita del paciente (PASO 4).
            - NUNCA preguntes el teléfono: usa SIEMPRE el "Paciente Telf" de arriba.
            - Si algo falla (error de la herramienta), discúlpate y ofrece intentarlo de nuevo o llamar a la clínica.
            - Respuestas cortas y claras. Sin tecnicismos innecesarios.`;

    if (session.history.length === 0) {
        session.history.push({
            role: "system",
            content: systemPrompt
        });
    } else {
        if (session.history[0].role === "system") {
            session.history[0].content = systemPrompt;
        }
    }

    session.history.push({ role: "user", content: msg.body });

    // Recortar historial manteniendo siempre el mensaje system[0] + los últimos N mensajes.
    // Para no cortar en medio de una secuencia tool_call↔tool_result, buscamos
    // hacia atrás el primer mensaje 'user' dentro de los últimos 12 mensajes.
    if (session.history.length > 22) {
        const systemMsg = session.history[0];
        const tail = session.history.slice(-12); // últimos 12 mensajes
        // Buscar el primer 'user' en la cola para asegurar que empezamos limpio
        const firstUserIdx = tail.findIndex(m => m.role === 'user');
        const safeTail = firstUserIdx >= 0 ? tail.slice(firstUserIdx) : tail;
        session.history = [systemMsg, ...safeTail];
    }

    const availableTools = [
        {
            type: "function",
            function: {
                name: "consultar_disponibilidad",
                description: "Ver disponibilidad de un doctor en una fecha",
                parameters: { type: "object", properties: { fecha: { type: "string", description: "YYYY-MM-DD" }, staff_id: { type: "number" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "buscar_paciente",
                description: "Buscar por telefono",
                parameters: { type: "object", properties: { telefono: { type: "string" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "crear_paciente",
                description: "Registrar datos",
                parameters: { type: "object", properties: { nombre: { type: "string" }, email: { type: "string" }, telefono: { type: "string" }, dni: { type: "string" }, fecha_nacimiento: { type: "string", description: "YYYY-MM-DD" }, direccion: { type: "string" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "crear_cita",
                description: "Realizar reserva definitiva",
                parameters: { type: "object", properties: { paciente_id: { type: "number" }, fecha_hora: { type: "string", description: "YYYY-MM-DD HH:MM:SS" }, servicio: { type: "string" }, servicio_id: { type: "number" }, staff_id: { type: "number" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "buscar_citas_paciente",
                description: "Buscar las citas pendientes de un paciente usando su paciente_id",
                parameters: { type: "object", properties: { paciente_id: { type: "number" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "eliminar_cita",
                description: "Eliminar o cancelar una cita usando su cita_id (obtenido de buscar_citas_paciente)",
                parameters: { type: "object", properties: { cita_id: { type: "number" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "modificar_cita",
                description: "Cambiar la fecha/hora de una cita existente sin borrarla.",
                parameters: { type: "object", properties: { cita_id: { type: "number" }, nueva_fecha_hora: { type: "string", description: "YYYY-MM-DD HH:MM:SS" } } }
            }
        },
        {
            type: "function",
            function: {
                name: "crear_presupuesto",
                description: "Crear un presupuesto oficial en el sistema cuando el paciente lo acepta. Incluye los servicios con sus precios.",
                parameters: {
                    type: "object",
                    properties: {
                        paciente_id: { type: "number", description: "ID del paciente" },
                        titulo: { type: "string", description: "Título descriptivo del presupuesto, ej: 'Presupuesto Ortodoncia y Limpieza'" },
                        notas: { type: "string", description: "Notas adicionales opcionales" },
                        items: {
                            type: "array",
                            description: "Lista de servicios del presupuesto",
                            items: {
                                type: "object",
                                properties: {
                                    servicio: { type: "string", description: "Nombre del servicio" },
                                    description: { type: "string", description: "Descripción del ítem" },
                                    price: { type: "string", description: "Precio en euros, ej: '45.00'" },
                                    diente: { type: "string", description: "Número de diente si aplica (opcional)" }
                                },
                                required: ["servicio", "price"]
                            }
                        }
                    },
                    required: ["paciente_id", "items"]
                }
            }
        }
    ];

    // Guardar sesión en el Map desde el principio (por si no hay respuesta de texto)
    sessions.set(targetId, session);

    let loop = 0;
    while (loop < 6) {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: session.history,
            tools: availableTools
        });

        const m = res.choices[0].message;
        session.history.push(m);

        if (m.tool_calls) {
            for (const call of m.tool_calls) {
                console.log(`[TOOL] ${call.function.name}(${call.function.arguments})`);
                let argsObj = JSON.parse(call.function.arguments);
                // El teléfono siempre viene del número real de WhatsApp, nunca del LLM
                if (call.function.name === 'crear_paciente' || call.function.name === 'buscar_paciente') {
                    argsObj.telefono = userPhone;
                }
                const out = await tools[call.function.name](argsObj);
                console.log(`[TOOL RESULT] ${out}`);
                session.history.push({ tool_call_id: call.id, role: "tool", name: call.function.name, content: out });
            }
            loop++;
        } else {
            session.lastBotBody = m.content;
            await client.sendMessage(targetId, m.content);
            break;
        }
    }
}

client.initialize();
