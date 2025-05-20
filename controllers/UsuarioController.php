<?php
require_once '../dao/UsuarioDAO.php';
require_once '../controllers/PersonaController.php';
require_once '../controllers/EmpresaController.php';
require_once '../models/Usuario.php';
require_once '../utils/Utils.php';

class UsuarioController {
    private $usuarioDAO;

    public function __construct() {
        $this->usuarioDAO = new UsuarioDAO();
    }


        public function register() {
           
            $correo = Utils::sanitizarEntrada($_POST['correo']);
            $contrasena = Utils::sanitizarEntrada($_POST['contrasena']);
            $tipo_usuario = Utils::sanitizarEntrada($_POST['tipo_usuario'] ?? null);
            
    
            if (empty($tipo_usuario)) {
                echo "El tipo de usuario es obligatorio.";
                exit();
            }
    
            // Verificar si el correo ya existe
            if ($this->usuarioDAO->verificarCorreo($correo)) {
                echo "El correo ya está registrado.";
                exit();
            }
    
            // Hashear la contraseña
            $hash_contrasena = password_hash($contrasena, PASSWORD_DEFAULT);
    
            // Crear una instancia del modelo Usuario
            $usuario = new Usuario(null, $correo, $hash_contrasena, $tipo_usuario);
    
            // Guardar el usuario
            if ($this->usuarioDAO->guardarUsuario($usuario)) {
                $usuario_id = $this->usuarioDAO->obtenerUltimoId();
   
                // Delegar el registro adicional según el tipo de usuario
                if ($tipo_usuario === 'persona') {
                    $personaController = new PersonaController();
                    $personaController->register([
                        'id_usuario' => $usuario_id,
                        'correo' => $correo,
                        'contrasena' => $hash_contrasena,
                        'nombre' => Utils::sanitizarEntrada($_POST['nombre'] ?? null),
                        'apellido' => Utils::sanitizarEntrada($_POST['apellido'] ?? null),
                        'cedula' => Utils::sanitizarEntrada($_POST['cedula'] ?? null),
                        'telefono' => Utils::sanitizarEntrada($_POST['telefono'] ?? null),
                        'fecha_nacimiento' => Utils::sanitizarEntrada($_POST['fecha_nacimiento'] ?? null),
                        'lugar_residencia' => Utils::sanitizarEntrada($_POST['lugar_residencia'] ?? null),
                        'profesion_u_oficio' => Utils::sanitizarEntrada($_POST['profesion_u_oficio'] ?? null),
                        'resumen_profesional' => Utils::sanitizarEntrada($_POST['resumen_profesional'] ?? null),
                        'servicios_completados' => Utils::sanitizarEntrada($_POST['servicios_completados'] ?? 0)

                        
                    ]);
                    
                } elseif ($tipo_usuario === 'empresa') {
                    $empresaController = new EmpresaController();
                    $empresaController->register([
                        'id_usuario' => $usuario_id,
                        'correo' => $correo,
                        'contrasena' => $hash_contrasena,
                        'nombre_empresa' => Utils::sanitizarEntrada($_POST['nombre_empresa'] ?? null),
                        'lugar_operacion' => Utils::sanitizarEntrada($_POST['lugar_operacion'] ?? null),
                        'ruc' => Utils::sanitizarEntrada($_POST['ruc'] ?? null),
                        'sector' => Utils::sanitizarEntrada($_POST['sector'] ?? null),
                        'descripcion' => Utils::sanitizarEntrada($_POST['descripcion'] ?? null)
                    ]);
                }
                
                 // Redirigir según el tipo de usuario
            if ($usuario->getTipoUsuario() === 'persona') {
                Utils::redirigirConMensaje('../View/Usuarios/PersonaView/persona_dashboard.php');
            } elseif ($usuario->getTipoUsuario() === 'empresa') {
                Utils::redirigirConMensaje('../View/Usuarios/EmpresaView/empresa_dashboard.php');
            } else {
                Utils::redirigirConMensaje('../View/login.php');
            }
                exit();
            } else {
                echo "Error al guardar el usuario.";
                exit();
            }
        }
    

    public function login() {
        $correo = Utils::sanitizarEntrada($_POST['correo']);
        $contrasena = Utils::sanitizarEntrada($_POST['contrasena']);

        // Verificar si el usuario existe
        $usuario = $this->usuarioDAO->obtenerUsuarioPorCorreo($correo);

        if ($usuario && password_verify($contrasena, $usuario->getContrasena())) {
            // Iniciar sesión
            session_start();
            $_SESSION['usuario_id'] = $usuario->getIdUsuario();
            $_SESSION['tipo_usuario'] = $usuario->getTipoUsuario();

            // Redirigir según el tipo de usuario
            if ($usuario->getTipoUsuario() === 'persona') {
                Utils::redirigirConMensaje('../View/Usuarios/PersonaView/persona_dashboard.php');
            } elseif ($usuario->getTipoUsuario() === 'empresa') {
                Utils::redirigirConMensaje('../View/Usuarios/EmpresaView/empresa_dashboard.php');
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

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new UsuarioController();

    try {
        if ($action === 'register') {
            $controller->register();
        } elseif ($action === 'login') {
            $controller->login();
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