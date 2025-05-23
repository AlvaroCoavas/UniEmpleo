<?php
session_start();
require_once '../dao/ServicioDAO.php';
require_once '../models/Servicio.php';
require_once '../dao/ServicioOfrecidoDAO.php';
require_once '../utils/Utils.php';
require_once '../dao/UsuarioDAO.php';

class ServicioController
{

    private $servicioDAO;
    private $usuarioDAO;

    public function __construct()
    {
        $this->servicioDAO = new ServicioDAO();
        $this->usuarioDAO = new UsuarioDAO();
    }

    public function solicitarServicio()
    {
        $usuario = $this->usuarioDAO->obtenerUsuarioPorId($_SESSION['usuario_id']);
        $_SESSION['usuario_id'] = $usuario->getIdUsuario();

        $id_usuario_solicita = isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : null;

        $nombre_servicio = Utils::sanitizarEntrada($_POST['nombre_servicio']);
        $descripcion = Utils::sanitizarEntrada($_POST['descripcion']);
        $fecha_solicitud = date('Y-m-d H:i:s');
        $estado = 'pendiente';


        $servicio = new Servicio(null, $id_usuario_solicita, $nombre_servicio, $descripcion, $fecha_solicitud, $estado);


        if ($this->servicioDAO->guardarServicio($servicio)) {
            echo "Servicio solicitado con éxito.";
        } else {
            echo "Error al solicitar el servicio.";
        }
    }

    public function listarServiciosPorUsuario()
    {
        if (isset($_SESSION['usuario_id'])) {
            try {
                $id_usuario_solicita = $_SESSION['usuario_id'];

                $servicios = $this->servicioDAO->obtenerServiciosPorUsuario($id_usuario_solicita);

                header('Content-Type: application/json');
                echo json_encode($servicios);
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

    public function obtenerOfertasPorServicio()
    {
        header('Content-Type: application/json');

        if (!isset($_GET['id_servicio'])) {

            echo json_encode(['success' => false, 'message' => 'ID de servicio no proporcionado']);
            return;
        }

        $id_servicio = intval($_GET['id_servicio']);


        $ofertaDAO = new ServicioOfrecidoDAO();

        try {
            $usuarios = $ofertaDAO->obtenerUsuariosPorServicio($id_servicio);

            echo json_encode(['success' => true, 'usuarios' => $usuarios]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }


    public function listarServiciosNoPropios()
    {
        if (isset($_SESSION['usuario_id'])) {
            try {
                $id_usuario_solicita = $_SESSION['usuario_id'];

                $servicios = $this->servicioDAO->listarServiciosNoPropios($id_usuario_solicita);

                header('Content-Type: application/json');
                echo json_encode($servicios);
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


    public function ofrecerServicio()
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id_servicio']) || !isset($_SESSION['usuario_id'])) {
            return;
        }

        $id_servicio = intval($input['id_servicio']);
        $usuario_id = intval($_SESSION['usuario_id']);

        $ofrecidoDAO = new ServicioOfrecidoDAO();

        try {

            if ($ofrecidoDAO->yaOfrecio($id_servicio, $usuario_id)) {
                return;
            }

            $resultado = $ofrecidoDAO->guardarOferta($id_servicio, $usuario_id);

            if ($resultado) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se pudo guardar la postulación.']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function serviciosPostulados()
    {
        $usuario_id = $_SESSION['usuario_id'] ?? null;

        if (!$usuario_id) {
            echo json_encode([]);
            return;
        }

        $servicios = $this->servicioDAO->obtenerServiciosPostuladosPorUsuario($usuario_id);
        header('Content-Type: application/json');
        echo json_encode($servicios);
    }

    public function listarNoOfrecidos()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['usuario_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            return;
        }

        $usuario_id = $_SESSION['usuario_id'];

        try {
            $servicios = $this->servicioDAO->obtenerServiciosNoOfrecidosPorUsuario($usuario_id);
            echo json_encode(['success' => true, 'datos' => $servicios]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function eliminarSolicitud()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['usuario_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            return;
        }

        $usuario_id = $_SESSION['usuario_id'];
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id_servicio'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta el ID del servicio']);
            return;
        }

        $id_servicio = $input['id_servicio'];

        try {
            $resultado = $this->servicioDAO->eliminarSolicitud($usuario_id, $id_servicio);

            if ($resultado) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'No se pudo eliminar la solicitud']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function cancelarPostulacion()
    {
        $usuario_id = $_SESSION['usuario_id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        $id_servicio = $data['id_servicio'] ?? null;

        if (!$usuario_id || !$id_servicio) {
            echo "Datos inválidos";
            return;
        }

        $resultado = $this->servicioDAO->cancelarPostulacion($usuario_id, $id_servicio);
        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Postulación cancelada']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cancelar']);
        }
        exit;
    }
}

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new ServicioController();

    try {
        if ($action === 'solicitar') {
            $controller->solicitarServicio();
        } elseif ($action === 'listar') {
            $controller->listarServiciosPorUsuario();
        } elseif ($action === 'listarNoPropios') {
            $controller->listarServiciosNoPropios();
        } elseif ($action === 'ofrecer') {
            $controller->ofrecerServicio();
        } elseif ($action === 'obtenerOfertas') {
            $controller->obtenerOfertasPorServicio();
        } elseif ($action === 'serviciosPostulados') {
            $controller->serviciosPostulados();
        } elseif ($action === 'cancelarPostulacion') {
            $controller->cancelarPostulacion();
        } elseif ($action === 'eliminarSolicitud') {
            $controller->eliminarSolicitud();
        } elseif ($action === 'listarNoOfrecidos') {
            $controller->listarNoOfrecidos();
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
