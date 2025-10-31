<?php
require_once __DIR__ . '/auth.php';
require_egresado();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Buscar Vacantes</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>


    <header class="header">
        <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>
        <h1>Buscar Vacantes</h1>
    </header>
    <div class="backdrop" id="backdrop"></div>

    <div class="layout">
        <aside class="sidebar sidebar--drawer">
            <h3>Egresado</h3>
            <div class="menu">
                <a href="InicioEgresado.php">Inicio</a>
                <a href="BuscarVacantes.php" class="active">Buscar Vacantes</a>
                <a href="Vacantes.php">Ver Vacantes</a>
                <a href="PerfilEgresado.php">Mi Perfil</a>
                <a href="RegistroEgresados.html">Actualizar Perfil</a>
                <a href="logout.php">Salir</a>
            </div>
        </aside>

        <div class="content content--two-col">
            <div class="col-left">
                <?php include __DIR__ . '/profile_card.php'; ?>
            </div>
            <div class="col-right">
                <form action="Vacantes.php" method="get" class="formulario">
                    <input type="text" name="palabra_clave" placeholder="Palabra clave o cargo">
                    <input type="text" name="ubicacion" placeholder="Ubicación">
                    <select name="area">
                        <option value="">-- Área --</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Administración">Administración</option>
                        <option value="Educación">Educación</option>
                    </select>
                    <select name="experiencia">
                        <option value="">-- Nivel de experiencia --</option>
                        <option value="Sin experiencia">Sin experiencia</option>
                        <option value="Junior">Junior</option>
                        <option value="Semi Senior">Semi Senior</option>
                        <option value="Senior">Senior</option>
                    </select>
                    <input type="submit" value="Buscar">
                </form>
            </div>
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
<?php include __DIR__ . '/messages_widget.php'; ?>
</body>
</html>