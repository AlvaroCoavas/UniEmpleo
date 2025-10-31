<?php
$conexion = new mysqli("localhost", "root", "", "uniempleo");

if ($conexion->connect_error) {
    die("Error en la conexión: " . $conexion->connect_error);
}

$correo = $_POST['correo'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';

if ($correo === '' || $contrasena === '') {
    echo "<h3 style='color:red; text-align:center;'>Completa correo y contraseña.</h3>";
    exit;
}

// Consulta preparada para recuperar hash o texto plano
$stmt = $conexion->prepare("SELECT contrasena FROM egresados WHERE correo = ?");
$stmt->bind_param('s', $correo);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($hash);
    $stmt->fetch();

    $ok = false;
    if (!empty($hash) && str_starts_with($hash, '$2')) {
        $ok = password_verify($contrasena, $hash);
    } else {
        $ok = ($hash === $contrasena);
    }

    if ($ok) {
        header("Location: Vacantes.php");
    } else {
        echo "<h3 style='color:red; text-align:center;'>Correo o contraseña incorrectos.</h3>";
    }
} else {
    echo "<h3 style='color:red; text-align:center;'>Usuario no encontrado.</h3>";
}

$stmt->close();
$conexion->close();
?>