// ================================================
//  localStorage.js - Lógica del formulario
// ================================================

document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('formulario_empresa');

    // Si no existe el formulario en esta página, salir
    if (!formulario) return;

    // ========================================
    //  ENVÍO DEL FORMULARIO
    // ========================================
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        // Limpiar errores previos
        limpiarErrores();

        // Recoger valores
        const empresa   = document.getElementById('empresa').value.trim();
        const CIF       = document.getElementById('CIF').value.trim().toUpperCase();
        const telefono  = document.getElementById('telefono').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const email     = document.getElementById('email').value.trim();

        // ========================================
        //  VALIDACIONES
        // ========================================
        let hayErrores = false;

        // Nombre empresa
        if (empresa.length < 2) {
            mostrarError('error-empresa', 'El nombre debe tener al menos 2 caracteres');
            hayErrores = true;
        }

        // CIF/NIF
        const regexCIF = /^[A-Z0-9]{8,9}$/;
        if (!regexCIF.test(CIF)) {
            mostrarError('error-cif', 'Formato inválido. Ej: B12345678 o 12345678A');
            hayErrores = true;
        }

        // Teléfono
        const regexTel = /^[0-9]{9}$/;
        if (!regexTel.test(telefono)) {
            mostrarError('error-telefono', 'Debe tener exactamente 9 dígitos');
            hayErrores = true;
        }

        // Dirección
        if (direccion.length < 5) {
            mostrarError('error-direccion', 'La dirección debe tener al menos 5 caracteres');
            hayErrores = true;
        }

        // Email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            mostrarError('error-email', 'Introduce un email válido');
            hayErrores = true;
        }

        // Si hay errores, parar aquí
        if (hayErrores) return;

        // ========================================
        //  GUARDAR EN LOCALSTORAGE
        // ========================================
        const datosEmpresa = {
            empresa:        empresa,
            CIF:            CIF,
            telefono:       telefono,
            direccion:      direccion,
            email:          email,
            fechaRegistro:  new Date().toLocaleString('es-ES')
        };

        try {
            // Guardar datos como JSON
            localStorage.setItem('datosEmpresa', JSON.stringify(datosEmpresa));

            // Marcar como registrado (esta es la clave que se verifica)
            localStorage.setItem('usuarioRegistrado', 'true');

            // Confirmación visual
            console.log('✅ Datos guardados:', datosEmpresa);

            // Mostrar éxito y redirigir
            mostrarExito();

        } catch (error) {
            console.error('❌ Error al guardar:', error);
            alert('Error al guardar los datos. Inténtalo de nuevo.');
        }
    });

    // ========================================
    //  FUNCIONES AUXILIARES
    // ========================================

    function mostrarError(elementoId, mensaje) {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.textContent = mensaje;
            // Resaltar el input correspondiente
            const input = elemento.previousElementSibling;
            if (input) {
                input.style.borderColor = '#dc2626';
                input.style.backgroundColor = '#fef2f2';
            }
        }
    }

    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-msg');
        errores.forEach(function(el) {
            el.textContent = '';
        });

        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(function(input) {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
    }

    function mostrarExito() {
        const boton = document.querySelector('.btn-guardar');

        // Cambiar apariencia del botón
        boton.textContent = '✅ ¡Guardado con éxito!';
        boton.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
        boton.disabled = true;

        // Deshabilitar inputs
        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(function(input) {
            input.disabled = true;
            input.style.opacity = '0.6';
        });

        // Redirigir después de 1.5 segundos
        setTimeout(function () {
            window.location.replace('menu.html');
        }, 1500);
    }

    // ========================================
    //  CONVERTIR CIF A MAYÚSCULAS EN TIEMPO REAL
    // ========================================
    const inputCIF = document.getElementById('CIF');
    if (inputCIF) {
        inputCIF.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
        });
    }

    // ========================================
    //  SOLO NÚMEROS EN TELÉFONO
    // ========================================
    const inputTel = document.getElementById('telefono');
    if (inputTel) {
        inputTel.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

});