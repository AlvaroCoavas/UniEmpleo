function mostrarModal(id) {
    document.getElementById(id).style.display = "block";
}

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}

function mostrarFormularioRegistro() {
    var tipo = document.getElementById('tipoUsuario').value;
    document.getElementById('formPersona').style.display = (tipo === 'persona') ? 'block' : 'none';
    document.getElementById('formEmpresa').style.display = (tipo === 'empresa') ? 'block' : 'none';
}

function seleccionarTipo(tipo) {
    if (tipo === 'persona') {
        document.getElementById('formPersona').style.display = 'block';
        document.getElementById('formEmpresa').style.display = 'none';
    } else {
        document.getElementById('formPersona').style.display = 'none';
        document.getElementById('formEmpresa').style.display = 'block';
    }
}

function mostrarContenido(seccion) {
    const main = document.getElementById('mainContent');
    if (seccion === 'vacantes') {
      main.innerHTML = `
        <h2>Vacantes Disponibles</h2>
        <p>Lista de vacantes cargadas automáticamente...</p>
      `;
    } else if (seccion === 'servicios') {
      main.innerHTML = `
        <h2>Servicios Disponibles</h2>
        <p>Personas ofreciendo servicios.</p>
      `;
    } else if (seccion === 'personas') {
      main.innerHTML = `
        <h2>Perfiles de Personas</h2>
        <p>Personas registradas en la plataforma.</p>
      `;
    } else if (seccion === 'empresas') {
      main.innerHTML = `
        <h2>Empresas Registradas</h2>
        <p>Empresas que solicitan servicios o publican vacantes.</p>
      `;
    }
  }

// Cierra modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
};