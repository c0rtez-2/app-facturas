// ================================================
//  FACTURA.JS - Crear y Editar facturas
// ================================================

let contadorLineas = 0;
let modoEdicion = false;
let facturaEditandoId = null;

document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar si estamos editando una factura
    verificarModoEdicion();
    
    // Establecer fecha actual (solo si no estamos editando)
    if (!modoEdicion) {
        const hoy = new Date();
        document.getElementById('fecha-factura').value = hoy.toISOString().split('T')[0];
        generarNumeroFactura();
    }
    
    // Cargar clientes en el selector
    cargarClientesSelector();
    
    // Si no estamos editando, añadir primera línea
    if (!modoEdicion) {
        agregarLinea();
    }
    
    // Convertir NIF a mayúsculas
    const inputNif = document.getElementById('cliente-nif');
    if (inputNif) {
        inputNif.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
    
    // Manejar envío del formulario
    const formFactura = document.getElementById('form-factura');
    if (formFactura) {
        formFactura.addEventListener('submit', guardarFactura);
    }
    
    // Evento para selector de cliente
    const selectorCliente = document.getElementById('selector-cliente');
    if (selectorCliente) {
        selectorCliente.addEventListener('change', cargarDatosCliente);
    }
    
    // Evento para garantía personalizada
    const selectorGarantia = document.getElementById('garantia');
    if (selectorGarantia) {
        selectorGarantia.addEventListener('change', toggleGarantiaPersonalizada);
    }
    
    // Preseleccionar cliente si viene de la página de clientes
    if (!modoEdicion) {
        preseleccionarCliente();
    }
});

// ========================================
//  VERIFICAR MODO EDICIÓN
// ========================================
function verificarModoEdicion() {
    const facturaEditarId = localStorage.getItem('facturaEditar');
    
    if (facturaEditarId) {
        modoEdicion = true;
        facturaEditandoId = parseInt(facturaEditarId);
        
        // Limpiar para que no se repita
        localStorage.removeItem('facturaEditar');
        
        // Cargar datos de la factura
        cargarFacturaParaEditar(facturaEditandoId);
        
        // Cambiar título
        const titulo = document.querySelector('.factura-container h2');
        if (titulo) {
            titulo.textContent = '✏️ Editar Factura';
        }
        
        // Cambiar botón
        const btnGuardar = document.querySelector('.btn-guardar');
        if (btnGuardar) {
            btnGuardar.textContent = '💾 Actualizar Factura';
        }
    }
}

// ========================================
//  CARGAR FACTURA PARA EDITAR
// ========================================
function cargarFacturaParaEditar(id) {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) {
        alert('❌ Factura no encontrada');
        location.href = 'lista-facturas.html';
        return;
    }
    
    console.log('📝 Cargando factura para editar:', factura);
    
    // Datos de la factura
    document.getElementById('numero-factura').value = factura.numero;
    document.getElementById('fecha-factura').value = factura.fecha;
    
// Datos del cliente
document.getElementById('cliente-nombre').value = factura.cliente.nombre || '';
document.getElementById('cliente-nif').value = factura.cliente.nif || '';
document.getElementById('cliente-telefono').value = factura.cliente.telefono || '';
document.getElementById('cliente-direccion').value = factura.cliente.direccion || '';
document.getElementById('cliente-email').value = factura.cliente.email || '';
    // Si el cliente existe en la lista, seleccionarlo
    if (factura.clienteId) {
        const selector = document.getElementById('selector-cliente');
        if (selector) {
            // Esperar a que se carguen los clientes
            setTimeout(() => {
                selector.value = factura.clienteId;
            }, 100);
        }
    }
    
    // Cargar líneas de productos
    const container = document.getElementById('lineas-container');
    container.innerHTML = ''; // Limpiar
    
    factura.lineas.forEach(linea => {
        agregarLineaConDatos(linea);
    });
    
    // Calcular totales
    calcularTotales();
    
    // Tipo de pago
    if (factura.tipoPago) {
        document.getElementById('tipo-pago').value = factura.tipoPago;
    }
    
    // Estado de pago
    if (factura.estadoPago) {
        document.getElementById('estado-pago').value = factura.estadoPago;
    }
    
    // Garantía
    if (factura.garantia) {
        document.getElementById('garantia').value = factura.garantia;
        toggleGarantiaPersonalizada();
        
        if (factura.garantia === 'personalizada' && factura.garantiaTexto) {
            document.getElementById('garantia-personalizada').value = factura.garantiaTexto;
        }
    }
    
    // Observaciones
    if (factura.observaciones) {
        document.getElementById('observaciones').value = factura.observaciones;
    }
}

// ========================================
//  AGREGAR LÍNEA CON DATOS
// ========================================
function agregarLineaConDatos(datos) {
    contadorLineas++;
    
    const container = document.getElementById('lineas-container');
    const linea = document.createElement('div');
    linea.className = 'linea-producto';
    linea.id = `linea-${contadorLineas}`;
    
    const productosOptions = getProductosOptions();
    
    linea.innerHTML = `
        <div class="form-group selector-producto-group">
            <label>Producto</label>
            <select class="selector-producto" onchange="seleccionarProducto(this, ${contadorLineas})">
                ${productosOptions}
            </select>
        </div>
        <div class="form-group descripcion-group">
            <label>Descripción</label>
            <input type="text" class="descripcion" placeholder="Descripción" required value="${datos.descripcion || ''}">
        </div>
        <div class="form-group cantidad-group">
            <label>Cant.</label>
            <input type="number" class="cantidad" min="1" value="${datos.cantidad || 1}" required onchange="calcularTotales()" oninput="calcularTotales()">
        </div>
        <div class="form-group precio-group">
            <label>Precio €</label>
            <input type="number" class="precio" min="0" step="0.01" value="${datos.precio || 0}" required onchange="calcularTotales()" oninput="calcularTotales()">
        </div>
        <div class="form-group subtotal-group">
            <label>Subtotal</label>
            <input type="text" class="subtotal-linea" value="${(datos.subtotal || 0).toFixed(2)} €" disabled>
        </div>
        <button type="button" class="btn-eliminar-linea" onclick="eliminarLinea(${contadorLineas})" title="Eliminar">🗑️</button>
    `;
    
    container.appendChild(linea);
}

// ========================================
//  TOGGLE GARANTÍA PERSONALIZADA
// ========================================
function toggleGarantiaPersonalizada() {
    const selector = document.getElementById('garantia');
    const grupo = document.getElementById('garantia-personalizada-grupo');
    
    if (!selector || !grupo) return;
    
    if (selector.value === 'personalizada') {
        grupo.style.display = 'block';
        document.getElementById('garantia-personalizada').focus();
    } else {
        grupo.style.display = 'none';
        document.getElementById('garantia-personalizada').value = '';
    }
}

// ========================================
//  AGREGAR CONDICIÓN RÁPIDA
// ========================================
function agregarCondicion(texto) {
    const textarea = document.getElementById('observaciones');
    
    if (textarea.value.trim() !== '') {
        textarea.value += '\n';
    }
    
    textarea.value += '• ' + texto;
    textarea.scrollTop = textarea.scrollHeight;
    
    textarea.style.borderColor = '#10b981';
    setTimeout(() => {
        textarea.style.borderColor = '#e2e8f0';
    }, 500);
}

// ========================================
//  CARGAR CLIENTES EN SELECTOR
// ========================================
function cargarClientesSelector() {
    const selector = document.getElementById('selector-cliente');
    if (!selector) return;
    
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    selector.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    selector.innerHTML += '<option value="nuevo">➕ Nuevo cliente</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nombre} - ${cliente.nif}`;
        selector.appendChild(option);
    });
}

// ========================================
//  CARGAR DATOS DEL CLIENTE SELECCIONADO
// ========================================
function cargarDatosCliente() {
    const selector = document.getElementById('selector-cliente');
    const clienteId = selector.value;
    
    const campos = ['cliente-nombre', 'cliente-nif', 'cliente-telefono', 'cliente-direccion', 'cliente-email'];
    
    if (clienteId === 'nuevo' || clienteId === '') {
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '';
                el.disabled = false;
            }
        });
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id == clienteId);
    
    if (cliente) {
        document.getElementById('cliente-nombre').value = cliente.nombre || '';
        document.getElementById('cliente-nif').value = cliente.nif || '';
        document.getElementById('cliente-telefono').value = cliente.telefono || '';
        document.getElementById('cliente-direccion').value = cliente.direccion || '';
        document.getElementById('cliente-email').value = cliente.email || '';
        
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
    }
}

// ========================================
//  PRESELECCIONAR CLIENTE
// ========================================
function preseleccionarCliente() {
    setTimeout(function() {
        const clientePreseleccionado = localStorage.getItem('clientePreseleccionado');
        
        if (clientePreseleccionado) {
            const selector = document.getElementById('selector-cliente');
            if (selector) {
                selector.value = clientePreseleccionado;
                cargarDatosCliente();
            }
            localStorage.removeItem('clientePreseleccionado');
        }
    }, 100);
}

// ========================================
//  GENERAR NÚMERO DE FACTURA
// ========================================
function generarNumeroFactura() {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const year = new Date().getFullYear();
    const numero = facturas.length + 1;
    const inputNumero = document.getElementById('numero-factura');
    if (inputNumero) {
        inputNumero.value = `${year}-${String(numero).padStart(3, '0')}`;
    }
}

// ========================================
//  AÑADIR LÍNEA DE PRODUCTO
// ========================================
function agregarLinea() {
    agregarLineaConDatos({
        descripcion: '',
        cantidad: 1,
        precio: 0,
        subtotal: 0
    });
}

// ========================================
//  OBTENER OPCIONES DE PRODUCTOS
// ========================================
function getProductosOptions() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    let options = '<option value="">-- Producto --</option>';
    options += '<option value="manual">✏️ Manual</option>';
    
    productos.forEach(producto => {
        options += `<option value="${producto.id}" data-precio="${producto.precio}">
            ${producto.nombre} - ${producto.precio.toFixed(2)}€
        </option>`;
    });
    
    return options;
}

// ========================================
//  SELECCIONAR PRODUCTO
// ========================================
function seleccionarProducto(selector, lineaId) {
    const linea = document.getElementById(`linea-${lineaId}`);
    if (!linea) return;
    
    const productoId = selector.value;
    
    if (productoId === 'manual' || productoId === '') {
        linea.querySelector('.descripcion').value = '';
        linea.querySelector('.descripcion').disabled = false;
        linea.querySelector('.precio').value = '0';
        linea.querySelector('.precio').disabled = false;
        calcularTotales();
        return;
    }
    
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.id == productoId);
    
    if (producto) {
        linea.querySelector('.descripcion').value = producto.nombre + (producto.descripcion ? ' - ' + producto.descripcion : '');
        linea.querySelector('.precio').value = producto.precio;
        calcularTotales();
    }
}

// ========================================
//  ELIMINAR LÍNEA
// ========================================
function eliminarLinea(id) {
    const lineas = document.querySelectorAll('.linea-producto');
    
    if (lineas.length > 1) {
        const linea = document.getElementById(`linea-${id}`);
        if (linea) {
            linea.remove();
            calcularTotales();
        }
    } else {
        alert('⚠️ Debe haber al menos una línea');
    }
}

// ========================================
//  CALCULAR TOTALES
// ========================================
function calcularTotales() {
    let subtotal = 0;
    
    document.querySelectorAll('.linea-producto').forEach(linea => {
        const cantidadInput = linea.querySelector('.cantidad');
        const precioInput = linea.querySelector('.precio');
        const subtotalInput = linea.querySelector('.subtotal-linea');
        
        if (cantidadInput && precioInput && subtotalInput) {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const precio = parseFloat(precioInput.value) || 0;
            const total = cantidad * precio;
            
            subtotalInput.value = total.toFixed(2) + ' €';
            subtotal += total;
        }
    });
    
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('iva').textContent = iva.toFixed(2) + ' €';
    document.getElementById('total').textContent = total.toFixed(2) + ' €';
}

// ========================================
//  GUARDAR FACTURA (Crear o Actualizar)
// ========================================
function guardarFactura(e) {
    e.preventDefault();
    
    // Habilitar campos temporalmente
    const camposCliente = ['cliente-nombre', 'cliente-nif', 'cliente-telefono', 'cliente-direccion', 'cliente-email'];
    camposCliente.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });

    // Datos del cliente
    const cliente = {
        nombre: document.getElementById('cliente-nombre').value.trim(),
        nif: document.getElementById('cliente-nif').value.trim().toUpperCase(),
        telefono: document.getElementById('cliente-telefono').value.trim(),
        direccion: document.getElementById('cliente-direccion').value.trim(),
        email: document.getElementById('cliente-email').value.trim()
    };
    
    if (!cliente.nombre || !cliente.nif) {
        alert('⚠️ Completa el nombre y NIF del cliente');
        return;
    }
    
    // Datos de la factura
    const numeroFactura = document.getElementById('numero-factura').value;
    const fecha = document.getElementById('fecha-factura').value;
    
    // Líneas de productos
    const lineas = [];
    let hayLineasVacias = false;
    
    document.querySelectorAll('.linea-producto').forEach(linea => {
        const descripcion = linea.querySelector('.descripcion').value.trim();
        const cantidad = parseFloat(linea.querySelector('.cantidad').value) || 0;
        const precio = parseFloat(linea.querySelector('.precio').value) || 0;
        
        if (!descripcion || cantidad <= 0 || precio <= 0) {
            hayLineasVacias = true;
        }
        
        lineas.push({
            descripcion: descripcion,
            cantidad: cantidad,
            precio: precio,
            subtotal: cantidad * precio
        });
    });
    
    if (hayLineasVacias) {
        alert('⚠️ Completa todos los campos de productos');
        return;
    }
    
    // Totales
    const subtotal = lineas.reduce((sum, l) => sum + l.subtotal, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    // Datos de pago, garantía y observaciones
    const tipoPago = document.getElementById('tipo-pago').value;
    const estadoPago = document.getElementById('estado-pago').value;
    const garantiaSelect = document.getElementById('garantia').value;
    const garantiaPersonalizada = document.getElementById('garantia-personalizada').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();
    
    // Texto de garantía
    let garantiaTexto = '';
    const garantiasTexto = {
        'sin': 'Sin garantía',
        '15dias': '15 días',
        '30dias': '30 días',
        '3meses': '3 meses',
        '6meses': '6 meses',
        '1año': '1 año',
        '2años': '2 años',
        '3años': '3 años',
        'personalizada': garantiaPersonalizada || 'Personalizada'
    };
    garantiaTexto = garantiasTexto[garantiaSelect] || garantiaSelect;
    
    // Texto de tipo de pago
    const tiposPagoTexto = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia',
        'bizum': 'Bizum',
        'paypal': 'PayPal',
        'domiciliacion': 'Domiciliación',
        'contrarrembolso': 'Contrareembolso',
        'aplazado': 'Pago Aplazado',
        'otro': 'Otro'
    };
    
    // Datos de la empresa
    const empresa = JSON.parse(localStorage.getItem('datosEmpresa'));
    
    // Crear objeto factura
    const factura = {
        id: modoEdicion ? facturaEditandoId : Date.now(),
        numero: numeroFactura,
        fecha: fecha,
        cliente: cliente,
        clienteId: document.getElementById('selector-cliente').value || null,
        empresa: empresa,
        lineas: lineas,
        subtotal: subtotal,
        iva: iva,
        total: total,
        tipoPago: tipoPago,
        tipoPagoTexto: tiposPagoTexto[tipoPago] || tipoPago,
        estadoPago: estadoPago,
        garantia: garantiaSelect,
        garantiaTexto: garantiaTexto,
        observaciones: observaciones,
        fechaCreacion: modoEdicion ? undefined : new Date().toLocaleString('es-ES'),
        fechaModificacion: modoEdicion ? new Date().toLocaleString('es-ES') : undefined
    };
    
    // Guardar
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    
    if (modoEdicion) {
        // Actualizar factura existente
        const index = facturas.findIndex(f => f.id === facturaEditandoId);
        if (index > -1) {
            // Mantener fecha de creación original
            factura.fechaCreacion = facturas[index].fechaCreacion;
            facturas[index] = factura;
            console.log('✅ Factura actualizada:', factura);
            alert('✅ Factura actualizada correctamente');
        }
    } else {
        // Crear nueva factura
        facturas.push(factura);
        console.log('✅ Factura creada:', factura);
        alert('✅ Factura guardada correctamente');
    }
    
    localStorage.setItem('facturas', JSON.stringify(facturas));
    location.href = 'lista-facturas.html';
}

// ========================================
//  PREVISUALIZAR FACTURA
// ========================================
function previsualizarFactura() {
    alert('🚧 Vista previa en desarrollo.\nGuarda la factura para verla.');
}