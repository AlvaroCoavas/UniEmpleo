<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Egresado | Uniempleo</title>
    <link rel="stylesheet" href="style.css">
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand"><a href="Index.php">UniEmpleo</a></div>
        <div class="nav-links">
            <a href="Index.php">Inicio</a>
            <div class="dropdown">
              <a href="#" class="dropbtn active">Egresados</a>
              <div class="dropdown-content">
                <a href="LoginEgresados.php">Login</a>
                <a href="RegistroEgresados.html">Registrarse</a>
              </div>
            </div>
            <div class="dropdown">
              <a href="#" class="dropbtn">Empresas</a>
              <div class="dropdown-content">
                <a href="LoginEmpresa.html">Login</a>
                <a href="RegistroEmpresa.html">Registrarse</a>
              </div>
            </div>
        </div>
    </nav>
    <header class="header header--lg">
        <h1>Login de Egresados</h1>
    </header>

    <main>
        <form action="verificaregresado.php" method="post" class="formulario">
            <h3>Ingresa tus datos</h3>
            <input type="email" name="correo" placeholder="Correo institucional" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <input type="submit" value="Iniciar Sesión">
        </form>
    </main>

    <!-- Mensajes SweetAlert según parámetros -->
    <?php
      function showAlert($icon, $title, $text) {
        echo "<script>Swal.fire({icon:'$icon', title:'$title', text:'$text', confirmButtonText:'Aceptar'});</script>";
      }
      if (isset($_GET['ok'])) {
        showAlert('success','Registro exitoso','Tu perfil fue registrado correctamente');
      }
      if (isset($_GET['error'])) {
        showAlert('error','Oops...','Credenciales incorrectas');
      }
      if (isset($_GET['missing'])) {
        showAlert('warning','Advertencia','Completa correo y contraseña');
      }
      if (isset($_GET['notfound'])) {
        showAlert('warning','Usuario no encontrado','Verifica el correo ingresado');
      }
      if (isset($_GET['logout'])) {
        showAlert('info','Sesión cerrada','Has salido correctamente');
      }
      if (isset($_GET['expired'])) {
        showAlert('warning','Sesión expirada','Vuelve a iniciar sesión');
      }
      if (isset($_GET['redirect'])) {
        showAlert('info','Autenticación requerida','Inicia sesión para continuar');
      }
    ?>

    <footer class="footer">
        <p>&copy; 2025 Uniempleo - Todos los derechos reservados</p>
    </footer>
</body>
</html>
