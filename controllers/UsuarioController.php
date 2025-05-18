<?php
require_once '../dao/UsuarioDAO.php';
require_once '../dao/PersonaDAO.php';
require_once '../dao/EmpresaDAO.php';
require_once '../utils/Utils.php';
require_once '../utils/SessionManager.php';


class UsuarioController {
    private $usuarioDAO;
    private $personaDAO;
    private $empresaDAO;

    public function __construct() {
        $this->usuarioDAO = new UsuarioDAO();
        $this->personaDAO = new PersonaDAO();
        $this->empresaDAO = new EmpresaDAO();
    }

    
    public function register() {
        $correo = Utils::sanitizarEntrada($_POST['correo']);
        $contrasena = Utils::sanitizarEntrada($_POST['contrasena']);
        $tipo_usuario = Utils::sanitizarEntrada($_POST['tipo_usuario']);
    
        // Verificar si el correo ya existe
        if ($this->usuarioDAO->verificarCorreo($correo)) {
            SessionManager::set('mensaje', "El correo ya tiene una cuenta. Por favor, inicie sesión.");
            header("Location: ../View/register.php");
            exit();
        }
    
        // Hashear la contraseña
        $hash_contrasena = password_hash($contrasena, PASSWORD_DEFAULT);
    
        // Guardar el usuario
        if ($this->usuarioDAO->guardarUsuario($correo, $hash_contrasena, $tipo_usuario)) {
            $usuario_id = $this->usuarioDAO->obtenerUltimoId();
            
            // Registrar datos adicionales según el tipo de usuario
            if ($tipo_usuario === 'persona') {
                $this->registrarPersona($usuario_id);
            } elseif ($tipo_usuario === 'empresa') {
                $this->registrarEmpresa($usuario_id);
            }
    
            exit();
        } else {
            // Si ocurre un error al guardar el usuario
            SessionManager::set('mensaje', "Error al guardar el usuario.");
            header("Location: ../View/register.php");
            exit();
        }
    }

    private function registrarPersona($usuario_id) {
        $nombre = Utils::sanitizarEntrada($_POST['nombre']);
        $apellido = Utils::sanitizarEntrada($_POST['apellido']);
        $fecha_nacimiento = Utils::sanitizarEntrada($_POST['fecha_nacimiento']);

        if ($this->personaDAO->guardarPersona($usuario_id, $nombre, $apellido, $fecha_nacimiento)) {
            Utils::redirigirConMensaje("../View/Usuarios/persona_dashboard.php?usuario_id=$usuario_id");
        } else {
            echo "Error al guardar los datos de la persona.";
        }
    }

    private function registrarEmpresa($usuario_id) {
        $nombre_empresa = Utils::sanitizarEntrada($_POST['nombre_empresa']);
        $lugar_operacion = Utils::sanitizarEntrada($_POST['lugar_operacion']);

        if ($this->empresaDAO->guardarEmpresa($usuario_id, $nombre_empresa, $lugar_operacion)) {
            Utils::redirigirConMensaje('../View/login.php');
        } else {
            echo "Error al guardar los datos de la empresa.";
        }
    }

    public function login() {
        // Sanitizar entradas
        $correo = Utils::sanitizarEntrada($_POST['correo']);
        $contrasena = Utils::sanitizarEntrada($_POST['contrasena']);

        // Verificar si el usuario existe
        $usuario = $this->usuarioDAO->obtenerUsuarioPorCorreo($correo);

        if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
            // Iniciar sesión
            session_start();
            $_SESSION['usuario_id'] = $usuario['id_usuario'];
            $_SESSION['tipo_usuario'] = $usuario['tipo_usuario'];

            // Redirigir según el tipo de usuario
            if ($usuario['tipo_usuario'] === 'persona') {
                Utils::redirigirConMensaje('../View/Usuarios/persona_dashboard.php');
            } elseif ($usuario['tipo_usuario'] === 'empresa') {
                Utils::redirigirConMensaje('../View/empresa_dashboard.php');
            } else {
                Utils::redirigirConMensaje('../View/login.php');
            }
        } else {
            Utils::redirigirConMensaje('../View/login.php');
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        Utils::redirigirConMensaje('../view/Usuarios/index.php');
    }
}

// Manejar la acción desde la URL
if (isset($_GET['action'])) {
    $controller = new UsuarioController();
    $action = $_GET['action'];

    // Verificar si el método existe en el controlador
    if (method_exists($controller, $action)) {
        $controller->$action(); // Llamar al método dinámicamente
    } else {
        echo "Acción no válida.";
    }

}
?>