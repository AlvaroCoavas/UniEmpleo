<?php
require_once __DIR__ . '/auth.php';
start_secure_session();
no_cache();

// Conexión directa a la base de datos
$conn = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conn) {
    die("Error de conexión: " . mysqli_connect_error());
}

$correo = $_POST['correo'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';

if ($correo === '' || $contrasena === '') {
    header("Location: LoginEgresados.php?missing=1");
exit;
    exit;
}

// Recuperar hash o texto plano
$stmt = mysqli_prepare($conn, "SELECT contrasena FROM egresados WHERE correo = ?");
mysqli_stmt_bind_param($stmt, 's', $correo);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    mysqli_stmt_bind_result($stmt, $hash);
    mysqli_stmt_fetch($stmt);

    $ok = false;
    if (!empty($hash) && str_starts_with($hash, '$2')) {
        $ok = password_verify($contrasena, $hash);
    } else {
        $ok = ($hash === $contrasena);
    }

    if ($ok) {
        $_SESSION['correo'] = $correo;
        safe_login_regenerate();
        header("Location: Vacantes.php");
        exit;
    } else {
        header("Location: LoginEgresados.php?error=1");
exit;
    }
} else {
    header("Location: LoginEgresados.php?notfound=1");
exit;
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
