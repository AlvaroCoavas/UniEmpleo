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
    } else if (tipo === 'empresa') {
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

  function mostrarContenidoE(seccion) {
    const main = document.getElementById('mainContent');
    if (seccion === 'vacantes') {
  main.innerHTML = `
    <div style="position: relative;">
      <h2>Vacantes Creadas</h2>
      <a href="../EmpresaView/CrearVacante.php" class="btn-crear-vacante">Crear vacante</a>
      <p>Lista de vacantes cargadas automáticamente...</p>
    </div>
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
  window.mostrarContenidoE = mostrarContenidoE;


// Mostrar el modal si está presente
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalBienvenida");
  if (modal) {
    modal.style.display = "block";
  }
});

// Función para redirigir al usuario a completar su perfil
function redirigirCompletarPerfil() {
  window.location.href = "";
}

// Verificar si estamos en la página de perfil
document.addEventListener("DOMContentLoaded", function () {
  fetch("../../../controllers/Obtenerperfil.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener los datos del perfil");
      }
      return response.json();
    })
    .then((data) => {
      // Actualizar los elementos del DOM con los datos del perfil
      document.getElementById("nombre").textContent = data.nombre || "No disponible";
      document.getElementById("correo").textContent = `Correo: ${data.correo || "No disponible"}`;
      document.getElementById("tipo_usuario").textContent = `Profesión u Oficio: ${data.profesion_u_oficio || "No disponible"}`;
      document.getElementById("ubicacion").textContent = data.lugar_residencia || "No disponible";
      document.getElementById("fecha_registro").textContent = data.fecha_registro || "No disponible";
      document.getElementById("servicios_completados").textContent = data.servicios_completados || "No disponible";
      document.getElementById("calificacion_promedio").textContent = data.calificacion_promedio || "No disponible";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

  document.addEventListener("DOMContentLoaded", () => {
    const formEmpresa = document.getElementById("formEmpresa"); // Seleccionar el formulario de empresa
  
    formEmpresa.addEventListener("submit", (event) => {
        const pais = document.getElementById("pais").value.trim();
        const ciudad = document.getElementById("ciudad").value.trim();
        const barrio = document.getElementById("barrio").value.trim();

        document.getElementById("lugar_operacion").value = `${pais} - ${ciudad} - ${barrio}`;
        console.log("Lugar de operación:", lugarOperacion); // Verifica el valor en la consola
    });
});

// Cierra modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
};

