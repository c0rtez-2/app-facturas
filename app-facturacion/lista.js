// ================================================
//  LISTA.JS - Gestión de facturas con menú hamburguesa
// ================================================

let menuAbierto = null;
let facturaActualEstado = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarFacturas();
    
    // Buscador
    document.getElementById('buscar-factura').addEventListener('input', function() {
        filtrarFacturas(this.value);
    });
    
    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu-hamburguesa')) {
            cerrarTodosLosMenus();
        }
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
});

// ========================================
//  TOGGLE MENÚ HAMBURGUESA
// ========================================
function toggleMenuFactura(id, event) {
    event.stopPropagation();
    
    const menu = document.getElementById(`menu-factura-${id}`);
    
    if (menuAbierto && menuAbierto !== menu) {
        menuAbierto.classList.remove('activo');
    }
    
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
//  CARGAR FACTURAS
// ========================================
function cargarFacturas() {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    renderizarFacturas(facturas);
}

// ========================================
//  RENDERIZAR FACTURAS
// ========================================
function renderizarFacturas(facturas) {
    const lista = document.getElementById('lista-facturas');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    
    lista.innerHTML = '';
    
    if (facturas.length === 0) {
        mensajeVacio.style.display = 'block';
        actualizarEstadisticas([], 0, 0, 0);
        return;
    }
    
    mensajeVacio.style.display = 'none';
    
    let totalFacturado = 0;
    let totalPendiente = 0;
    
    // Ordenar por fecha más reciente
    facturas.slice().reverse().forEach(factura => {
        totalFacturado += factura.total;
        
        if (factura.estadoPago !== 'pagado') {
            totalPendiente += factura.total;
        }
        
        // Badge de estado
        let estadoBadge = '';
        let estadoClase = '';
        switch(factura.estadoPago) {
            case 'pagado':
                estadoBadge = '✅ Pagado';
                estadoClase = 'badge-pagado';
                break;
            case 'parcial':
                estadoBadge = '🔄 Parcial';
                estadoClase = 'badge-parcial';
                break;
            default:
                estadoBadge = '⏳ Pendiente';
                estadoClase = 'badge-pendiente';
        }
        
        const card = document.createElement('div');
        card.className = 'factura-card';
        card.innerHTML = `
            <div class="factura-info" onclick="verFactura(${factura.id})">
                <div class="factura-numero">
                    <strong>${factura.numero}</strong>
                    <span class="badge ${estadoClase}">${estadoBadge}</span>
                </div>
                <div class="factura-cliente">
                    ${factura.cliente.nombre}
                </div>
                <div class="factura-meta">
                    <span class="fecha">${formatearFecha(factura.fecha)}</span>
                    <span class="total">${factura.total.toFixed(2)} €</span>
                </div>
            </div>
            
            <!-- MENÚ HAMBURGUESA -->
            <div class="menu-hamburguesa">
                <button class="btn-hamburguesa" onclick="toggleMenuFactura(${factura.id}, event)" title="Opciones">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <div class="menu-dropdown" id="menu-factura-${factura.id}">
                    <button onclick="verFactura(${factura.id})">
                        <span class="emoji">👁️</span> Ver factura
                    </button>
                    <button onclick="descargarPDF(${factura.id})">
                        <span class="emoji">📥</span> Descargar PDF
                    </button>
                    <div class="separador"></div>
                    <button onclick="abrirCambiarEstado(${factura.id})">
                        <span class="emoji">🔄</span> Cambiar estado
                    </button>
                    <button onclick="editarFactura(${factura.id})">
                        <span class="emoji">✏️</span> Editar factura
                    </button>
                    <button onclick="duplicarFactura(${factura.id})">
                        <span class="emoji">📋</span> Duplicar
                    </button>
                    <div class="separador"></div>
                    <button onclick="enviarPorEmail(${factura.id})">
                        <span class="emoji">✉️</span> Enviar por email
                    </button>
                    <div class="separador"></div>
                    <button class="btn-danger" onclick="eliminarFactura(${factura.id})">
                        <span class="emoji">🗑️</span> Eliminar
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
    
    actualizarEstadisticas(facturas, facturas.length, totalFacturado, totalPendiente);
}

// ========================================
//  FILTRAR POR BÚSQUEDA
// ========================================
function filtrarFacturas(texto) {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const filtroEstado = document.getElementById('filtro-estado').value;
    
    let filtradas = facturas.filter(f => 
        f.numero.toLowerCase().includes(texto.toLowerCase()) ||
        f.cliente.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        f.fecha.includes(texto)
    );
    
    if (filtroEstado !== 'todos') {
        filtradas = filtradas.filter(f => (f.estadoPago || 'pendiente') === filtroEstado);
    }
    
    renderizarFacturas(filtradas);
}

// ========================================
//  FILTRAR POR ESTADO
// ========================================
function filtrarPorEstado() {
    const texto = document.getElementById('buscar-factura').value;
    filtrarFacturas(texto);
}

// ========================================
//  VER FACTURA - MODAL PREVIEW MEJORADO
// ========================================
function verFactura(id) {
    cerrarTodosLosMenus();
    
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) {
        alert('❌ Factura no encontrada');
        return;
    }
    
    const modal = document.getElementById('modal-preview');
    const titulo = document.getElementById('preview-titulo');
    const contenido = document.getElementById('preview-contenido');
    const btnDescargar = document.getElementById('btn-descargar-pdf');
    
    titulo.innerHTML = `
        Factura ${factura.numero}
        <span class="modal-close" onclick="cerrarPreview()">&times;</span>
    `;
    
    // Estado
    let estadoHTML = '<span class="badge badge-pendiente">Pendiente</span>';
    let estadoTexto = 'Pendiente';
    if (factura.estadoPago === 'pagado') {
        estadoHTML = '<span class="badge badge-pagado">Pagado</span>';
        estadoTexto = 'Pagado';
    } else if (factura.estadoPago === 'parcial') {
        estadoHTML = '<span class="badge badge-parcial">Pago Parcial</span>';
        estadoTexto = 'Pago Parcial';
    }
    
    // Forma de pago
    const formaPago = factura.tipoPagoTexto || factura.tipoPago || 'No especificado';
    
    // Garantía
    const garantia = factura.garantiaTexto || factura.garantia || 'Sin garantía';
    
    // Productos
    let lineasHTML = '';
    let tieneProductos = factura.lineas && factura.lineas.length > 0;
    
    if (tieneProductos) {
        factura.lineas.forEach((linea, index) => {
            lineasHTML += `
                <div class="preview-linea ${index % 2 === 0 ? 'par' : 'impar'}">
                    <span class="desc">${linea.descripcion || '-'}</span>
                    <span class="cant">${linea.cantidad || 0}</span>
                    <span class="precio">${(linea.precio || 0).toFixed(2)} €</span>
                    <span class="subtotal">${(linea.subtotal || 0).toFixed(2)} €</span>
                </div>
            `;
        });
    }
    
    contenido.innerHTML = `
        <div class="preview-factura">
            
            <!-- CABECERA -->
            <div class="preview-header">
                <div class="empresa-info">
                    <h4>${factura.empresa?.empresa || 'Mi Empresa'}</h4>
                    <p>CIF: ${factura.empresa?.CIF || '-'}</p>
                    <p>${factura.empresa?.direccion || '-'}</p>
                    <p>Tel: ${factura.empresa?.telefono || '-'}</p>
                </div>
                <div class="factura-info-preview">
                    <p><strong>Fecha:</strong> ${formatearFecha(factura.fecha)}</p>
                    <p><strong>Estado:</strong> ${estadoHTML}</p>
                </div>
            </div>
            
            <!-- CLIENTE -->
            <div class="preview-cliente">
                <h4>FACTURADO A</h4>
                <p><strong>${factura.cliente?.nombre || '-'}</strong></p>
                <p>NIF: ${factura.cliente?.nif || '-'}</p>
                ${factura.cliente?.telefono ? `<p>Tel: ${factura.cliente.telefono}</p>` : ''}
                ${factura.cliente?.direccion ? `<p>${factura.cliente.direccion}</p>` : ''}
                ${factura.cliente?.email ? `<p>${factura.cliente.email}</p>` : ''}
            </div>
            
            <!-- INFO ADICIONAL -->
            <div class="preview-info-box">
                <div class="info-item">
                    <span class="label">Forma de Pago</span>
                    <span class="value">${formaPago}</span>
                </div>
                <div class="info-item">
                    <span class="label">Estado</span>
                    <span class="value">${estadoTexto}</span>
                </div>
                <div class="info-item">
                    <span class="label">Garantía</span>
                    <span class="value">${garantia}</span>
                </div>
            </div>
            
            <!-- PRODUCTOS -->
            <div class="preview-productos">
                <div class="preview-linea header">
                    <span class="desc">Descripción</span>
                    <span class="cant">Cant.</span>
                    <span class="precio">Precio</span>
                    <span class="subtotal">Total</span>
                </div>
                ${tieneProductos ? lineasHTML : '<p class="sin-productos">No hay productos</p>'}
            </div>
            
            <!-- TOTALES -->
            <div class="preview-totales">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <strong>${(factura.subtotal || 0).toFixed(2)} €</strong>
                </div>
                <div class="total-row">
                    <span>IVA (21%):</span>
                    <strong>${(factura.iva || 0).toFixed(2)} €</strong>
                </div>
                <div class="total-row final">
                    <span>TOTAL:</span>
                    <strong>${(factura.total || 0).toFixed(2)} €</strong>
                </div>
            </div>
            
            <!-- INFO PAGO Y GARANTÍA -->
            ${(formaPago !== 'No especificado' || garantia !== 'Sin garantía') ? `
                <div class="preview-extra">
                    <p><strong>Forma de Pago:</strong> ${formaPago}</p>
                    <p><strong>Garantía:</strong> ${garantia}</p>
                </div>
            ` : ''}
            
            <!-- OBSERVACIONES -->
            ${factura.observaciones ? `
                <div class="preview-observaciones">
                    <h4>Observaciones:</h4>
                    <p>${factura.observaciones.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
        </div>
    `;
    
    btnDescargar.onclick = function() {
        descargarPDF(id);
    };
    
    modal.style.display = 'flex';
}

// ========================================
//  CAMBIAR ESTADO
// ========================================
function abrirCambiarEstado(id) {
    cerrarTodosLosMenus();
    facturaActualEstado = id;
    document.getElementById('modal-estado').style.display = 'flex';
}

function cerrarModalEstado() {
    document.getElementById('modal-estado').style.display = 'none';
    facturaActualEstado = null;
}

function cambiarEstado(nuevoEstado) {
    if (!facturaActualEstado) return;
    
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const index = facturas.findIndex(f => f.id === facturaActualEstado);
    
    if (index > -1) {
        facturas[index].estadoPago = nuevoEstado;
        localStorage.setItem('facturas', JSON.stringify(facturas));
        
        cerrarModalEstado();
        cargarFacturas();
        
        // Mensaje de confirmación
        const estados = {
            'pendiente': '⏳ Pendiente',
            'parcial': '🔄 Pago Parcial',
            'pagado': '✅ Pagado'
        };
        console.log(`✅ Estado cambiado a: ${estados[nuevoEstado]}`);
    }
}

// ========================================
//  EDITAR FACTURA
// ========================================
function editarFactura(id) {
    cerrarTodosLosMenus();
    
    // Guardar ID de factura a editar
    localStorage.setItem('facturaEditar', id);
    location.href = 'nueva-factura.html';
}

// ========================================
//  DUPLICAR FACTURA
// ========================================
function duplicarFactura(id) {
    cerrarTodosLosMenus();
    
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) return;
    
    if (!confirm('¿Crear una copia de esta factura?')) return;
    
    // Crear copia con nuevo ID y número
    const nuevaFactura = JSON.parse(JSON.stringify(factura));
    nuevaFactura.id = Date.now();
    nuevaFactura.numero = generarNuevoNumero(facturas);
    nuevaFactura.fecha = new Date().toISOString().split('T')[0];
    nuevaFactura.estadoPago = 'pendiente';
    nuevaFactura.fechaCreacion = new Date().toLocaleString('es-ES');
    
    facturas.push(nuevaFactura);
    localStorage.setItem('facturas', JSON.stringify(facturas));
    
    cargarFacturas();
    alert(`✅ Factura duplicada: ${nuevaFactura.numero}`);
}

function generarNuevoNumero(facturas) {
    const year = new Date().getFullYear();
    const numero = facturas.length + 1;
    return `${year}-${String(numero).padStart(3, '0')}`;
}

// ========================================
//  ENVIAR POR EMAIL
// ========================================
function enviarPorEmail(id) {
    cerrarTodosLosMenus();
    
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) return;
    
    const email = factura.cliente.email || '';
    const asunto = encodeURIComponent(`Factura ${factura.numero} - ${factura.empresa.empresa}`);
    const cuerpo = encodeURIComponent(
        `Estimado/a ${factura.cliente.nombre},\n\n` +
        `Adjunto encontrará la factura ${factura.numero} por importe de ${factura.total.toFixed(2)} €.\n\n` +
        `Fecha: ${formatearFecha(factura.fecha)}\n` +
        `Estado: ${factura.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente de pago'}\n\n` +
        `Gracias por su confianza.\n\n` +
        `Atentamente,\n${factura.empresa.empresa}`
    );
    
    if (email) {
        window.location.href = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    } else {
        window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
    }
}

// ========================================
//  ELIMINAR FACTURA
// ========================================
function eliminarFactura(id) {
    cerrarTodosLosMenus();
    
    if (!confirm('⚠️ ¿Eliminar esta factura?\n\nEsta acción no se puede deshacer.')) return;
    
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas = facturas.filter(f => f.id !== id);
    localStorage.setItem('facturas', JSON.stringify(facturas));
    
    cargarFacturas();
}

// ========================================
//  DESCARGAR PDF - VERSIÓN MEJORADA
// ========================================
function descargarPDF(id) {
    cerrarTodosLosMenus();
    
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) {
        alert('❌ Factura no encontrada');
        return;
    }
    
    if (typeof window.jspdf === 'undefined') {
        alert('⚠️ Cargando librería PDF... Inténtalo de nuevo.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // ========================================
    //  COLORES
    // ========================================
    const morado1 = [102, 126, 234];
    const morado2 = [118, 75, 162];
    const negro = [30, 41, 59];
    const gris = [100, 116, 139];
    const grisClaro = [241, 245, 249];
    const verde = [16, 185, 129];
    const naranja = [245, 158, 11];
    const azul = [14, 165, 233];
    
    let y = 0;
    
    // ========================================
    //  CABECERA CON GRADIENTE
    // ========================================
    for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = morado1[0] + (morado2[0] - morado1[0]) * ratio;
        const g = morado1[1] + (morado2[1] - morado1[1]) * ratio;
        const b = morado1[2] + (morado2[2] - morado1[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 210, 1, 'F');
    }
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('N' + String.fromCharCode(186) + ' ' + factura.numero, 105, 30, { align: 'center' });
    
    y = 50;
    
    // ========================================
    //  DATOS EMPRESA (Izquierda)
    // ========================================
    doc.setTextColor(...negro);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('EMITIDO POR', 15, y);
    
    y += 5;
    doc.setFontSize(12);
    doc.text(factura.empresa.empresa || 'Mi Empresa', 15, y);
    
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gris);
    doc.text('CIF: ' + (factura.empresa.CIF || '-'), 15, y);
    
    y += 4;
    doc.text(factura.empresa.direccion || '-', 15, y);
    
    y += 4;
    doc.text('Tel: ' + (factura.empresa.telefono || '-'), 15, y);
    
    y += 4;
    doc.text(factura.empresa.email || '-', 15, y);
    
    // ========================================
    //  DATOS CLIENTE (Derecha)
    // ========================================
    y = 50;
    doc.setTextColor(...negro);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURADO A', 195, y, { align: 'right' });

    y += 5;
    doc.setFontSize(12);
    doc.text(factura.cliente.nombre || '-', 195, y, { align: 'right' });

    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gris);
    doc.text('NIF: ' + (factura.cliente.nif || '-'), 195, y, { align: 'right' });

    if (factura.cliente.telefono) {
        y += 4;
        doc.text('Tel: ' + factura.cliente.telefono, 195, y, { align: 'right' });
    }

    if (factura.cliente.direccion) {
        y += 4;
        doc.text(factura.cliente.direccion, 195, y, { align: 'right' });
    }

    if (factura.cliente.email) {
        y += 4;
        doc.text(factura.cliente.email, 195, y, { align: 'right' });
    }
    // ========================================
    //  CAJA DE INFORMACIÓN
    // ========================================
    y = 85;
    doc.setFillColor(...grisClaro);
    doc.roundedRect(15, y, 180, 16, 2, 2, 'F');
    
    // Textos de la caja
    y += 6;
    doc.setTextColor(...gris);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    
    doc.text('FECHA', 25, y);
    doc.text('FORMA DE PAGO', 65, y);
    doc.text('ESTADO', 115, y);
    doc.text('GARANTIA', 160, y);
    
    y += 5;
    doc.setTextColor(...negro);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Fecha formateada
    doc.text(formatearFecha(factura.fecha), 25, y);
    
    // Forma de pago
    const formaPago = factura.tipoPagoTexto || factura.tipoPago || 'No especificado';
    doc.text(formaPago, 65, y);
    
    // Estado con color
    let estadoTexto = 'Pendiente';
    if (factura.estadoPago === 'pagado') {
        estadoTexto = 'Pagado';
        doc.setTextColor(...verde);
    } else if (factura.estadoPago === 'parcial') {
        estadoTexto = 'Pago Parcial';
        doc.setTextColor(...azul);
    } else {
        estadoTexto = 'Pendiente';
        doc.setTextColor(...naranja);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(estadoTexto, 115, y);
    
    // Garantía
    doc.setTextColor(...negro);
    doc.setFont('helvetica', 'normal');
    const garantiaTexto = factura.garantiaTexto || factura.garantia || 'Sin garantia';
    doc.text(garantiaTexto, 160, y);
    
    // ========================================
    //  TABLA DE PRODUCTOS
    // ========================================
    y = 110;
    
    // Cabecera de la tabla
    doc.setFillColor(...morado1);
    doc.rect(15, y, 180, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    y += 7;
    doc.text('DESCRIPCION', 20, y);
    doc.text('CANT.', 125, y);
    doc.text('PRECIO', 145, y);
    doc.text('TOTAL', 175, y);
    
    y += 5;
    
    // Filas de productos
    doc.setTextColor(...negro);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    if (factura.lineas && factura.lineas.length > 0) {
        factura.lineas.forEach((linea, index) => {
            // Fondo alternado
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(15, y - 4, 180, 8, 'F');
            }
            
            // Descripción (truncar si es muy larga)
            let descripcion = linea.descripcion || '-';
            if (descripcion.length > 45) {
                descripcion = descripcion.substring(0, 42) + '...';
            }
            
            doc.setTextColor(...negro);
            doc.text(descripcion, 20, y);
            doc.text(String(linea.cantidad || 0), 125, y);
            doc.text((linea.precio || 0).toFixed(2) + ' EUR', 145, y);
            
            doc.setFont('helvetica', 'bold');
            doc.text((linea.subtotal || 0).toFixed(2) + ' EUR', 175, y);
            doc.setFont('helvetica', 'normal');
            
            y += 8;
        });
    }
    
    // Línea separadora
    y += 2;
    doc.setDrawColor(...gris);
    doc.setLineWidth(0.3);
    doc.line(15, y, 195, y);
    
    // ========================================
    //  TOTALES
    // ========================================
    y += 10;
    
    // Subtotal
    doc.setTextColor(...gris);
    doc.setFontSize(9);
    doc.text('Subtotal:', 145, y);
    doc.setTextColor(...negro);
    doc.text((factura.subtotal || 0).toFixed(2) + ' EUR', 190, y, { align: 'right' });
    
    // IVA
    y += 6;
    doc.setTextColor(...gris);
    doc.text('IVA (21%):', 145, y);
    doc.setTextColor(...negro);
    doc.text((factura.iva || 0).toFixed(2) + ' EUR', 190, y, { align: 'right' });
    
    // Total destacado
    y += 10;
    doc.setFillColor(...morado1);
    doc.roundedRect(130, y - 6, 65, 14, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 135, y + 2);
    doc.setFontSize(14);
    doc.text((factura.total || 0).toFixed(2) + ' EUR', 190, y + 2, { align: 'right' });
    
    // ========================================
    //  OBSERVACIONES
    // ========================================
    if (factura.observaciones && factura.observaciones.trim() !== '') {
        y += 20;
        
        // Calcular altura necesaria
        doc.setFontSize(8);
        const observacionesLineas = doc.splitTextToSize(factura.observaciones, 165);
        const alturaObs = Math.max(observacionesLineas.length * 4 + 12, 20);
        
        // Fondo
        doc.setFillColor(...grisClaro);
        doc.roundedRect(15, y, 180, alturaObs, 2, 2, 'F');
        
        // Borde izquierdo
        doc.setFillColor(...morado1);
        doc.rect(15, y, 3, alturaObs, 'F');
        
        // Título
        y += 6;
        doc.setTextColor(...negro);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 22, y);
        
        // Texto
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gris);
        observacionesLineas.forEach(linea => {
            doc.text(linea, 22, y);
            y += 4;
        });
    }
    
    // ========================================
    //  PIE DE PÁGINA
    // ========================================
    
    // Línea decorativa
    doc.setDrawColor(...morado1);
    doc.setLineWidth(1);
    doc.line(15, 275, 195, 275);
    
    // Texto de agradecimiento
    doc.setTextColor(...gris);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por su confianza.', 105, 282, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(6);
    doc.text('Documento generado el ' + new Date().toLocaleString('es-ES'), 105, 287, { align: 'center' });
    
    // ========================================
    //  GUARDAR PDF
    // ========================================
    const nombreArchivo = 'Factura_' + factura.numero.replace(/[\/\\:]/g, '-') + '.pdf';
    doc.save(nombreArchivo);
    
    console.log('PDF generado:', nombreArchivo);
}
// ========================================
//  FORMATEAR FECHA
// ========================================
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ========================================
//  CERRAR PREVIEW - FIX
// ========================================
function cerrarPreview() {
    const modal = document.getElementById('modal-preview');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
    // Modal Preview
    const modalPreview = document.getElementById('modal-preview');
    if (modalPreview) {
        modalPreview.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarPreview();
            }
        });
    }
    
    // Modal Estado
    const modalEstado = document.getElementById('modal-estado');
    if (modalEstado) {
        modalEstado.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalEstado();
            }
        });
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarPreview();
        cerrarModalEstado();
        cerrarTodosLosMenus();
    }
});