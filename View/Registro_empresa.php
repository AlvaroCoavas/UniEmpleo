<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "root", "bd_pa_uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre_empresa = $_POST['nombre_empresa'];
$tipo = $_POST['tipo_usuario'];
$email_empresa = $_POST['email_empresa'];
$password_empresa = password_hash($_POST['contraseña'], PASSWORD_DEFAULT);
$fechaActual = date('Y-m-d H:i:s');

// Consulta para insertar en la tabla empresa
$sql2 = "INSERT INTO usuarios (correo, contrasena, tipo_usuario, fecha_registro) 
        VALUES ('$email_empresa', '$password_empresa', '$tipo', '$fechaActual')";

if ($conn->query($sql2) === TRUE) {
    // Obtener el ID del nuevo usuario
    $id_empresa = $conn->insert_id;

    // Insertar en perfil_persona usando el id_usuario
    $sql = "INSERT INTO perfil_empresa (id_usuario, nombre_empresa) 
             VALUES ('$id_empresa', '$nombre_empresa')";

    if ($conn->query($sql) === TRUE) {
        echo "Perfil registrado correctamente con ID de empresa: $id_empresa";
        
    } else {
        echo "Error al insertar perfil: " . $conn->error;
    }}


$conn->close();
?>