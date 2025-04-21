<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener datos del formulario
$correo = $_POST['em'];
$pass = $_POST['pa'];

// Consulta para verificar login de egresado
$sql = "SELECT * FROM egresados WHERE correo = '$correo' AND contraseña = '$pass'";
$resultado = $conn->query($sql);

if ($resultado->num_rows > 0) {
    // Inicio de sesión exitoso
    session_start();
    $_SESSION['correo'] = $correo;
    header("Location: panelEgresado.php");
} else {
    echo "<script>alert('Correo o contraseña incorrectos'); window.location='login.php';</script>";
}

$conn->close();
?>