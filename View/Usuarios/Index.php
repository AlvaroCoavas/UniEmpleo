<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Introducción - Uniempleo</title>
    <link rel="stylesheet" href="../Css/style.css">
    
</head>

<header id="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <h1 style="margin-left: 20px; flex-shrink: 0;">Uniempleo</h1>
        <div style="margin-right: 20px;">
            <button class="btn-modal" onclick="mostrarModal('modalLogin')">Iniciar sesión</button>
            <button class="btn-modal" onclick="mostrarModal('modalRegistro')">Registrarse</button>
        </div>
    </div>
</header>

<div id="modalLogin" class="modal">
    <div class="modal-contenido">
        <span class="cerrar" onclick="cerrarModal('modalLogin')">&times;</span>
        <h3>Iniciar sesión</h3>
        <form action="../../controllers/UsuarioController.php?action=login" method="POST">
            <input type="email" name="correo" placeholder="Correo electrónico" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <input type="submit" value="Ingresar">
        </form>
    </div>
</div>

<!-- Modal Registro -->
<div id="modalRegistro" class="modal">
    <div class="modal-contenido">
        <span class="cerrar" onclick="cerrarModal('modalRegistro')">&times;</span>
        <h3>¿Qué tipo de cuenta deseas crear?</h3>
        <br>
        <div>
            <button onclick="seleccionarTipo('persona')">
                <img src="../Media/cuenta.png" alt="Usuario" class="icono-btn">
                Persona Natural
            </button>
            <button onclick="seleccionarTipo('empresa')">
                <img src="../Media/edificios.png" alt="Empresa" class="icono-btn">
                Empresa
            </button>
        </div>
        
        <form id="formPersona" action="../../controllers/UsuarioController.php?action=register" method="POST" style="display: none; margin-top: 15px;">
            <input type="hidden" name="tipo_usuario" value="persona">
            <input type="text" name="nombre" placeholder="Nombres" required>
            <input type="text" name="apellido" placeholder="Apellidos" required>
            <input type="email" name="correo" placeholder="Correo electrónico" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <label for="fecha_nacimiento">Fecha de nacimiento:</label>
            <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" required>
            <br>
            <label>
                <input type="checkbox" name="terminos" required> Acepto los <a href="terminos_y_condiciones.html" target="_blank">términos y condiciones</a>
            </label>
        
            <input type="submit" value="Registrarse">
        </form>

        <!-- Formulario para Empresa -->
        <form id="formEmpresa" action="../../controllers/UsuarioController.php?action=register" method="POST" style="display: none; margin-top: 15px;">
            <input type="hidden" name="tipo_usuario" value="empresa">
            <input type="text" name="nombre_empresa" placeholder="Nombre de la empresa" required>
            <input type="text" name="ruc" placeholder="RUC de la empresa" required>

            <div style="display: flex; align-items: center; gap: 10px;" >
                <input type="text" id="pais" placeholder="País" required style="width: 100px;">
                <span>-</span>
                <input type="text" id="ciudad" placeholder="Ciudad" required style="width: 100px;">
                <span>-</span>
                <input type="text" id="barrio" placeholder="Barrio" required style="width: 100px;">
              </div>
            <input type="hidden" id="lugar_operacion" name="lugar_operacion">
            <input type="email" name="correo" placeholder="Correo corporativo" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            
            <input type="submit" value="Registrarse">
        </form>
    </div>
</div>
<body>
    <!-- Carrusel de imagenes -->
         <div class="sliderbox">

        <ul>
            <li>
                <img src="../Media/imagen1.png" alt="">
                
            </li>
            <li>
                <img src="../Media/imagen2.png" alt="">

            </li>
            <li>
                <img src="../Media/imagen3.png" alt="">
                
            </li>
            </li>
            <li>
                <img src="../Media/imagen4.png" alt="">
                
            </li>
        </ul>
    </div>
    <!-- Contenido principal -->
    <div class="content">
        <h1>Bienvenido a Uniempleo</h1>
        <p>Uniempleo es una plataforma en línea diseñada para conectar a egresados de la Universidad Unicolombo con diversas oportunidades laborales. Si eres un egresado en busca de trabajo o una empresa que necesita talento, aquí podrás encontrar el lugar adecuado para tu desarrollo profesional.</p>

        <p>Ya sea que desees postularte a vacantes, crear un perfil profesional, o si eres una empresa que quiere publicar ofertas de empleo, Uniempleo te ofrece todas las herramientas necesarias para hacer conexiones efectivas y facilitar tu acceso al mercado laboral.</p>

        <p>Haz clic en los botones de arriba para <strong>iniciar sesión</strong> o <strong>registrarte</strong> y empezar a disfrutar de nuestros servicios.</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <p class="footer-text">&copy; 2025 Uniempleo | Todos los derechos reservados</p>
    </footer>

    <script src="../Js/main.js"></script>
</body>
</html>