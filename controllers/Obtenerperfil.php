<?php
session_start();
require_once '../controllers/PersonaController.php';
require_once '../controllers/EmpresaController.php';

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(["error" => "Usuario no autenticado"]);
    exit();
}

// Verificar el tipo de usuario
if (!isset($_SESSION['tipo_usuario'])) {
    http_response_code(403); // Prohibido
    echo json_encode(["error" => "Tipo de usuario no especificado"]);
    exit();
}

// Configurar encabezados de respuesta
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cambia '*' por el dominio permitido en producción
header('Access-Control-Allow-Methods: GET, POST');

try {
    $id_usuario = $_SESSION['usuario_id'];
    $tipo_usuario = $_SESSION['tipo_usuario'];

    // Delegar la lógica al controlador correspondiente
    if ($tipo_usuario === 'persona') {
        $personaController = new PersonaController();
        $perfil = $personaController->getPersona($id_usuario);
    } elseif ($tipo_usuario === 'empresa') {
        $empresaController = new EmpresaController();
        $perfil = $empresaController->getEmpresa($id_usuario);
    } else {
        http_response_code(403); // Prohibido
        echo json_encode(["error" => "Tipo de usuario no válido"]);
        exit();
    }

    if ($perfil) {
        // Filtrar datos sensibles si es necesario
        unset($perfil->contrasena); // Ejemplo: eliminar la contraseña si está presente
        echo json_encode($perfil);
    } else {
        http_response_code(404); // No encontrado
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
} catch (Exception $e) {
    http_response_code(500); // Error interno del servidor
    echo json_encode(["error" => $e->getMessage()]);
}
?>