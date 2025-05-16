<?php
session_start();

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); // No autorizado
    echo json_encode(["error" => "Usuario no autenticado"]);
    exit();
}

// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "bd_pa_uniempleo");

if ($conn->connect_error) {
    http_response_code(500); // Error interno del servidor
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit();
}

// Obtener los datos del usuario
$id_usuario = $_SESSION['id_usuario'];
$sql = "SELECT 
            p.nombre AS nombre,
            u.correo AS correo,
            p.profesion_u_oficio AS profesion_u_oficio,
            p.lugar_residencia AS lugar_residencia,
            u.fecha_registro AS fecha_registro,
            p.servicios_completados AS servicios_completados
        FROM usuarios u
        INNER JOIN perfil_persona p ON u.id_usuario = p.id_usuario
        WHERE u.id_usuario = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Error en la consulta SQL: " . $conn->error);
}
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    echo json_encode($usuario); // Devolver los datos en formato JSON
} else {
    http_response_code(404); // No encontrado
    echo json_encode(["error" => "Usuario no encontrado"]);
}

$stmt->close();
$conn->close();
?>