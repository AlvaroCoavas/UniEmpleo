<?php
session_start();
require_once '../models/Postulacion.php';
require_once '../dao/PostulacionDAO.php';
require_once '../dao/PersonaDAO.php';
require_once '../dao/VacanteDAO.php';
require_once '../utils/Utils.php';

class PostulacionController{


    private $postulacionDAO;
    private $personaDAO;
    private $vacanteDAO;

    public function __construct() {
        $this->postulacionDAO = new PostulacionDao();
        $this->personaDAO = new PersonaDAO();
        $this->vacanteDAO = new VacanteDAO();
    }

    public function crearPostulacion() {
        if (isset($_SESSION['usuario_id'])) {
            $id_usuario_persona = $_SESSION['usuario_id'];
            $id_vacante = isset($_GET['id_vacante']) ? Utils::sanitizarEntrada($_GET['id_vacante']) : null;
            $fecha_postulacion = date('Y-m-d H:i:s');
            $estado = 'pendiente';

            // Crear el objeto Postulacion
            $postulacion = new Postulacion(
                null, 
                $id_usuario_persona,
                $id_vacante,
                $fecha_postulacion,
                $estado
            );

            // Guardar la postulacion
            if ($this->postulacionDAO->guardarPostulacion($postulacion)) {
                $_SESSION['mensaje'] = "Postulación realizada exitosamente";
                $_SESSION['tipo_mensaje'] = "success";
                echo json_encode(['success' => true]);
                http_response_code(200);
                exit;
                header('Location: index.php?controlador=vacante&accion=listar');
                exit;
            } else {
                throw new Exception("No se pudo guardar la postulación");
            }
        } else {
            throw new Exception("Usuario no autenticado");
        }

        
    }

    public function listarPorUsuario() {
        if (isset($_SESSION['usuario_id'])) {
            try {
                $id_usuario_persona = $_SESSION['usuario_id'];
                
                $postulaciones = $this->postulacionDAO->listarPostulacionesPorUsuario($id_usuario_persona);
                
                header('Content-Type: application/json');
                echo json_encode($postulaciones); 
                
            } catch (Exception $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Usuario no autenticado']);
        }
        exit; 
    }

    public function eliminarPostulacion() {
        if (isset($_SESSION['usuario_id'])) {
            $id_postulacion = isset($_GET['id_postulacion']) ? Utils::sanitizarEntrada($_GET['id_postulacion']) : null;

            if ($this->postulacionDAO->eliminarPostulacion($id_postulacion)) {
                $_SESSION['mensaje'] = "Postulación eliminada exitosamente";
                $_SESSION['tipo_mensaje'] = "success";
                header('Location: ../View/Usuarios/PersonaView/persona_dashboard.php?seccion=Mis%20Postulaciones');
                exit;
            } else {
                throw new Exception("No se pudo eliminar la postulación");
            }
        } else {
            throw new Exception("Usuario no autenticado");
        }
    }
    
}

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new postulacionController();

    try {
        if ($action === 'crearPostulacion') {
            $controller->crearPostulacion();
        } elseif ($action === 'listarPorUsuario') {
            $controller->listarPorUsuario();
        } elseif ($action === 'eliminar') {
            $controller->eliminarPostulacion();

        
        } else {
            http_response_code(400); 
            echo json_encode(["error" => "Acción no válida"]);
        }
    } catch (Exception $e) {
        http_response_code(500); 
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Acción no especificada"]);    
}
?>