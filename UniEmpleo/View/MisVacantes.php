<?php
require_once dirname(__DIR__) . '/Auth/auth.php';
require_empresa();

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) { die("Error de conexión: " . mysqli_connect_error()); }

$empresa_id = (int)$_SESSION['empresa_id'];
$empresa_nombre = $_SESSION['empresa_nombre'] ?? 'Empresa';

$vacantes = [];
if ($stmt = mysqli_prepare($conexion, "SELECT id, titulo, ubicacion, tipo_empleo, created_at FROM vacantes WHERE empresa_id = ? ORDER BY created_at DESC")) {
  mysqli_stmt_bind_param($stmt, 'i', $empresa_id);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  while ($row = mysqli_fetch_assoc($res)) { $vacantes[] = $row; }
  mysqli_stmt_close($stmt);
}
mysqli_close($conexion);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mis Vacantes</title>
  <link rel="stylesheet" href="/Css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <h1>Mis Vacantes - <?php echo htmlspecialchars($empresa_nombre); ?></h1>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3>Empresa</h3>
      <div class="menu">
        <a href="/View/DashboardEmpresa.php">Inicio Empresa</a>
        <a href="/View/PublicarVacante.php">Publicar Vacante</a>
        <a href="/View/MisVacantes.php" class="active">Mis Vacantes</a>
        <a href="/Auth/logout.php">Salir</a>
      </div>
    </aside>

    <div class="content">
      <div class="card">
        <?php if (count($vacantes) === 0): ?>
          <p>No tienes vacantes aún. <a href="/View/PublicarVacante.php">Publica tu primera vacante</a>.</p>
        <?php else: ?>
          <div class="cards-grid">
            <?php foreach ($vacantes as $v): ?>
              <article class="vacante-card card">
                <h3 class="vacante-title"><?php echo htmlspecialchars($v['titulo']); ?></h3>
                <div class="vacante-meta">
                  <div class="meta"><span class="meta-icon">📍</span> <span>Ubicación: <?php echo htmlspecialchars($v['ubicacion']); ?></span></div>
                  <div class="meta"><span class="meta-icon">💼</span> <span>Tipo: <?php echo htmlspecialchars($v['tipo_empleo']); ?></span></div>
                  <div class="meta"><span class="meta-icon">📅</span> <span>Fecha: <?php echo htmlspecialchars($v['created_at']); ?></span></div>
                </div>
                <div class="vacante-actions">
                  <a class="button" href="/View/EditarVacante.php?id=<?php echo (int)$v['id']; ?>">Editar</a>
                  <form action="/Api/eliminar_vacante.php" method="post" class="inline-form">
                    <input type="hidden" name="id" value="<?php echo (int)$v['id']; ?>">
                    <button type="submit" class="danger">Eliminar</button>
                  </form>
                </div>
              </article>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
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
      Swal.fire({icon:'error',title:'Oops...',text:'Ocurrió un error',confirmButtonText:'Entendido'});
    </script>
  <?php endif; ?>
</body>
</html>