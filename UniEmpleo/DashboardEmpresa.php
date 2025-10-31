<?php
require_once __DIR__ . '/auth.php';
require_empresa();

$empresa_id = (int)($_SESSION['empresa_id'] ?? 0);
$empresa_nombre = $_SESSION['empresa_nombre'] ?? 'Empresa';
$cuenta_verificada = true; // Ajustable cuando exista campo en BD
// Datos rápidos de vacantes
$vacantes_count = 0; $ultima_fecha = null;
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if ($conexion) {
  if ($stmt = mysqli_prepare($conexion, "SELECT COUNT(*) FROM vacantes WHERE empresa_id = ?")){
    mysqli_stmt_bind_param($stmt, 'i', $empresa_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $vacantes_count);
    mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);
  }
  if ($stmt2 = mysqli_prepare($conexion, "SELECT MAX(created_at) FROM vacantes WHERE empresa_id = ?")){
    mysqli_stmt_bind_param($stmt2, 'i', $empresa_id);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_bind_result($stmt2, $ultima_fecha);
    mysqli_stmt_fetch($stmt2);
    mysqli_stmt_close($stmt2);
  }
  mysqli_close($conexion);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Inicio Empresa</title>
  <link rel="stylesheet" href="style.css">
  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <h1>Bienvenido, <?php echo htmlspecialchars($empresa_nombre); ?></h1>
    <p class="subtitulo">Panel de Empresa · gestiona tus vacantes y perfil</p>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3>Empresa</h3>
      <div class="menu">
        <a href="DashboardEmpresa.php" class="active">Inicio Empresa</a>
        <a href="PublicarVacante.php">Publicar Vacante</a>
        <a href="MisVacantes.php">Mis Vacantes</a>
        <a href="Chat.php">Chat</a>
        <a href="logout.php">Salir</a>
      </div>
    </aside>

    <div class="content">
      <!-- Hero profesional -->
      <section class="hero" style="--hero-url: url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop')">
        <div class="hero__content">
          <h2 class="hero__title">Conecta talento y acelera el crecimiento de tu empresa</h2>
          <p class="hero__subtitle">Publica vacantes, gestiona candidatos y conversa con egresados — todo en un mismo lugar.</p>
          <div class="hero__actions">
            <a class="button" href="PublicarVacante.php">Publicar vacante</a>
            <a class="button button--light" href="MisVacantes.php">Mis vacantes</a>
            <a class="button button--light" href="Chat.php">Abrir chat</a>
          </div>
        </div>
      </section>

      <!-- Métricas rápidas -->
      <h2 class="section-title">Resumen</h2>
      <section class="stat-cards">
        <div class="stat-card">
          <div class="stat-title"><span class="emoji" aria-hidden="true">🧾</span> Vacantes activas</div>
          <div class="stat-value"><?php echo (int)$vacantes_count; ?></div>
        </div>
        <div class="stat-card">
          <div class="stat-title"><span class="emoji" aria-hidden="true">🕒</span> Última publicación</div>
          <div class="stat-value"><?php echo $ultima_fecha ? htmlspecialchars($ultima_fecha) : '—'; ?></div>
        </div>
        <div class="stat-card">
          <div class="stat-title"><span class="emoji" aria-hidden="true">👤</span> Estado de cuenta</div>
          <div class="stat-value"><span class="status-icon <?php echo $cuenta_verificada ? 'ok' : 'no'; ?>" aria-label="<?php echo $cuenta_verificada ? 'Cuenta verificada' : 'Cuenta no verificada'; ?>"><?php echo $cuenta_verificada ? '✅' : '❌'; ?></span> <?php echo $cuenta_verificada ? 'Verificada' : 'No verificada'; ?></div>
        </div>
      </section>

      <!-- Acciones recomendadas -->
      <h2 class="section-title">Acciones rápidas</h2>
      <section class="cta-grid">
        <div class="cta-card">
          <div class="cta-icon">📣</div>
          <div class="cta-content">
            <h3>Publicar vacante</h3>
            <p>Crea nuevas oportunidades y atrae talento.</p>
            <a class="button" href="PublicarVacante.php">Crear vacante</a>
          </div>
        </div>
        <div class="cta-card">
          <div class="cta-icon">🗂️</div>
          <div class="cta-content">
            <h3>Gestionar vacantes</h3>
            <p>Edita, pausa o elimina vacantes existentes.</p>
            <a class="button" href="MisVacantes.php">Ir a mis vacantes</a>
          </div>
        </div>
        <div class="cta-card">
          <div class="cta-icon">💬</div>
          <div class="cta-content">
            <h3>Conversar con candidatos</h3>
            <p>Coordina entrevistas y resuelve dudas en tiempo real.</p>
            <a class="button" href="Chat.php">Abrir chat</a>
          </div>
        </div>
      </section>

      <!-- Banner de marca -->
      <section class="brand-banner">
        <img src="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop" alt="Equipo de trabajo en oficina moderna" />
      </section>
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

  <?php if (isset($_GET['login_ok'])): ?>
    <script>
      Swal.fire({icon:'success', title:'Bienvenido', text:'Has iniciado sesión correctamente', confirmButtonText:'Continuar'});
    </script>
  <?php endif; ?>

<?php include __DIR__ . '/messages_widget.php'; ?>
</body>
</html>