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

    main.innerHTML = `
      <h2>Vacantes Disponibles</h2>
      <div id="contenedorVacantes" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;"></div>
    `;

    fetch(`../../../controllers/VacanteController.php?action=disponibles&usuario_id=${usuarioActivo}`)
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener las vacantes");
      return response.json();
    })
    .then(data => {
      const contenedor = document.getElementById('contenedorVacantes');
      contenedor.innerHTML = '';
      
      data.forEach(vacante => {
        const div = document.createElement('div');
        div.classList.add('vacante-rectangulo');
        div.style.border = '2px solid black';
        div.style.padding = '20px';
        div.style.width = '100%';
        div.style.marginBottom = '15px';
        div.style.borderRadius = '10px';
        div.style.backgroundColor = '#f9f9f9';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.position = 'relative';
        div.style.minHeight = '150px';
        div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      
        div.innerHTML = `
          <h3 style="margin: 0;">${vacante.titulo}</h3>
          <p style="margin: 5px 0;">Perfil: ${vacante.perfil}</p>
          <p style="margin: 5px 0;">Descripción: ${vacante.descripcion}</p>
          <p style="margin: 5px 0;">Salario: ${vacante.salario}</p>
          <p style="margin: 5px 0;">Tipo: ${vacante.tipo}</p>
        `;
      
        const btnPostular = document.createElement('button');
        btnPostular.textContent = '¡Postularme!';
        btnPostular.classList.add('btn-accion-servicio', 'btn-derecha');
        btnPostular.addEventListener('click', () => {
  fetch(`../../../controllers/PostulacionController.php?action=crearPostulacion&id_vacante=${vacante.id_vacante}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('No se pudo postular');
    return response.json(); 
  })
  .then(result => {
    if (result.success) {
      div.remove(); 
    } else {
      throw new Error('La respuesta del servidor no fue exitosa');
    }
  })
  .catch(error => {
    console.error('Error al postularse:', error);
    alert('Error al postularse. Intenta de nuevo.');
  });
});

        div.appendChild(btnPostular);
        contenedor.appendChild(div);
      });
      
    })
    .catch(error => {
      console.error("Error:", error);
      const main = document.querySelector('main') || contenedor;
      main.innerHTML += `<p style="color: red;">No se pudieron cargar las vacantes.</p>`;
    });

  }else if (seccion === 'servicios') {
    main.innerHTML = `
      <div style="position: relative;">
        <h2>Servicios</h2>
        <div class="contenedor-botones">
          <a href="../SolicitudServicios.php" class="btn-solicitar-servicios">Solicitar servicios</a>
          <a href="#" id="btn-ver-solicitudes" class="btn-ver-solicitudes">Mis Solicitudes</a>
        </div>
        <div id="contenedorSolicitudes" style="margin-top: 20px;"></div>
      </div>
    `;
  
    fetch('../../../controllers/ServicioController.php?action=listarNoPropios')
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener los servicios");
        return response.json();
      })
      .then(data => mostrarServicios(data))
      .catch(error => {
        console.error("Error:", error);
        document.getElementById('contenedorSolicitudes').innerHTML = `<p style="color: red;">No se pudieron cargar los servicios.</p>`;
      });
  
    document.getElementById('btn-ver-solicitudes').addEventListener('click', () => {
      fetch('../../../controllers/ServicioController.php?action=listar')
        .then(response => {
          if (!response.ok) throw new Error("Error al obtener tus solicitudes");
          return response.json();
        })
        .then(data => mostrarServicios(data, true))
        .catch(error => {
          console.error("Error:", error);
          document.getElementById('contenedorSolicitudes').innerHTML = `<p style="color: red;">No se pudieron cargar tus solicitudes.</p>`;
        });
    });
  
    function mostrarServicios(servicios, esUsuario = false) {
      const contenedor = document.getElementById('contenedorSolicitudes');
      contenedor.innerHTML = '';
  
      if (!servicios || servicios.length === 0) {
        contenedor.innerHTML = `<p>${esUsuario ? 'No tienes solicitudes registradas.' : 'No hay servicios disponibles.'}</p>`;
        return;
      }
  
      servicios.forEach(servicio => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.padding = '16px';
        div.style.marginBottom = '10px';
        div.style.borderRadius = '8px';
        div.style.backgroundColor = '#f4f4f4';
        div.style.position = 'relative';
  
        let html = `
          <h3>${servicio.nombre_servicio}</h3>
          <p><strong>Descripción:</strong> ${servicio.descripcion}</p>
          <p><strong>Fecha:</strong> ${servicio.fecha_solicitud}</p>
          <p><strong>Estado:</strong> ${servicio.estado}</p>
        `;
  
        if (esUsuario) {
          if (servicio.ofertantes && servicio.ofertantes.length > 0) {
            html += `<p><strong>Personas que se ofrecieron:</strong></p><ul>`;
            servicio.ofertantes.forEach(ofertante => {
              html += `<li>${ofertante.nombre} (${ofertante.correo})</li>`;
            });
            html += `</ul>`;
          } else {
            html += `<p><em>Nadie se ha ofrecido aún.</em></p>`;
          }
        } else {
          if (!servicio.yaOfrecido) {
            html += `<button class="btn-accion-servicio" data-id="${servicio.id_servicio}" style="
              position: absolute;
              bottom: 10px;
              right: 10px;
              padding: 8px 12px;
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            ">Ofrecer servicio</button>`;
          } else {
            html += `<p><em>Ya ofreciste este servicio</em></p>`;
          }
        }
  
        div.innerHTML = html;
        contenedor.appendChild(div);
      });
    }
  
    document.addEventListener('click', function(event) {
      if (event.target.matches('.btn-accion-servicio')) {
        const boton = event.target;
        const idServicio = boton.dataset.id;
  
        fetch(`../../../controllers/ServicioController.php?action=ofrecer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_servicio: idServicio, usuario_id: usuarioActivo })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('¡Te has postulado para ofrecer este servicio!');
            const divServicio = boton.closest('div');
            divServicio.remove(); 
          } else {
            alert(data.message || 'Error al postularte. Intenta de nuevo.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Hubo un error al postularte.');
        });
      }
    });
  }
  else if (seccion === 'Mis Postulaciones') {

    main.innerHTML = `
      <h2>Mis postulaciones</h2>
      <div id="contenedorPostulaciones" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;"></div>
    `;
  
    fetch('../../../controllers/PostulacionController.php?action=listarPorUsuario')
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener las Postulaciones");
        return response.json();
      })
      .then(data => {
        const contenedor = document.getElementById('contenedorPostulaciones');
        contenedor.innerHTML = '';
  
        data.forEach(postulacion => {
          const div = document.createElement('div');
          div.classList.add('vacante-rectangulo');
          div.style.border = '2px solid black';
          div.style.padding = '20px';
          div.style.width = '100%';
          div.style.marginBottom = '15px';
          div.style.borderRadius = '10px';
          div.style.backgroundColor = '#f9f9f9';
          div.style.display = 'flex';
          div.style.flexDirection = 'column';
          div.style.position = 'relative';
          div.style.minHeight = '150px';
          div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  
          div.innerHTML = `
            <h3 style="margin: 0;">${postulacion.vacante.titulo}</h3>
            <p style="margin: 5px 0;">Fecha postulacion: ${postulacion.fecha_postulacion}</p>
            <p style="margin: 5px 0;">Descripción: ${postulacion.vacante.descripcion}</p>
            <p style="margin: 5px 0;">Salario: ${postulacion.vacante.salario}</p>
            <p style="margin: 5px 0;">Tipo: ${postulacion.vacante.tipo}</p>
          `;
  
          const btnCancelar = document.createElement('button');
          btnCancelar.textContent = 'Cancelar postulación';
          btnCancelar.classList.add('btn-accion-servicio', 'btn-derecha', 'btn-cancelar');
          btnCancelar.addEventListener('click', () => {
            if (confirm('¿Seguro que deseas cancelar esta postulación?')) {
              fetch(`../../../controllers/PostulacionController.php?action=eliminar&id_postulacion=${postulacion.id_postulacion}`)
                .then(response => {
                  if (!response.ok) throw new Error('No se pudo eliminar');
                  return response.text();
                })
                .then(() => {
                  mostrarContenido('Mis Postulaciones'); 
                })
                .catch(error => {
                  console.error('Error al cancelar:', error);
                  alert('Error al cancelar la postulación');
                });
            }
          });
  
          div.appendChild(btnCancelar);
          contenedor.appendChild(div);
        });
      })
      .catch(error => {
        console.error("Error:", error);
        const main = document.querySelector('main') || contenedor;
        main.innerHTML += `<p style="color: red;">No se pudieron cargar las postulaciones.</p>`;
      });
  }else if (seccion === 'empresas') {
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
}else if (seccion === 'servicios') {
  main.innerHTML = `
    <div style="position: relative;">
      <h2>Servicios</h2>
      <div class="contenedor-botones">
        <a href="../SolicitudServicios.php" class="btn-solicitar-servicios">Solicitar servicios</a>
        <a href="#" id="btn-ver-solicitudes" class="btn-ver-solicitudes">Mis Solicitudes</a>
      </div>
      <div id="contenedorSolicitudes" style="margin-top: 20px;"></div>
    </div>
  `;

  fetch('../../../controllers/ServicioController.php?action=listarNoPropios')
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener los servicios");
      return response.json();
    })
    .then(data => mostrarServicios(data))
    .catch(error => {
      console.error("Error:", error);
      document.getElementById('contenedorSolicitudes').innerHTML = `<p style="color: red;">No se pudieron cargar los servicios.</p>`;
    });


  document.getElementById('btn-ver-solicitudes').addEventListener('click', () => {
    fetch('../../../controllers/ServicioController.php?action=listar')
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener tus solicitudes");
        return response.json();
      })
      .then(data => mostrarServicios(data, true))
      .catch(error => {
        console.error("Error:", error);
        document.getElementById('contenedorSolicitudes').innerHTML = `<p style="color: red;">No se pudieron cargar tus solicitudes.</p>`;
      });
  });

 
  function mostrarServicios(servicios, esUsuario = false) {
    const contenedor = document.getElementById('contenedorSolicitudes');
    contenedor.innerHTML = '';
  
    if (servicios.length === 0) {
      contenedor.innerHTML = `<p>${esUsuario ? 'No tienes solicitudes registradas.' : 'No hay servicios disponibles en este momento.'}</p>`;
      return;
    }
  
    servicios.forEach(servicio => {
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '16px';
      div.style.marginBottom = '10px';
      div.style.borderRadius = '8px';
      div.style.backgroundColor = '#f4f4f4';
  
      div.innerHTML = `
      <h3>${servicio.nombre_servicio}</h3>
      <p><strong>Descripción:</strong> ${servicio.descripcion}</p>
      <p><strong>Fecha:</strong> ${servicio.fecha_solicitud}</p>
      <p><strong>Estado:</strong> ${servicio.estado}</p>
      ${!esUsuario ? `
        <div style="position: relative; bottom: 10px; left: 10px;">
        <button class="btn-accion-servicio btn-derecha" data-id="${servicio.id_servicio}">
           Ofrecer mi servicio
        </button>
        </div>
      ` : ''}
    `;
      contenedor.appendChild(div);
    });
  
    if (!esUsuario) {
      document.querySelectorAll('.btn-ofrecer-servicio').forEach(btn => {
        btn.addEventListener('click', () => {
          const idServicio = btn.getAttribute('data-id');
  
          fetch('../../../controllers/ServicioController.php?action=ofrecer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_servicio: idServicio }),
          })
          .then(response => {
            if (!response.ok) throw new Error('Error al ofrecer el servicio.');
            return response.json();
          })
          .then(data => {
            alert(data.message || 'Te has postulado correctamente para ofrecer este servicio.');
          })
          .catch(error => {
            console.error('Error:', error);
            alert('No se pudo completar la solicitud.');
          });
        });
      });
    }
  }
  
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

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalBienvenida");
  if (modal) {
    modal.style.display = "block";
  }
});

function redirigirCompletarPerfil() {
  window.location.href = "";
}
document.addEventListener("DOMContentLoaded", function () {
  fetch("../../../controllers/Obtenerperfil.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener los datos del perfil");
      }
      return response.json();
    })
    .then((data) => {
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
    const formEmpresa = document.getElementById("formEmpresa"); 
    formEmpresa.addEventListener("submit", (event) => {
        const pais = document.getElementById("pais").value.trim();
        const ciudad = document.getElementById("ciudad").value.trim();
        const barrio = document.getElementById("barrio").value.trim();

        document.getElementById("lugar_operacion").value = `${pais} - ${ciudad} - ${barrio}`;
        console.log("Lugar de operación:", lugarOperacion); 
    });
});

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
