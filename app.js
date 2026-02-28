// --- SEÑAL DE CARGA ---
alert('🚀 LIBRERÍA "app.js" CARGADA CORRECTAMENTE');

// --- CONFIGURACIÓN Y ESTADO ---
const SUPABASE_URL = 'https://swrbakjotcenhybwsrov.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cmJha2pvdGNlbmh5Yndzcm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzU3MzAsImV4cCI6MjA4Nzg1MTczMH0.mUEwKiwVRDppWWNAUUxsmfnwtRye3Rk0GRMXibp8VwQ';

let supabase = null;

function getSupabase() {
    if (supabase) return supabase;
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return supabase;
    }
    return null;
}

const state = {
    user: null,
    currentScreen: 'dashboard',
    courses: [],
    students: [],
    attendance: {},
    attendanceDate: new Date().toISOString().split('T')[0]
};

// Elementos del DOM
const screens = {
    loading: document.getElementById('loading-screen'),
    login: document.getElementById('login-screen'),
    main: document.getElementById('main-app'),
    content: document.getElementById('content-area')
};

const templates = {
    dashboard: document.getElementById('tpl-dashboard'),
    attendance: document.getElementById('tpl-attendance'),
    import: document.getElementById('tpl-import')
};

// --- INICIALIZACIÓN ---
function init() {
    console.log('🚀 Iniciando App...');
    showScreen('login');
    setupEventListeners();
}

// --- NAVEGACIÓN ---
function showScreen(screenId) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    if (screens[screenId]) screens[screenId].classList.add('active');
}

function navigateTo(screenId) {
    state.currentScreen = screenId;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenId);
    });
    const template = templates[screenId];
    if (template) {
        if (screens.content) {
            screens.content.innerHTML = '';
            screens.content.appendChild(template.content.cloneNode(true));
        }
        if (screenId === 'dashboard') initDashboard();
        if (screenId === 'attendance') initAttendance();
        if (screenId === 'import') initImport();
    }
}

// --- MANEJO DE LOGIN (GLOBAL) ---
window.handleLoginSubmit = async function (e) {
    if (e) e.preventDefault();

    alert('📌 1. Iniciando proceso de entrada...');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const client = getSupabase();

    if (!client) {
        alert('📌 ERROR: No se pudo conectar con los servidores de Supabase. Revisa tu conexión.');
        return;
    }

    alert('📌 2. Conectando con Supabase para: ' + email);

    try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
            alert('📌 3. Error de Supabase: ' + error.message);
        } else if (data.user) {
            alert('📌 3. ¡EXITO! Bienvenid@: ' + data.user.email);
            state.user = data.user;
            showScreen('main');
            navigateTo('dashboard');
        }
    } catch (err) {
        alert('📌 ERROR CRÍTICO: ' + err.message);
    }
};

// --- EVENTOS ---
function setupEventListeners() {
    // La lógica de login ahora es manejada directamente por onsubmit en el HTML

    // Navegación Bottom
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.screen));
    });
}


// --- LÓGICA DE PANTALLAS ---

async function initDashboard() {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('es-PY');

    // Aquí cargaríamos estadísticas reales de Supabase
    renderMockChart();
}

function renderMockChart() {
    const canvas = document.getElementById('attendance-chart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no cargado. Saltando gráfico.');
        canvas.parentElement.innerHTML += '<p style="text-align:center;padding:20px;color:var(--text-muted)">📊 El gráfico no se puede mostrar sin conexión a internet.</p>';
        return;
    }

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['7mo A', '7mo B', '8vo A', '9no A'],
            datasets: [{
                label: '% Asistencia',
                data: [95, 88, 92, 85],
                backgroundColor: '#1976d2',
                borderRadius: 8
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

async function initAttendance() {
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) dateInput.value = state.attendanceDate;

    // Cargar Cursos
    await loadCourses();

    document.getElementById('course-select')?.addEventListener('change', async (e) => {
        const courseId = e.target.value;
        if (courseId) await loadStudents(courseId);
    });

    document.getElementById('save-attendance')?.addEventListener('click', saveAndCopySummary);
}

async function loadCourses() {
    if (!supabase) return;
    const { data, error } = await supabase.from('cursos').select('*').order('nombre');
    if (error) {
        console.error('Error cargando cursos:', error);
        return;
    }
    state.courses = data;
    const select = document.getElementById('course-select');
    if (select) {
        select.innerHTML = '<option value="">Seleccionar Curso</option>' +
            data.map(c => `<option value="${c.id}">${c.nombre} ${c.seccion || ''}</option>`).join('');
    }
}

async function loadStudents(courseId) {
    if (!supabase) return;
    const { data, error } = await supabase.from('alumnos').select('*').eq('curso_id', courseId).order('apellido');
    if (error) {
        console.error('Error cargando alumnos:', error);
        return;
    }
    state.students = data;
    renderStudentsList();
}

function renderStudentsList() {
    const container = document.getElementById('students-list');
    const actions = document.getElementById('attendance-actions');
    if (!container) return;

    container.innerHTML = state.students.map(s => `
        <div class="glass-card student-row">
            <div class="student-info">
                <div class="student-name">${s.apellido}, ${s.nombre}</div>
                <div class="student-docs">${s.documento || ''}</div>
            </div>
            <div class="attendance-btns" data-student-id="${s.id}">
                <button class="btn-att present ${state.attendance[s.id] === 'P' ? 'active' : ''}" onclick="markAttendance('${s.id}', 'P')">P</button>
                <button class="btn-att absent ${state.attendance[s.id] === 'A' ? 'active' : ''}" onclick="markAttendance('${s.id}', 'A')">A</button>
                <button class="btn-att justified ${state.attendance[s.id] === 'J' ? 'active' : ''}" onclick="markAttendance('${s.id}', 'J')">J</button>
            </div>
        </div>
    `).join('');

    actions.classList.remove('hidden');
}

window.markAttendance = (studentId, status) => {
    state.attendance[studentId] = status;
    renderStudentsList(); // Re-renderizar para mostrar el estado activo
};

async function saveAndCopySummary() {
    const courseId = document.getElementById('course-select').value;
    const course = state.courses.find(c => c.id === courseId);
    const date = document.getElementById('attendance-date').value;

    // Guardar en Supabase
    const attendanceRecords = Object.entries(state.attendance).map(([studentId, estado]) => ({
        alumno_id: studentId,
        fecha: date,
        estado: estado
    }));

    if (supabase) {
        const { error } = await supabase.from('asistencias').insert(attendanceRecords);
        if (error) {
            alert('Error al guardar: ' + error.message);
            return;
        }
    }

    // Generar Resumen
    const presentes = attendanceRecords.filter(r => r.estado === 'P').length;
    const ausentes = state.students.filter(s => state.attendance[s.id] === 'A').map(s => s.nombre);
    const justificados = state.students.filter(s => state.attendance[s.id] === 'J').map(s => s.nombre);

    const summary = `📋 ${course.nombre} - ${new Date(date).toLocaleDateString('es-PY')}
✅ Presentes: ${presentes}
❌ Ausentes: ${ausentes.length > 0 ? ausentes.join(', ') : 'Ninguno'}
📄 Justificados: ${justificados.length > 0 ? justificados.join(', ') : 'Ninguno'}`;

    // Copiar al Portapapeles
    navigator.clipboard.writeText(summary).then(() => {
        alert('Asistencia guardada y resumen copiado al portapapeles! 🚀');
    });
}

function initImport() {
    const excelInput = document.getElementById('excel-input');
    excelInput?.addEventListener('change', handleExcelImport);
}

// --- MANEJO DE EXCEL ---
async function handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const statusDiv = document.getElementById('import-status');
        statusDiv.innerHTML = `<p>⏳ Procesando ${json.length} registros...</p>`;

        if (!supabase) return alert('Supabase no conectado');

        try {
            for (const row of json) {
                const cursoNombre = row.curso || row.Curso;
                const nombre = row.nombre || row.Nombre;
                const apellido = row.apellido || row.Apellido;
                const documento = String(row.documento || row.Documento || '');

                if (!cursoNombre || !nombre) continue;

                // 1. Obtener o crear el curso
                let { data: curso, error: cErr } = await supabase
                    .from('cursos')
                    .select('id')
                    .eq('nombre', cursoNombre)
                    .single();

                if (!curso) {
                    const { data: newC, error: iErr } = await supabase
                        .from('cursos')
                        .insert({ nombre: cursoNombre })
                        .select()
                        .single();
                    if (iErr) throw iErr;
                    curso = newC;
                }

                // 2. Insertar alumno
                const { error: aErr } = await supabase
                    .from('alumnos')
                    .upsert({
                        curso_id: curso.id,
                        nombre: nombre,
                        apellido: apellido,
                        documento: documento
                    }, { onConflict: 'documento' });

                if (aErr) console.warn('Error con alumno:', aErr);
            }

            statusDiv.innerHTML = `<p class="success-text" style="color:var(--success)">✅ ¡Importación completada! ${json.length} alumnos procesados.</p>`;
            alert('¡Datos cargados con éxito! 🚀');
        } catch (err) {
            console.error('Error en importación:', err);
            statusDiv.innerHTML = `<p style="color:var(--error)">❌ Error: ${err.message}</p>`;
        }
    };
    reader.readAsBinaryString(file);
}

// Arrancar la App
init(); // Llamada directa simple
