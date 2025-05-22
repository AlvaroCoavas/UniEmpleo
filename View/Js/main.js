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
        if (pass.length < 8) {
        errorDiv.style.display = 'block';
        e.preventDefault();
    } else {
        errorDiv.style.display = 'none';
    }
        document.getElementById('formEmpresa').style.display = 'none';
    } else if (tipo === 'empresa') {
        document.getElementById('formPersona').style.display = 'none';
        document.getElementById('formEmpresa').style.display = 'block';
    }
}

function mostrarContenido(seccion) {
  const main = document.getElementById('mainContent');

  if (seccion === 'vacantes') {
    // Primero mostramos el título y contenedor vacío
    main.innerHTML = `
      <h2>Vacantes Disponibles</h2>
      <div id="contenedorVacantes" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;"></div>
    `;

    // Luego hacemos la petición AJAX a tu PHP
    fetch('../../../controllers/VacanteController.php?action=listar') // Cambia esta ruta si es diferente
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener las vacantes");
        return response.json();
      })
      .then(data => {
        const contenedor = document.getElementById('contenedorVacantes');
        contenedor.innerHTML = '';

        data.forEach(vacante => {
          const div = document.createElement('div');
          div.classList.add('vacante-cuadro');
          div.style.border = '2px solid black';
          div.style.padding = '15px';
          div.style.width = '180px';
          div.style.height = '130px';
          div.style.borderRadius = '10px';
          div.style.backgroundColor = '#f9f9f9';
          div.style.textAlign = 'left';

          div.innerHTML = `
            <h4>${vacante.titulo}</h4>
            <p>${vacante.salario}</p>
            <p>${vacante.tipo}</p>
          `;

          contenedor.appendChild(div);
        });
      })
      .catch(error => {
        console.error("Error:", error);
        main.innerHTML += `<p style="color: red;">No se pudieron cargar las vacantes.</p>`;
      });

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
window.mostrarContenido = mostrarContenido;

  function mostrarContenidoE(seccion) {
    const main = document.getElementById('mainContent');
    if (seccion === 'vacantes') {
  main.innerHTML = `
    <div style="position: relative;">
      <h2>Vacantes Creadas</h2>
      <a href="../Empresaview/CrearVacante.php" class="btn-crear-vacante">Crear vacante</a>
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
function validarContrasena() {
    var actual = document.getElementById('contrasena_actual').value;
    var nueva = document.getElementById('nueva_contrasena').value;
    var confirmar = document.getElementById('confirmar_contrasena').value;

    if (nueva !== confirmar) {
        document.getElementById('error_contrasena').innerText = "Las contraseñas nuevas no coinciden.";
        return false;
    }
    if (actual === nueva) {
        document.getElementById('error_contrasena').innerText = "La nueva contraseña no puede ser igual a la actual.";
        return false;
    }
    document.getElementById('error_contrasena').innerText = "";
    return true;
}
function mostrarModal(id) {
    document.getElementById(id).style.display = 'block';
}
function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}
