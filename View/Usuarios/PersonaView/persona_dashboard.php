<?php
session_start(); 
require_once '../../../dao/UsuarioDAO.php';

$usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : null;

$mostrarBienvenida = false;
$nombre_usuario = 'Usuario';

if ($usuario_id) {
    $usuarioDAO = new UsuarioDAO();
    $usuario = $usuarioDAO->obtenerUsuarioPorId($usuario_id);
    if ($usuario) {
        $mostrarBienvenida = true;
        $nombre_usuario = $usuario->getNombre();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Uniempleo - Página Principal</title>
  <link rel="stylesheet" href="../../Css/style.css">
  
</head>
<body>
  <header class="header">
    <h1 class="logo">Uniempleo</h1>
    <nav class="nav">
      <a href="../PersonaView/perfilPersona.php">Mi perfil</a>
      <a href="../../../controllers/UsuarioController.php?action=logout">Cerrar sesión</a>
    </nav>
  </header>

  <div class="main-container">
    <aside class="sidebar">
      <button class="sidebar-btn" onclick="mostrarContenido('vacantes')">Vacantes</button>
      <button class="sidebar-btn" onclick="mostrarContenido('servicios')">Servicios</button>
      <button class="sidebar-btn" onclick="mostrarContenido('Mis Postulaciones')">Mis Postulaciones</button>
      <button class="sidebar-btn" onclick="mostrarContenido('empresas')">Empresas</button>
    </aside>

    <main class="main-content" id="mainContent">
      <h2>Bienvenido a Uniempleo</h2>
      <p>Aquí podrás ver vacantes, servicios disponibles, perfiles de personas y empresas que buscan contratar. Usa el panel izquierdo para explorar.</p>
    </main>

    <aside class="right-panel">
      <h3>Consejos útiles</h3>
      <ul>
        <li>Revisa tu perfil antes de postularte.</li>
        <li>Mantén tu información actualizada.</li>
        <li>Explora diferentes oportunidades.</li>
      </ul>
    </aside>
  </div>

  <!-- Modal de bienvenida -->
  <?php if ($mostrarBienvenida): ?>
  <div id="modalBienvenida" class="modal">
    <div class="modal-content">
      <h2>¡Bienvenido, <?php echo htmlspecialchars($nombre_usuario); ?>!</h2>
      <p>Estamos emocionados de tenerte aquí. Para obtener el empleo que necesitas, necesitamos que completes tu perfil.</p>
      <button onclick="redirigirCompletarPerfil()">Completar mi perfil</button>
    </div>
  </div>
  <?php endif; ?>

  <script>
    function redirigirCompletarPerfil() {
      window.location.href = "../Usuarios/perfilPersona.php"; 
    }
  </script>
  <script>
    const usuarioActivo = <?= isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : 'null' ?>;
  </script>
  <script src="../../Js/main.js"></script>
</body>
</html>