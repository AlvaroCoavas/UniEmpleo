<?php
require_once __DIR__ . '/auth.php';
start_secure_session();
no_cache();

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
    header("Location: LoginEmpresa.html?server=1");
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($email === '' || $password === '') {
    header("Location: LoginEmpresa.html?missing=1");
    exit;
}

$stmt = mysqli_prepare($conexion, "SELECT id, nombre, contrasena FROM empresas WHERE email = ?");
if (!$stmt) {
    header("Location: LoginEmpresa.html?server=1");
    exit;
}

mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    mysqli_stmt_bind_result($stmt, $id, $nombre, $hash);
    mysqli_stmt_fetch($stmt);
    $ok = false;
    if (!empty($hash) && function_exists('str_starts_with') && str_starts_with($hash, '$2')) {
        $ok = password_verify($password, $hash);
    } else {
        $ok = ($hash === $password);
    }

    if ($ok) {
        $_SESSION['empresa_id'] = $id;
        $_SESSION['empresa_nombre'] = $nombre;
        $_SESSION['empresa_email'] = $email;
        safe_login_regenerate();
        header("Location: DashboardEmpresa.php?login_ok=1");
        exit;
    } else {
        header("Location: LoginEmpresa.html?error=1");
        exit;
    }
} else {
    header("Location: LoginEmpresa.html?notfound=1");
    exit;
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);