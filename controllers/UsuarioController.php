<?php
require_once '../models/Usuario.php';
require_once '../controllers/PersonaController.php';
require_once '../controllers/EmpresaController.php';

class UsuarioController {
    public function register() {
        $correo = $_POST['correo'];
        $contrasena = $_POST['contrasena'];
        $tipo_usuario = $_POST['tipo_usuario'];


   

        // Crear el usuario
        $usuario = new Usuario([
            'correo' => $correo,
            'contrasena' => password_hash($contrasena, PASSWORD_DEFAULT),
            'tipo_usuario' => $tipo_usuario
        ]);

        if ($usuario->save()) {
            echo "Usuario guardado correctamente";

            // Delegar el registro adicional a PersonaController o EmpresaController
            if ($tipo_usuario === 'persona') {
                $personaController = new PersonaController();
                $data = [
                    'id_usuario' => $usuario->id,
                    'nombre' => $_POST['nombre'],
                    'apellido' => $_POST['apellido'],
                    'fecha_nacimiento' => $_POST['fecha_nacimiento']
                ];
                $result = $personaController->register($data);

                if ($result === true) {
                    echo "<script>alert('Persona registrada exitosamente.'); window.location='../View/login.php';</script>";
                } else {
                    echo "Error al guardar los datos de la persona: ";
                    print_r($result);
                }
            }

            if ($tipo_usuario === 'empresa') {
                $empresaController = new EmpresaController();
                $data = [
                    'id_usuario' => $usuario->id,
                    'nombre_empresa' => $_POST['nombre'],
                    'lugar_operacion' => $_POST['lugar_operacion'],
                ];
                $result = $empresaController->register($data);

                if ($result === true) {
                    echo "<script>alert('Empresa registrada exitosamente.');</script>";
                } else {
                    echo "Error al guardar los datos de la empresa: ";
                    print_r($result);
                }
            }
        } else {
            echo "Error al guardar el usuario: ";
            print_r($usuario->errors->full_messages());
        }
    }

    public static function verificarCorreo($correo) {
        $usuario = Usuario::find('first', ['conditions' => ['correo = ?', $correo]]);
        if ($usuario) {
            echo "Usuario encontrado: " . $usuario->correo . "<br>";
        } else {
            echo "No se encontró un usuario con el correo: " . $correo . "<br>";
        }
        return $usuario;
    }

    public function login() {
        $correo = $_POST['correo'];
        $contrasena = $_POST['contrasena'];
    
        // Verificar si el usuario existe
        $usuario = Usuario::verificarCorreo($correo);
    
        if ($usuario && password_verify($contrasena, $usuario->contrasena)) {
            // Iniciar sesión
            session_start();
            $_SESSION['usuario_id'] = $usuario->id;
            $_SESSION['tipo_usuario'] = $usuario->tipo_usuario;
    
            // Redirigir según el tipo de usuario
            if ($usuario->tipo_usuario === 'persona') {
                echo "<script>alert('Inicio de sesión exitoso.'); window.location='../view/Usuarios/persona_dashboard.php';</script>";
            } elseif ($usuario->tipo_usuario === 'empresa') {
                echo "<script>alert('Inicio de sesión exitoso.'); window.location='../View/empresa_dashboard.php';</script>";
            } else {
                echo "<script>alert('Tipo de usuario no reconocido.'); window.location='../View/login.php';</script>";
            }
        } else {
            echo "<script>alert('Correo o contraseña incorrectos.');</script>";
        }
    }

public function logout() {
    session_start();
    session_destroy();
    echo "<script>alert('Sesión cerrada.'); window.location='../View/login.php';</script>";
}
}
// Manejar la acción desde la URL
if (isset($_GET['action'])) {
    $controller = new UsuarioController();
    $action = $_GET['action'];

    // Depurar el valor de $action
    echo "Acción solicitada: " . $action . "<br>";

    // Verificar si el método existe en el controlador
    if (method_exists($controller, $action)) {
        $controller->$action(); // Llamar al método dinámicamente
    } else {
        echo "Acción no válida.";
    }
}

?>