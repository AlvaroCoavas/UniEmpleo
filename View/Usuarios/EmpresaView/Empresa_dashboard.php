<?php
require_once '../../../dao/UsuarioDAO.php';
// Obtener el ID del usuario desde la URL
$usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : null;

// Verificar si el ID del usuario es válido
$mostrarBienvenida = false;
$nombre_usuario = 'Usuario';

if ($usuario_id) {
    $usuarioDAO = new UsuarioDAO();
    $usuario = $usuarioDAO->obtenerUsuarioEmpresaPorId($usuario_id);

    if ($usuario) {
        $mostrarBienvenida = true;
        $nombre_usuario = $usuario['nombre_empresa']; // Asegúrate de que el campo 'nombre' exista en la tabla
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Uniempleo - Página Empresas</title>
  <link rel="stylesheet" href="../../Css/style.css">
</head>
<body>
  <header class="header">
    <h1 class="logo">Uniempleo</h1>
    <nav class="nav">
      <a href="../Usuarios/PersonaView/perfilPersona.php">Mi perfil</a>
      <a href="../../../controllers/UsuarioController.php?action=logout">Cerrar sesión</a>
    </nav>
  </header>

  <div class="main-container">
    <aside class="sidebar">
      <button class="sidebar-btn" onclick="mostrarContenidoE('vacantes')">Vacantes</button>
      <button class="sidebar-btn" onclick="mostrarContenidoE('servicios')">Servicios</button>
      <button class="sidebar-btn" onclick="mostrarContenidoE('personas')">Personas</button>
      <button class="sidebar-btn" onclick="mostrarContenidoE('empresas')">Empresas</button>
    </aside>

    <main class="main-content" id="mainContent">
      <h2>Bienvenido a Uniempleo</h2>
      <p>Aquí podrás ver tus vacantes, servicios disponibles, perfiles de personas y encontrar personas interesadas en ser parte de tu empresa. Usa el panel izquierdo para explorar.</p>
    </main>

    <aside class="right-panel">
      <h3>Consejos útiles</h3>
      <ul>
        <li>Publica vacantes con descripciones claras y completas.</li>
        <li>Revisa los perfiles de los candidatos antes de contactarlos.</li>
        <li>Mantén actualizada la información de tu empresa.</li>
        <li>Responde oportunamente a las postulaciones recibidas.</li>
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


  <script src="../../Js/main.js"></script>
</body>
</html> 
