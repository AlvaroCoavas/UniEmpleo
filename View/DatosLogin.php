<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener datos del formulario
$correo = $_POST['em'];
$pass = $_POST['pa'];

session_start();

// Verificar si es persona natural
$sql_persona = "SELECT * FROM persona_natural WHERE correo = '$correo' AND contraseña = '$pass'";
$result_persona = $conn->query($sql_persona);

if ($result_persona->num_rows > 0) {
    $_SESSION['correo'] = $correo;
    $_SESSION['tipo'] = 'persona';
    header("Location: panelPersona.php");
    exit();
}

// Verificar si es empresa
$sql_empresa = "SELECT * FROM empresa WHERE correo = '$correo' AND contraseña = '$pass'";
$result_empresa = $conn->query($sql_empresa);

if ($result_empresa->num_rows > 0) {
    $_SESSION['correo'] = $correo;
    $_SESSION['tipo'] = 'empresa';
    header("Location: panelEmpresa.php");
    exit();
}

// Si no es ninguna
echo "<script>alert('Correo o contraseña incorrectos'); window.location='login.php';</script>";

$conn->close();
?>