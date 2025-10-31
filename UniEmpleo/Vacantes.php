<?php
require_once __DIR__ . '/auth.php';
require_egresado();
// Conexión a la base de datos
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Vacantes Disponibles</title>
    <link rel="stylesheet" href="style.css"> <!-- Asegúrate de tener tu estilo aquí -->
</head>
<body>

    <header class="header">
        <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>
        <h1>Vacantes Disponibles</h1>
    </header>
    <div class="backdrop" id="backdrop"></div>

    <div class="layout">
        <aside class="sidebar sidebar--drawer">
            <h3>Egresado</h3>
            <div class="menu">
                <a href="InicioEgresado.php">Inicio</a>
                <a href="BuscarVacantes.php">Buscar Vacantes</a>
                <a href="Vacantes.php" class="active">Ver Vacantes</a>
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
                <?php
                if (isset($_SESSION['correo'])) {
                    $palabra = $_GET['palabra_clave'] ?? '';
                    $ubicacion = $_GET['ubicacion'] ?? '';
                    $tipo = $_GET['tipo_empleo'] ?? '';

                    $where = "1=1";
                    if ($palabra !== '') {
                        $p = mysqli_real_escape_string($conexion, $palabra);
                        $where .= " AND (titulo LIKE '%$p%' OR descripcion LIKE '%$p%')";
                    }
                    if ($ubicacion !== '') {
                        $u = mysqli_real_escape_string($conexion, $ubicacion);
                        $where .= " AND ubicacion LIKE '%$u%'";
                    }
                    if ($tipo !== '') {
                        $t = mysqli_real_escape_string($conexion, $tipo);
                        $where .= " AND tipo_empleo = '$t'";
                    }

                    $consulta = "SELECT id, titulo, descripcion, ubicacion, tipo_empleo FROM vacantes WHERE $where ORDER BY id DESC";
                    $resultado = mysqli_query($conexion, $consulta);

                    if ($resultado && mysqli_num_rows($resultado) > 0) {
                        while ($fila = mysqli_fetch_assoc($resultado)) {
                            echo "<div class='formulario'>";
                            echo "<h3>" . htmlspecialchars($fila['titulo']) . "</h3>";
                            echo "<p><strong>Ubicación:</strong> " . htmlspecialchars($fila['ubicacion']) . "</p>";
                            echo "<p><strong>Tipo de empleo:</strong> " . htmlspecialchars($fila['tipo_empleo']) . "</p>";
                            echo "<p><strong>Descripción:</strong><br>" . nl2br(htmlspecialchars($fila['descripcion'])) . "</p>";
                            echo "</div>";
                        }
                    } else {
                        echo "<p>No hay vacantes disponibles en este momento.</p>";
                    }
                } else {
                    echo "<p>Debes iniciar sesión como egresado para ver vacantes.</p>";
                }

                mysqli_close($conexion);
                ?>
            </div>
        </div>
    </div>

    <footer class="footer">
        <p>&copy; 2025 Uniempleo</p>
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