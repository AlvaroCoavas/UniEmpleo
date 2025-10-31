<?php
session_start();
if (!isset($_SESSION['empresa_id'])) {
  header("Location: LoginEmpresa.html?redirect=1");
  exit;
}

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('Error de conexión'));
  exit;
}

$empresa_id = (int)$_SESSION['empresa_id'];
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($id <= 0) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('ID inválido'));
  exit;
}

$stmt = mysqli_prepare($conexion, "DELETE FROM vacantes WHERE id = ? AND empresa_id = ?");
if (!$stmt) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('Error preparando consulta'));
  exit;
}

mysqli_stmt_bind_param($stmt, 'ii', $id, $empresa_id);

if (mysqli_stmt_execute($stmt)) {
  header("Location: MisVacantes.php?deleted=1");
  exit;
} else {
  $err = htmlspecialchars(mysqli_error($conexion));
  header("Location: MisVacantes.php?error=1&detail=" . urlencode($err));
  exit;
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);
?>