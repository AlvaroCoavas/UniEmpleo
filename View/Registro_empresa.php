<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre_empresa = $_POST['nombre_empresa'];
$email_empresa = $_POST['email_empresa'];
$password_empresa = password_hash($_POST['password_empresa'], PASSWORD_DEFAULT);
$telefono_empresa = $_POST['telefono_empresa'];
$direccion_empresa = $_POST['direccion_empresa'];

// Consulta para insertar en la tabla empresa
$sql = "INSERT INTO empresa (nombre_empresa, email_empresa, password_empresa, telefono_empresa, direccion_empresa) 
        VALUES ('$nombre_empresa', '$email_empresa', '$password_empresa', '$telefono_empresa', '$direccion_empresa')";

if ($conn->query($sql) === TRUE) {
    echo "<script>alert('Registro exitoso!'); window.location='login.php';</script>";
} else {
    echo "<script>alert('Error al registrar: " . $conn->error . "'); window.location='registro_empresa.php';</script>";
}

$conn->close();
?>