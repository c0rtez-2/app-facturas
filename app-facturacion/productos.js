// ================================================
//  PRODUCTOS.JS - Gestión de productos
// ================================================

let editandoId = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    
    // Buscador
    document.getElementById('buscar-producto').addEventListener('input', function() {
        filtrarProductos(this.value);
    });
    
    // Formulario
    document.getElementById('form-producto').addEventListener('submit', guardarProducto);
});

// ========================================
//  MOSTRAR/OCULTAR FORMULARIO
// ========================================
function mostrarFormulario() {
    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('producto-nombre').focus();
}

function ocultarFormulario() {
    document.getElementById('form-producto-container').style.display = 'none';
    document.getElementById('form-producto').reset();
    editandoId = null;
}

// ========================================
//  CARGAR PRODUCTOS
// ========================================
function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const grid = document.getElementById('grid-productos');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    
    grid.innerHTML = '';
    
    if (productos.length === 0) {
        mensajeVacio.style.display = 'block';
        document.getElementById('total-productos').textContent = '0';
        return;
    }
    
    mensajeVacio.style.display = 'none';
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            ${producto.codigo ? `<span class="producto-codigo">${producto.codigo}</span>` : ''}
            <h4>📦 ${producto.nombre}</h4>
            <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <div class="producto-precio">
                <span class="precio">${producto.precio.toFixed(2)} €</span>
                <span class="iva">IVA ${producto.iva}%</span>
            </div>
            <div class="producto-acciones">
                <button class="btn-mini btn-editar" onclick="editarProducto(${producto.id})">✏️ Editar</button>
                <button class="btn-mini btn-borrar" onclick="eliminarProducto(${producto.id})">🗑️ Borrar</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    document.getElementById('total-productos').textContent = productos.length;
}

// ========================================
//  FILTRAR PRODUCTOS
// ========================================
function filtrarProductos(texto) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        (p.codigo && p.codigo.toLowerCase().includes(texto.toLowerCase()))
    );
    
    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '';
    
    filtrados.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            ${producto.codigo ? `<span class="producto-codigo">${producto.codigo}</span>` : ''}
            <h4>📦 ${producto.nombre}</h4>
            <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <div class="producto-precio">
                <span class="precio">${producto.precio.toFixed(2)} €</span>
                <span class="iva">IVA ${producto.iva}%</span>
            </div>
            <div class="producto-acciones">
                <button class="btn-mini btn-editar" onclick="editarProducto(${producto.id})">✏️ Editar</button>
                <button class="btn-mini btn-borrar" onclick="eliminarProducto(${producto.id})">🗑️ Borrar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ========================================
//  GUARDAR PRODUCTO
// ========================================
function guardarProducto(e) {
    e.preventDefault();
    
    const producto = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('producto-nombre').value.trim(),
        codigo: document.getElementById('producto-codigo').value.trim().toUpperCase(),
        precio: parseFloat(document.getElementById('producto-precio').value),
        iva: parseInt(document.getElementById('producto-iva').value),
        descripcion: document.getElementById('producto-descripcion').value.trim()
    };
    
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    if (editandoId) {
        productos = productos.map(p => p.id === editandoId ? producto : p);
        alert('✅ Producto actualizado');
    } else {
        productos.push(producto);
        alert('✅ Producto guardado');
    }
    
    localStorage.setItem('productos', JSON.stringify(productos));
    ocultarFormulario();
    cargarProductos();
}

// ========================================
//  EDITAR PRODUCTO
// ========================================
function editarProducto(id) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    editandoId = id;
    
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-codigo').value = producto.codigo || '';
    document.getElementById('producto-precio').value = producto.precio;
    document.getElementById('producto-iva').value = producto.iva;
    document.getElementById('producto-descripcion').value = producto.descripcion || '';
    
    mostrarFormulario();
}

// ========================================
//  ELIMINAR PRODUCTO
// ========================================
function eliminarProducto(id) {
    if (!confirm('⚠️ ¿Eliminar este producto?')) return;
    
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem('productos', JSON.stringify(productos));
    
    cargarProductos();
    alert('✅ Producto eliminado');
}