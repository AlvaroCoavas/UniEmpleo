<?php
session_start();
if (!isset($_SESSION['empresa_id'])) {
    header("Location: LoginEmpresa.html?redirect=1");
    exit;
}

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
    header("Location: PublicarVacante.php?error=1&detail=" . urlencode('Error de conexión'));
    exit;
}

$titulo = $_POST['titulo'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$ubicacion = $_POST['ubicacion'] ?? '';
$tipo_empleo = $_POST['tipo_empleo'] ?? '';
$empresa_id = (int)$_SESSION['empresa_id'];

if ($titulo === '' || $descripcion === '' || $ubicacion === '' || $tipo_empleo === '') {
    header("Location: PublicarVacante.php?missing=1");
    exit;
}

$stmt = mysqli_prepare($conexion, "INSERT INTO vacantes (empresa_id, titulo, descripcion, ubicacion, tipo_empleo) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    header("Location: PublicarVacante.php?error=1&detail=" . urlencode('Error preparando consulta'));
    exit;
}
mysqli_stmt_bind_param($stmt, 'issss', $empresa_id, $titulo, $descripcion, $ubicacion, $tipo_empleo);

if (mysqli_stmt_execute($stmt)) {
    header("Location: PublicarVacante.php?ok=1");
    exit;
} else {
    $err = htmlspecialchars(mysqli_error($conexion));
    header("Location: PublicarVacante.php?error=1&detail=" . urlencode($err));
    exit;
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);
?>