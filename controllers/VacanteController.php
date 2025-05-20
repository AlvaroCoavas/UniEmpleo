<?php
session_start(); // Iniciar sesión

require_once '../models/Vacante.php';
require_once '../models/Empresa.php';
require_once '../dao/VacanteDAO.php';
require_once '../dao/EmpresaDAO.php';
require_once '../dao/UsuarioDAO.php';
require_once '../utils/Utils.php';

class VacanteController {
    private $vacanteDAO;
    private $empresaDAO;
    
    public function __construct() {
        $this->vacanteDAO = new VacanteDAO();
        $this->empresaDAO = new EmpresaDAO();
    }
    // Método para crear una nueva vacante
    public function crearVacante() {
        
        $id_usuario_empresa = isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : null;
        $titulo = Utils::sanitizarEntrada($_POST['titulo']);
        $descripcion = Utils::sanitizarEntrada($_POST['descripcion']);
        $salario = Utils::sanitizarEntrada($_POST['salario']);
        $estado = Utils::sanitizarEntrada($_POST['estado']?? null);
        $fechaPublicacion = Utils::sanitizarEntrada($_POST['fecha_publicacion']?? null);
        $ciudad = Utils::sanitizarEntrada($_POST['ciudad']);
        $tipo = Utils::sanitizarEntrada($_POST['tipo']);
        $perfil = Utils::sanitizarEntrada($_POST['perfil']);
        
    
            // Crear y configurar el objeto Vacante con los datos del formulario
            $vacante = new Vacante( 
                null, // ID vacante (se generará automáticamente)
                $id_usuario_empresa,
                $titulo,
                $descripcion,
                $salario,
                $estado,
                $fechaPublicacion,
                $ciudad,
                $tipo,
                $perfil
            );
            $idVacante = $this->vacanteDAO->guardarVacante($vacante);
            
            if ($idVacante) {
                // Éxito: establecer mensaje y redirigir a lista de vacantes
                $_SESSION['mensaje'] = "Vacante creada exitosamente";
                $_SESSION['tipo_mensaje'] = "success";
                header('Location: index.php?controlador=vacante&accion=listar');
                exit;
            } else {
                throw new Exception("No se pudo guardar la vacante");
            }

    }
    
    
    // Método para listar vacantes
    public function listar() {
        try {
            $vacantes = $this->vacanteDAO->obtenerTodasLasVacantes();
    
            // Convertir a array plano
            $vacantesArray = array_map(function($vacante) {
                return [
                    'id_vacante' => $vacante->getIdVacante(),
                    'id_usuario_empresa' => $vacante->getIdUsuarioEmpresa(),
                    'titulo' => $vacante->getTitulo(),
                    'descripcion' => $vacante->getDescripcion(),
                    'salario' => $vacante->getSalario(),
                    'estado' => $vacante->getEstado(),
                    'fecha_publicacion' => $vacante->getFechaPublicacion(),
                    'ciudad' => $vacante->getCiudad(),
                    'tipo' => $vacante->getTipo(),
                    'perfil' => $vacante->getPerfil(),
                ];
            }, $vacantes);
    
            header('Content-Type: application/json');
            echo json_encode($vacantesArray);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
}    

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new VacanteController();

    try {
        if ($action === 'crearVacante') {
            $controller->crearVacante();
        } elseif ($action === 'listar') {
            $controller->listar();
        } elseif ($action === 'logout') {
            $controller->logout();
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(["error" => "Acción no válida"]);
        }
    } catch (Exception $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Acción no especificada"]);    
}
?>