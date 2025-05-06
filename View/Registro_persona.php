<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre = $_POST['nombre'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$fecha_nacimiento = $_POST['fecha_nacimiento'];
$telefono = $_POST['telefono'];


// Consulta para insertar en la tabla persona_natural
$sql = "INSERT INTO persona_natural (nombre, email, password, fecha_nacimiento, telefono) 
        VALUES ('$nombre', '$email', '$password', '$fecha_nacimiento', '$telefono')";

if ($conn->query($sql) === TRUE) {
    echo "<script>alert('Registro exitoso!'); window.location='///77';</script>";
} else {
    echo "<script>alert('Error al registrar: " . $conn->error . "'); window.location='registro_persona.php';</script>";
}

$conn->close();
?>