<?php
session_start();
require_once '../controllers/PersonaController.php';
require_once '../controllers/EmpresaController.php';


if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401); 
    echo json_encode(["error" => "Usuario no autenticado"]);
    exit();
}


if (!isset($_SESSION['tipo_usuario'])) {
    http_response_code(403);
    echo json_encode(["error" => "Tipo de usuario no especificado"]);
    exit();
}


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

try {
    $id_usuario = $_SESSION['usuario_id'];
    $tipo_usuario = $_SESSION['tipo_usuario'];

   
    if ($tipo_usuario === 'persona') {
        $personaController = new PersonaController();
        $perfil = $personaController->getPersona($id_usuario);
    } elseif ($tipo_usuario === 'empresa') {
        $empresaController = new EmpresaController();
        $perfil = $empresaController->getEmpresa($id_usuario);
    } else {
        http_response_code(403);
        echo json_encode(["error" => "Tipo de usuario no válido"]);
        exit();
    }

    if ($perfil) {
       
        unset($perfil->contrasena); 
        echo json_encode($perfil);
    } else {
        http_response_code(404); 
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode(["error" => $e->getMessage()]);
}
?>