<?php
$conexion = new mysqli("localhost", "root", "", "uniempleo");

if ($conexion->connect_error) {
    die("Error en la conexión: " . $conexion->connect_error);
}

$correo = $_POST['correo'];
$contrasena = $_POST['contrasena'];

// Consulta para verificar el usuario
$sql = "SELECT * FROM egresados WHERE correo = '$correo' AND contrasena = '$contrasena'";
$resultado = $conexion->query($sql);

if ($resultado->num_rows > 0) {
    header("Location: BuscarVacantes.html");
} else {
    echo "<h3 style='color:red; text-align:center;'>Correo o contraseña incorrectos.</h3>";
}

$conexion->close();
?>