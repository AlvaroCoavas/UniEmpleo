<?php
require_once dirname(__DIR__, 2) . '/Auth/auth.php';
start_secure_session();
no_cache();

$correo = $_SESSION['correo'] ?? null;
$egresado = null;

if ($correo) {
   $conn = mysqli_connect("localhost", "root", "", "uniempleo");
   if ($conn) {
     $stmt = mysqli_prepare($conn, "SELECT nombre, correo, email, telefono, programa, graduacion, perfil, cv FROM egresados WHERE correo = ? LIMIT 1");
     mysqli_stmt_bind_param($stmt, 's', $correo);
     mysqli_stmt_execute($stmt);
     $result = mysqli_stmt_get_result($stmt);
     if ($result && $row = mysqli_fetch_assoc($result)) {
       $egresado = $row;
     }
     mysqli_stmt_close($stmt);
     mysqli_close($conn);
   }
}
$initial = '';
$substr = function($s) {
  return function_exists('mb_substr') ? mb_substr($s, 0, 1, 'UTF-8') : substr($s, 0, 1);
};
if ($egresado && !empty($egresado['nombre'])) {
  $initial = strtoupper($substr($egresado['nombre']));
} elseif ($correo) {
  $initial = strtoupper($substr($correo));
}
$nombre = $egresado['nombre'] ?? $correo;
$programa = $egresado['programa'] ?? 'Programa no especificado';
$graduacion = $egresado['graduacion'] ?? '—';
$telefono = $egresado['telefono'] ?? '—';
$institucion = 'Unicolombo';
$ciudad = 'Cartagena, Bolívar';
$perfil_text = $egresado['perfil'] ?? 'Completa tu perfil para mejores recomendaciones.';
$cv_path = $egresado['cv'] ?? null;
?>

<div class="profile-card">
  <div class="profile-header">
    <div class="profile-avatar"><?= htmlspecialchars($initial) ?></div>
    <div class="profile-info">
      <p class="profile-name"><?= htmlspecialchars(strtoupper($nombre)) ?></p>
      <p class="profile-sub">Fue a <?= htmlspecialchars($institucion) ?></p>
      <p class="profile-sub"><?= htmlspecialchars($ciudad) ?></p>
      <span class="profile-tag">Unicolombo</span>
    </div>
  </div>

  <div class="profile-meta">
    <div class="meta-item"><span>Programa</span><span><?= htmlspecialchars($programa) ?></span></div>
    <div class="meta-item"><span>Graduación</span><span><?= htmlspecialchars($graduacion) ?></span></div>
    <div class="meta-item"><span>Teléfono</span><span><?= htmlspecialchars($telefono) ?></span></div>
  </div>

  <p class="profile-summary"><?= htmlspecialchars($perfil_text) ?></p>

  <div class="profile-actions">
    <a class="button btn--ghost" href="/View/RegistroEgresados.html">Editar perfil</a>
    <?php if ($cv_path): ?>
      <a class="button" href="<?= htmlspecialchars($cv_path) ?>" target="_blank">Ver CV</a>
    <?php endif; ?>
  </div>
</div>