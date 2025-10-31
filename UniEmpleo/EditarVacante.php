<?php
require_once __DIR__ . '/auth.php';
require_empresa();

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) { die("Error de conexión: " . mysqli_connect_error()); }

$empresa_id = (int)$_SESSION['empresa_id'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('ID inválido'));
  exit;
}

// Cargar datos de la vacante, validando pertenencia
$stmt = mysqli_prepare($conexion, "SELECT id, titulo, descripcion, ubicacion, tipo_empleo FROM vacantes WHERE id = ? AND empresa_id = ?");
mysqli_stmt_bind_param($stmt, 'ii', $id, $empresa_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$vac = mysqli_fetch_assoc($res);
mysqli_stmt_close($stmt);
mysqli_close($conexion);

if (!$vac) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('Vacante no encontrada'));
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Editar Vacante</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <h1>Editar Vacante</h1>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3>Empresa</h3>
      <div class="menu">
        <a href="DashboardEmpresa.php">Inicio Empresa</a>
        <a href="PublicarVacante.php">Publicar Vacante</a>
        <a href="MisVacantes.php" class="active">Mis Vacantes</a>
        <a href="logout.php">Salir</a>
      </div>
    </aside>

    <div class="content">
      <form action="actualizar_vacante.php" method="post" class="formulario">
        <input type="hidden" name="id" value="<?php echo (int)$vac['id']; ?>">
        <label for="titulo">Título del Puesto:</label>
        <input type="text" name="titulo" value="<?php echo htmlspecialchars($vac['titulo']); ?>" required>

        <label for="descripcion">Descripción:</label>
        <textarea name="descripcion" rows="6" required><?php echo htmlspecialchars($vac['descripcion']); ?></textarea>

        <label for="ubicacion">Ubicación:</label>
        <input type="text" name="ubicacion" value="<?php echo htmlspecialchars($vac['ubicacion']); ?>" required>

        <label for="tipo_empleo">Tipo de Empleo:</label>
        <select name="tipo_empleo" required>
          <?php
            $tipos = ['Tiempo completo','Medio tiempo','Prácticas'];
            foreach ($tipos as $t) {
              $sel = ($vac['tipo_empleo'] === $t) ? 'selected' : '';
              echo "<option value=\"$t\" $sel>$t</option>";
            }
          ?>
        </select>

        <input type="submit" value="Guardar cambios">
      </form>
    </div>
  </div>

  <footer class="footer">
    <p>&copy; 2025 UniEmpleo</p>
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

  <?php if (isset($_GET['missing'])): ?>
    <script>
      Swal.fire({icon:'warning',title:'Campos requeridos',text:'Completa todos los campos',confirmButtonText:'Ok'});
    </script>
  <?php endif; ?>
  <?php if (isset($_GET['error'])): ?>
    <script>
      Swal.fire({icon:'error',title:'Oops...',text:'Ocurrió un error al actualizar',confirmButtonText:'Entendido'});
    </script>
  <?php endif; ?>
</body>
</html>