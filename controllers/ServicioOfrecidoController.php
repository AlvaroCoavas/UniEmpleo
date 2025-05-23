<?php

session_start();
require_once '../dao/ServicioOfrecidoDAO.php';
require_once '../dao/UsuarioDAO.php';
require_once '../models/ServicioOfrecido.php';
require_once '../utils/Utils.php';

class ServicioOfrecidoController {

    private $dao;

    public function __construct() {
        $this->dao = new ServicioOfrecidoDAO();
    }

    public function crear() {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id_servicio']) || !isset($input['id_usuario'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos.']);
            return;
        }

        $id_servicio = intval($input['id_servicio']);
        $id_usuario = intval($input['id_usuario']);

        if ($this->dao->yaOfrecio($id_servicio, $id_usuario)) {
            echo json_encode(['success' => false, 'message' => 'Ya te has ofrecido para este servicio.']);
            return;
        }

        $ofrecimiento = new ServicioOfrecido($id_servicio, $id_usuario);

        $exito = $this->dao->registrar($ofrecimiento);
        echo json_encode(['success' => $exito]);
    }

    public function listar() {
        header('Content-Type: application/json');

        if (!isset($_GET['id_servicio'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de servicio no proporcionado.']);
            return;
        }

        $id_servicio = intval($_GET['id_servicio']);

        try {
            $ofrecidos = $this->dao->obtenerUsuariosPorServicio($id_servicio);
            
            echo json_encode(['success' => true, 'datos' => $ofrecidos]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
}

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new ServicioOfrecidoController();

    try {
        if ($action === 'crear') {
            $controller->crear();
        } elseif ($action === 'listar') {
            $controller->listar();
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
