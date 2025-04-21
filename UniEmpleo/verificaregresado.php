<?php
session_start();
include("conexion.php"); // asegúrate de tener tu conexión lista

$correo = $_POST['correo'];
$contrasena = $_POST['contrasena'];

// Buscar usuario en la base de datos
$query = "SELECT * FROM egresados WHERE correo = '$correo' AND contrasena = '$contrasena'";
$resultado = mysqli_query($conn, $query);

if (mysqli_num_rows($resultado) > 0) {
    $_SESSION['correo'] = $correo;
    header("Location: PanelEgresado.php");
} else {
    echo "<script>alert('Credenciales incorrectas');window.location='loginEgresado.php';</script>";
}
?>
