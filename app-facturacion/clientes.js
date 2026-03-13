// ================================================
//  CLIENTES.JS - CON MENÚ HAMBURGUESA
// ================================================

let editandoId = null;
let menuAbierto = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    
    // Convertir NIF a mayúsculas
    document.getElementById('cliente-nif').addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
    
    // Solo números en teléfono
    document.getElementById('cliente-telefono').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Buscador
    document.getElementById('buscar-cliente').addEventListener('input', function() {
        filtrarClientes(this.value);
    });
    
    // Formulario
    document.getElementById('form-cliente').addEventListener('submit', guardarCliente);
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu-hamburguesa')) {
            cerrarTodosLosMenus();
        }
    });
});

// ========================================
//  TOGGLE MENÚ HAMBURGUESA
// ========================================
function toggleMenu(id, event) {
    event.stopPropagation();
    
    const menu = document.getElementById(`menu-${id}`);
    
    // Si hay otro menú abierto, cerrarlo
    if (menuAbierto && menuAbierto !== menu) {
        menuAbierto.classList.remove('activo');
    }
    
    // Toggle del menú actual
    menu.classList.toggle('activo');
    menuAbierto = menu.classList.contains('activo') ? menu : null;
}

function cerrarTodosLosMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(menu => {
        menu.classList.remove('activo');
    });
    menuAbierto = null;
}

// ========================================
//  MOSTRAR/OCULTAR FORMULARIO
// ========================================
function mostrarFormulario() {
    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('cliente-nombre').focus();
}

function ocultarFormulario() {
    document.getElementById('form-cliente-container').style.display = 'none';
    document.getElementById('form-cliente').reset();
    editandoId = null;
}

// ========================================
//  CARGAR CLIENTES
// ========================================
function cargarClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const lista = document.getElementById('lista-clientes');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    
    lista.innerHTML = '';
    
    if (clientes.length === 0) {
        mensajeVacio.style.display = 'block';
        document.getElementById('total-clientes').textContent = '0';
        return;
    }
    
    mensajeVacio.style.display = 'none';
    
    clientes.forEach(cliente => {
        // Contar facturas
        const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
        const facturasCliente = facturas.filter(f => 
            f.cliente.nif === cliente.nif || f.clienteId == cliente.id
        );
        const totalFacturado = facturasCliente.reduce((sum, f) => sum + f.total, 0);
        
        const card = document.createElement('div');
        card.className = 'cliente-card';
        card.innerHTML = `
            <div class="cliente-info">
                <h4>${cliente.nombre}</h4>
                <p class="cliente-datos">
                    <span>${cliente.nif}</span>
                    ${cliente.telefono ? `<span>· ${cliente.telefono}</span>` : ''}
                </p>
                <p class="cliente-stats">
                    <span class="stat-badge">${facturasCliente.length} fact.</span>
                    <span class="stat-badge total">${totalFacturado.toFixed(2)} €</span>
                </p>
            </div>
            
            <!-- MENÚ HAMBURGUESA -->
            <div class="menu-hamburguesa">
                <button class="btn-hamburguesa" onclick="toggleMenu(${cliente.id}, event)" title="Opciones">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <div class="menu-dropdown" id="menu-${cliente.id}">
                    <button onclick="facturarCliente(${cliente.id})">
                        <span class="emoji">🧾</span> Nueva factura
                    </button>
                    <button onclick="verHistorial(${cliente.id})">
                        <span class="emoji">📊</span> Ver historial
                    </button>
                    <div class="separador"></div>
                    <button onclick="editarCliente(${cliente.id})">
                        <span class="emoji">✏️</span> Editar datos
                    </button>
                    <button onclick="llamarCliente('${cliente.telefono}')">
                        <span class="emoji">📞</span> Llamar
                    </button>
                    <button onclick="enviarEmail('${cliente.email}')">
                        <span class="emoji">✉️</span> Enviar email
                    </button>
                    <div class="separador"></div>
                    <button class="btn-danger" onclick="eliminarCliente(${cliente.id})">
                        <span class="emoji">🗑️</span> Eliminar
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
    
    document.getElementById('total-clientes').textContent = clientes.length;
}

// ========================================
//  FILTRAR CLIENTES
// ========================================
function filtrarClientes(texto) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const filtrados = clientes.filter(c => 
        c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        c.nif.toLowerCase().includes(texto.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(texto.toLowerCase())) ||
        (c.telefono && c.telefono.includes(texto))
    );
    
    const lista = document.getElementById('lista-clientes');
    lista.innerHTML = '';
    
    if (filtrados.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:1rem;">No se encontraron clientes</p>';
        return;
    }
    
    filtrados.forEach(cliente => {
        const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
        const facturasCliente = facturas.filter(f => 
            f.cliente.nif === cliente.nif || f.clienteId == cliente.id
        );
        const totalFacturado = facturasCliente.reduce((sum, f) => sum + f.total, 0);
        
        const card = document.createElement('div');
        card.className = 'cliente-card';
        card.innerHTML = `
            <div class="cliente-info">
                <h4>${cliente.nombre}</h4>
                <p class="cliente-datos">
                    <span>${cliente.nif}</span>
                    ${cliente.telefono ? `<span>· ${cliente.telefono}</span>` : ''}
                </p>
                <p class="cliente-stats">
                    <span class="stat-badge">${facturasCliente.length} fact.</span>
                    <span class="stat-badge total">${totalFacturado.toFixed(2)} €</span>
                </p>
            </div>
            
            <div class="menu-hamburguesa">
                <button class="btn-hamburguesa" onclick="toggleMenu(${cliente.id}, event)">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <div class="menu-dropdown" id="menu-${cliente.id}">
                    <button onclick="facturarCliente(${cliente.id})">
                        <span class="emoji">🧾</span> Nueva factura
                    </button>
                    <button onclick="verHistorial(${cliente.id})">
                        <span class="emoji">📊</span> Ver historial
                    </button>
                    <div class="separador"></div>
                    <button onclick="editarCliente(${cliente.id})">
                        <span class="emoji">✏️</span> Editar datos
                    </button>
                    <button onclick="llamarCliente('${cliente.telefono}')">
                        <span class="emoji">📞</span> Llamar
                    </button>
                    <button onclick="enviarEmail('${cliente.email}')">
                        <span class="emoji">✉️</span> Enviar email
                    </button>
                    <div class="separador"></div>
                    <button class="btn-danger" onclick="eliminarCliente(${cliente.id})">
                        <span class="emoji">🗑️</span> Eliminar
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}

// ========================================
//  GUARDAR CLIENTE
// ========================================
function guardarCliente(e) {
    e.preventDefault();
    
    const cliente = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('cliente-nombre').value.trim(),
        nif: document.getElementById('cliente-nif').value.trim().toUpperCase(),
        telefono: document.getElementById('cliente-telefono').value.trim(),
        email: document.getElementById('cliente-email').value.trim().toLowerCase(),
        direccion: document.getElementById('cliente-direccion').value.trim()
    };
    
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    if (editandoId) {
        clientes = clientes.map(c => c.id === editandoId ? cliente : c);
    } else {
        const existe = clientes.find(c => c.nif === cliente.nif);
        if (existe) {
            alert('⚠️ Ya existe un cliente con ese NIF');
            return;
        }
        clientes.push(cliente);
    }
    
    localStorage.setItem('clientes', JSON.stringify(clientes));
    ocultarFormulario();
    cargarClientes();
}

// ========================================
//  EDITAR CLIENTE
// ========================================
function editarCliente(id) {
    cerrarTodosLosMenus();
    
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === id);
    
    if (!cliente) return;
    
    editandoId = id;
    
    document.getElementById('cliente-nombre').value = cliente.nombre;
    document.getElementById('cliente-nif').value = cliente.nif;
    document.getElementById('cliente-telefono').value = cliente.telefono || '';
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-direccion').value = cliente.direccion || '';
    
    mostrarFormulario();
}

// ========================================
//  ELIMINAR CLIENTE
// ========================================
function eliminarCliente(id) {
    cerrarTodosLosMenus();
    
    if (!confirm('¿Eliminar este cliente?')) return;
    
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes = clientes.filter(c => c.id !== id);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    cargarClientes();
}

// ========================================
//  FACTURAR CLIENTE
// ========================================
function facturarCliente(id) {
    cerrarTodosLosMenus();
    localStorage.setItem('clientePreseleccionado', id);
    location.href = 'nueva-factura.html';
}

// ========================================
//  LLAMAR CLIENTE
// ========================================
function llamarCliente(telefono) {
    cerrarTodosLosMenus();
    
    if (!telefono) {
        alert('Este cliente no tiene teléfono registrado');
        return;
    }
    
    window.location.href = `tel:${telefono}`;
}

// ========================================
//  ENVIAR EMAIL
// ========================================
function enviarEmail(email) {
    cerrarTodosLosMenus();
    
    if (!email) {
        alert('Este cliente no tiene email registrado');
        return;
    }
    
    window.location.href = `mailto:${email}`;
}

// ========================================
//  VER HISTORIAL
// ========================================
function verHistorial(id) {
    cerrarTodosLosMenus();
    
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === id);
    
    if (!cliente) return;
    
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const facturasCliente = facturas.filter(f => 
        f.cliente.nif === cliente.nif || f.clienteId == id
    );
    
    const modal = document.getElementById('modal-historial');
    const titulo = document.getElementById('historial-titulo');
    const contenido = document.getElementById('historial-contenido');
    const resumen = document.getElementById('historial-resumen');
    
    titulo.innerHTML = `
        ${cliente.nombre}
        <span class="modal-close" onclick="cerrarModalHistorial()">&times;</span>
    `;
    
    if (facturasCliente.length === 0) {
        contenido.innerHTML = `
            <div class="historial-vacio">
                <p>📭 Sin facturas</p>
                <button class="btn-mini" onclick="facturarCliente(${id}); cerrarModalHistorial();" style="background:#10b981;color:white;border:none;padding:0.4rem 1rem;border-radius:6px;cursor:pointer;">
                    + Nueva
                </button>
            </div>
        `;
        resumen.innerHTML = '';
    } else {
        let html = '<div class="historial-lista">';
        let totalGeneral = 0;
        
        facturasCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        facturasCliente.forEach(factura => {
            totalGeneral += factura.total;
            const fechaFormateada = formatearFecha(factura.fecha);
            
            html += `
                <div class="historial-item">
                    <div class="historial-info">
                        <strong>${factura.numero}</strong>
                        <span class="fecha">${fechaFormateada}</span>
                    </div>
                    <div class="historial-total">
                        <strong>${factura.total.toFixed(2)} €</strong>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        contenido.innerHTML = html;
        
        resumen.innerHTML = `
            <div class="resumen-total">
                <span>${facturasCliente.length} factura${facturasCliente.length > 1 ? 's' : ''}</span>
                <strong>${totalGeneral.toFixed(2)} €</strong>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
}

function cerrarModalHistorial() {
    document.getElementById('modal-historial').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-historial');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) cerrarModalHistorial();
        });
    }
});

// ========================================
//  FORMATEAR FECHA
// ========================================
function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}