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
$titulo = $_POST['titulo'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$ubicacion = $_POST['ubicacion'] ?? '';
$tipo_empleo = $_POST['tipo_empleo'] ?? '';

if ($id <= 0 || $titulo === '' || $descripcion === '' || $ubicacion === '' || $tipo_empleo === '') {
  header("Location: EditarVacante.php?id=" . $id . "&missing=1");
  exit;
}

$stmt = mysqli_prepare($conexion, "UPDATE vacantes SET titulo = ?, descripcion = ?, ubicacion = ?, tipo_empleo = ? WHERE id = ? AND empresa_id = ?");
if (!$stmt) {
  header("Location: MisVacantes.php?error=1&detail=" . urlencode('Error preparando consulta'));
  exit;
}

mysqli_stmt_bind_param($stmt, 'ssssii', $titulo, $descripcion, $ubicacion, $tipo_empleo, $id, $empresa_id);

if (mysqli_stmt_execute($stmt)) {
  header("Location: MisVacantes.php?updated=1");
  exit;
} else {
  $err = htmlspecialchars(mysqli_error($conexion));
  header("Location: MisVacantes.php?error=1&detail=" . urlencode($err));
  exit;
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);
?>