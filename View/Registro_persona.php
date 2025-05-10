<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "root", "bd_pa_uniempleo");
date_default_timezone_set('America/Bogota');
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre = $_POST['nombre'];
$tipo = $_POST['tipo_usuario'];
$email = $_POST['correo'];
$password = password_hash($_POST['contraseña'], PASSWORD_DEFAULT);
$fecha_nacimiento = $_POST['fecha_nacimiento'];
$telefono = $_POST['telefono'];
$fechaActual = date('Y-m-d H:i:s');


// Consulta para insertar en la tabla persona_natural
$sql2 = "INSERT INTO usuarios (correo, contrasena, tipo_usuario, fecha_registro) 
        VALUES ('$email', '$password', '$tipo', '$fechaActual')";

if ($conn->query($sql2) === TRUE) {
    // Obtener el ID del nuevo usuario
    $id_usuario = $conn->insert_id;

    // Insertar en perfil_persona usando el id_usuario
    $sql = "INSERT INTO perfil_persona (id_usuario, nombre, telefono, correo) 
             VALUES ('$id_usuario', '$nombre', '$telefono', '$email')";

    if ($conn->query($sql) === TRUE) {
        echo "Perfil registrado correctamente con ID de usuario: $id_usuario";
    } else {
        echo "Error al insertar perfil: " . $conn->error;
    }}


$conn->close();
?>