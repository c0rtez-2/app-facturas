// ================================================
//  GENERAR PDF PROFESIONAL
// ================================================

function generarPDF(facturaId) {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === facturaId);
    
    if (!factura) {
        alert('❌ Factura no encontrada');
        return;
    }
    
    // Importar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // ========================================
    //  CONFIGURACIÓN DE COLORES Y FUENTES
    // ========================================
    const colorPrimario = [102, 126, 234]; // #667eea
    const colorSecundario = [118, 75, 162]; // #764ba2
    const colorTexto = [30, 41, 59]; // #1e293b
    const colorGris = [100, 116, 139]; // #64748b
    const colorGrisClaro = [241, 245, 249]; // #f1f5f9
    
    let y = 20; // Posición Y inicial
    
    // ========================================
    //  CABECERA CON GRADIENTE
    // ========================================
    
    // Fondo degradado (simulado con rectángulos)
    for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = colorPrimario[0] + (colorSecundario[0] - colorPrimario[0]) * ratio;
        const g = colorPrimario[1] + (colorSecundario[1] - colorPrimario[1]) * ratio;
        const b = colorPrimario[2] + (colorSecundario[2] - colorPrimario[2]) * ratio;
        
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 210, 1, 'F');
    }
    
    // Título FACTURA
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nº ${factura.numero}`, 105, 32, { align: 'center' });
    
    y = 50;
    
    // ========================================
    //  DATOS DE LA EMPRESA (Izquierda)
    // ========================================
    
    doc.setTextColor(...colorTexto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMITIDO POR', 15, y);
    
    y += 7;
    doc.setFontSize(14);
    doc.text(factura.empresa.empresa, 15, y);
    
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorGris);
    doc.text(`CIF: ${factura.empresa.CIF}`, 15, y);
    
    y += 5;
    doc.text(factura.empresa.direccion, 15, y);
    
    y += 5;
    doc.text(`Tel: ${factura.empresa.telefono}`, 15, y);
    
    y += 5;
    doc.text(`Email: ${factura.empresa.email}`, 15, y);
    
    // ========================================
    //  DATOS DEL CLIENTE (Derecha)
    // ========================================
    
    y = 50;
    doc.setTextColor(...colorTexto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURADO A', 195, y, { align: 'right' });
    
    y += 7;
    doc.setFontSize(14);
    doc.text(factura.cliente.nombre, 195, y, { align: 'right' });
    
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorGris);
    doc.text(`NIF: ${factura.cliente.nif}`, 195, y, { align: 'right' });
    
    if (factura.cliente.direccion) {
        y += 5;
        doc.text(factura.cliente.direccion, 195, y, { align: 'right' });
    }
    
    if (factura.cliente.email) {
        y += 5;
        doc.text(factura.cliente.email, 195, y, { align: 'right' });
    }
    
    // ========================================
    //  INFORMACIÓN DE LA FACTURA
    // ========================================
    
    y = 95;
    
    // Caja con info clave
    doc.setFillColor(...colorGrisClaro);
    doc.roundedRect(15, y, 180, 18, 3, 3, 'F');
    
    y += 7;
    doc.setTextColor(...colorGris);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    doc.text('FECHA EMISIÓN', 20, y);
    doc.text('FORMA DE PAGO', 75, y);
    doc.text('ESTADO', 130, y);
    doc.text('GARANTÍA', 165, y);
    
    y += 5;
    doc.setTextColor(...colorTexto);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text(formatearFechaPDF(factura.fecha), 20, y);
    doc.text(factura.tipoPagoTexto || 'No especificado', 75, y);
    
    // Estado con color
    if (factura.estadoPago === 'pagado') {
        doc.setTextColor(21, 128, 61); // verde
        doc.text('✓ Pagado', 130, y);
    } else if (factura.estadoPago === 'parcial') {
        doc.setTextColor(3, 105, 161); // azul
        doc.text('◐ Parcial', 130, y);
    } else {
        doc.setTextColor(180, 83, 9); // naranja
        doc.text('⏳ Pendiente', 130, y);
    }
    
    doc.setTextColor(...colorTexto);
    doc.text(factura.garantiaTexto || 'Sin garantía', 165, y);
    
    // ========================================
    //  TABLA DE PRODUCTOS/SERVICIOS
    // ========================================
    
    y = 125;
    
    // Cabecera de tabla
    doc.setFillColor(...colorPrimario);
    doc.rect(15, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    doc.text('DESCRIPCIÓN', 18, y + 5.5);
    doc.text('CANT.', 140, y + 5.5, { align: 'center' });
    doc.text('PRECIO', 160, y + 5.5, { align: 'right' });
    doc.text('TOTAL', 185, y + 5.5, { align: 'right' });
    
    y += 8;
    
    // Líneas de productos
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    factura.lineas.forEach((linea, index) => {
        // Alternar colores de fondo
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y, 180, 8, 'F');
        }
        
        // Descripción (truncar si es muy larga)
        let descripcion = linea.descripcion;
        if (descripcion.length > 60) {
            descripcion = descripcion.substring(0, 57) + '...';
        }
        
        doc.setFontSize(8.5);
        doc.text(descripcion, 18, y + 5.5);
        doc.text(linea.cantidad.toString(), 140, y + 5.5, { align: 'center' });
        doc.text(`${linea.precio.toFixed(2)} €`, 160, y + 5.5, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${linea.subtotal.toFixed(2)} €`, 185, y + 5.5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        y += 8;
    });
    
    // Línea separadora
    doc.setDrawColor(...colorGris);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 195, y + 2);
    
    // ========================================
    //  TOTALES
    // ========================================
    
    y += 10;
    
    doc.setFontSize(9);
    doc.setTextColor(...colorGris);
    
    // Subtotal
    doc.text('Subtotal:', 155, y, { align: 'right' });
    doc.setTextColor(...colorTexto);
    doc.text(`${factura.subtotal.toFixed(2)} €`, 185, y, { align: 'right' });
    
    y += 6;
    doc.setTextColor(...colorGris);
    doc.text('IVA (21%):', 155, y, { align: 'right' });
    doc.setTextColor(...colorTexto);
    doc.text(`${factura.iva.toFixed(2)} €`, 185, y, { align: 'right' });
    
    y += 8;
    
    // Total destacado
    doc.setFillColor(...colorPrimario);
    doc.roundedRect(130, y - 4, 65, 10, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 155, y + 2, { align: 'right' });
    doc.setFontSize(14);
    doc.text(`${factura.total.toFixed(2)} €`, 190, y + 2, { align: 'right' });
    
    // ========================================
    //  OBSERVACIONES
    // ========================================
    
    if (factura.observaciones && factura.observaciones.trim() !== '') {
        y += 20;
        
        doc.setFillColor(...colorGrisClaro);
        
        // Calcular altura necesaria para las observaciones
        const observacionesLineas = doc.splitTextToSize(factura.observaciones, 170);
        const alturaObservaciones = observacionesLineas.length * 5 + 10;
        
        doc.roundedRect(15, y, 180, alturaObservaciones, 3, 3, 'F');
        
        y += 7;
        doc.setTextColor(...colorTexto);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 18, y);
        
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorGris);
        
        observacionesLineas.forEach(linea => {
            doc.text(linea, 18, y);
            y += 5;
        });
    }
    
    // ========================================
    //  PIE DE PÁGINA
    // ========================================
    
    doc.setFontSize(7);
    doc.setTextColor(...colorGris);
    doc.setFont('helvetica', 'italic');
    
    const textoPie = 'Factura generada electrónicamente. Gracias por su confianza.';
    doc.text(textoPie, 105, 285, { align: 'center' });
    
    // Línea decorativa final
    doc.setDrawColor(...colorPrimario);
    doc.setLineWidth(1);
    doc.line(15, 280, 195, 280);
    
    // ========================================
    //  GUARDAR PDF
    // ========================================
    
    const nombreArchivo = `Factura_${factura.numero.replace(/\//g, '-')}_${factura.cliente.nombre.replace(/\s/g, '_')}.pdf`;
    doc.save(nombreArchivo);
    
    console.log('✅ PDF generado:', nombreArchivo);
}

// ========================================
//  FORMATEAR FECHA PARA PDF
// ========================================
function formatearFechaPDF(fecha) {
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ========================================
//  VISTA PREVIA DE FACTURA (MODAL)
// ========================================
function previsualizarFacturaPDF(facturaId) {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const factura = facturas.find(f => f.id === facturaId);
    
    if (!factura) {
        alert('❌ Factura no encontrada');
        return;
    }
    
    // Crear modal de vista previa
    let modal = document.getElementById('modal-preview');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-preview';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-preview-content">
                <h3>
                    Vista Previa - Factura ${factura.numero}
                    <span class="modal-close" onclick="cerrarPreview()">&times;</span>
                </h3>
                <div id="preview-contenido">
                    <!-- Se genera aquí -->
                </div>
                <div class="preview-acciones">
                    <button class="btn-guardar" onclick="generarPDF(${facturaId})">📥 Descargar PDF</button>
                    <button class="btn-cancelar" onclick="cerrarPreview()">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Generar contenido HTML de la factura
    const contenido = document.getElementById('preview-contenido');
    
    let estadoHTML = '';
    if (factura.estadoPago === 'pagado') {
        estadoHTML = '<span class="badge badge-pagado">✅ Pagado</span>';
    } else if (factura.estadoPago === 'parcial') {
        estadoHTML = '<span class="badge badge-parcial">🔄 Parcial</span>';
    } else {
        estadoHTML = '<span class="badge badge-pendiente">⏳ Pendiente</span>';
    }
    
    let lineasHTML = '';
    factura.lineas.forEach((linea, index) => {
        const bgClass = index % 2 === 0 ? 'linea-par' : 'linea-impar';
        lineasHTML += `
            <tr class="${bgClass}">
                <td>${linea.descripcion}</td>
                <td style="text-align:center;">${linea.cantidad}</td>
                <td style="text-align:right;">${linea.precio.toFixed(2)} €</td>
                <td style="text-align:right;font-weight:600;">${linea.subtotal.toFixed(2)} €</td>
            </tr>
        `;
    });
    
    contenido.innerHTML = `
        <div class="factura-preview">
            <div class="factura-header">
                <h2>FACTURA</h2>
                <p>Nº ${factura.numero}</p>
            </div>
            
            <div class="factura-datos">
                <div class="emisor">
                    <h4>EMITIDO POR</h4>
                    <p><strong>${factura.empresa.empresa}</strong></p>
                    <p>CIF: ${factura.empresa.CIF}</p>
                    <p>${factura.empresa.direccion}</p>
                    <p>Tel: ${factura.empresa.telefono}</p>
                    <p>${factura.empresa.email}</p>
                </div>
                
                <div class="receptor">
                    <h4>FACTURADO A</h4>
                    <p><strong>${factura.cliente.nombre}</strong></p>
                    <p>NIF: ${factura.cliente.nif}</p>
                    ${factura.cliente.direccion ? `<p>${factura.cliente.direccion}</p>` : ''}
                    ${factura.cliente.email ? `<p>${factura.cliente.email}</p>` : ''}
                </div>
            </div>
            
            <div class="factura-info">
                <div class="info-item">
                    <span class="label">Fecha:</span>
                    <span class="value">${formatearFechaPDF(factura.fecha)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Pago:</span>
                    <span class="value">${factura.tipoPagoTexto || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <span class="label">Estado:</span>
                    <span class="value">${estadoHTML}</span>
                </div>
                <div class="info-item">
                    <span class="label">Garantía:</span>
                    <span class="value">${factura.garantiaTexto || 'Sin garantía'}</span>
                </div>
            </div>
            
            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th style="width:80px;">Cantidad</th>
                        <th style="width:100px;">Precio</th>
                        <th style="width:100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineasHTML}
                </tbody>
            </table>
            
            <div class="factura-totales">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <strong>${factura.subtotal.toFixed(2)} €</strong>
                </div>
                <div class="total-row">
                    <span>IVA (21%):</span>
                    <strong>${factura.iva.toFixed(2)} €</strong>
                </div>
                <div class="total-row total-final">
                    <span>TOTAL:</span>
                    <strong>${factura.total.toFixed(2)} €</strong>
                </div>
            </div>
            
            ${factura.observaciones ? `
                <div class="factura-observaciones">
                    <h4>Observaciones:</h4>
                    <p>${factura.observaciones.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="factura-footer">
                <p>Factura generada electrónicamente. Gracias por su confianza.</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function cerrarPreview() {
    const modal = document.getElementById('modal-preview');
    if (modal) {
        modal.style.display = 'none';
    }
}