<?php
require_once __DIR__ . '/auth.php';
require_empresa();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Publicar Vacante</title>
    <link rel="stylesheet" href="style.css">
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

    <header class="header">
        <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
            <span></span><span></span><span></span>
        </button>
        <h1>Acceso Empresas - UniEmpleo</h1>
    </header>
    <div class="backdrop" id="backdrop"></div>

    <div class="layout">
        <aside class="sidebar sidebar--drawer">
            <h3>Empresa</h3>
            <div class="menu">
                <a href="DashboardEmpresa.php">Inicio Empresa</a>
                <a href="PublicarVacante.php" class="active">Publicar Vacante</a>
                <a href="MisVacantes.php">Mis Vacantes</a>
                <a href="logout.php">Salir</a>
            </div>
        </aside>

        <div class="content">
            <h2>Publicar Nueva Vacante</h2>
            <form action="guardar_vacante.php" method="post" class="formulario">
                <label for="titulo">Título del Puesto:</label>
                <input type="text" name="titulo" required>

                <label for="descripcion">Descripción:</label>
                <textarea name="descripcion" required></textarea>

                <label for="ubicacion">Ubicación:</label>
                <input type="text" name="ubicacion" required>

                <label for="tipo_empleo">Tipo de Empleo:</label>
                <select name="tipo_empleo" required>
                    <option value="Tiempo completo">Tiempo completo</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                    <option value="Prácticas">Prácticas</option>
                </select>

                <input type="submit" value="Publicar Vacante">
            </form>
        </div>
    </div>
    <footer class="footer">
        <p>© 2025 Uniempleo - Todos los derechos reservados</p>
    </footer>

    <script>
      (function(){
        const toggle = document.getElementById('menuToggle');
        const backdrop = document.getElementById('backdrop');
        const body = document.body;
        if (toggle) toggle.addEventListener('click', () => body.classList.toggle('sidebar-open'));
        if (backdrop) backdrop.addEventListener('click', () => body.classList.remove('sidebar-open'));
      })();
    </script>

    <?php
      // SweetAlert feedbacks vía parámetros
      if (isset($_GET['ok'])) {
        echo "<script>Swal.fire({icon:'success',title:'Vacante publicada',text:'Tu vacante fue creada exitosamente',confirmButtonText:'Aceptar'});</script>";
      }
      if (isset($_GET['missing'])) {
        echo "<script>Swal.fire({icon:'warning',title:'Campos requeridos',text:'Completa todos los campos obligatorios',confirmButtonText:'Aceptar'});</script>";
      }
      if (isset($_GET['error'])) {
        $detail = isset($_GET['detail']) ? htmlspecialchars($_GET['detail']) : '';
        $text = $detail ? ('Error al publicar: ' . $detail) : 'Error al publicar vacante';
        echo "<script>Swal.fire({icon:'error',title:'Oops...',text:'$text',confirmButtonText:'Entendido'});</script>";
      }
    ?>
</body>
</html>