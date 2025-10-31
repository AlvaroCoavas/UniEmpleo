<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener datos del formulario
$correo = $_POST['em'] ?? '';
$pass = $_POST['pa'] ?? '';

if ($correo === '' || $pass === '') {
    echo "<script>alert('Completa correo y contraseña'); window.location='LoginEgresados.php';</script>";
    exit;
}

// Obtener hash (o contraseña) del usuario
$stmt = $conn->prepare("SELECT contrasena FROM egresados WHERE correo = ?");
$stmt->bind_param('s', $correo);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($hash);
    $stmt->fetch();

    // Permitir ambos: hash bcrypt o texto plano (datos de ejemplo)
    $ok = false;
    if (!empty($hash) && str_starts_with($hash, '$2')) {
        $ok = password_verify($pass, $hash);
    } else {
        $ok = ($hash === $pass);
    }

    if ($ok) {
        session_start();
        $_SESSION['correo'] = $correo;
        header("Location: Vacantes.php");
        exit;
    } else {
        echo "<script>alert('Correo o contraseña incorrectos'); window.location='LoginEgresados.php';</script>";
    }
} else {
    echo "<script>alert('Usuario no encontrado'); window.location='LoginEgresados.php';</script>";
}

$stmt->close();
$conn->close();
?>