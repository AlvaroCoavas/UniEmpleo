<?php
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/Usuario.php');
require_once(__DIR__ . '/../dao/PersonaDAO.php');
require_once(__DIR__ . '/../dao/EmpresaDAO.php');

class UsuarioDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Guardar un usuario en la base de datos
    public function guardarUsuario(Usuario $usuario) {
        $sql = "INSERT INTO usuarios (correo, contrasena, tipo_usuario) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        // Asignar valores a variables antes de pasarlos como referencia
        $correo = $usuario->getCorreo();
        $contrasena = $usuario->getContrasena();
        $tipo_usuario = $usuario->getTipoUsuario();
        

        $stmt->bind_param('sss', $correo, $contrasena, $tipo_usuario);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consultasss: " . $stmt->error);
        }
    }

    // Obtener todos los usuarios
    public function obtenerTodosLosUsuarios() {
        $sql = "SELECT * FROM usuarios";
        $result = $this->conn->query($sql);

        if ($result === false) {
            throw new Exception("Error al ejecutar la consulta: " . $this->conn->error);
        }

        $usuarios = [];
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = new Usuario(
                $row['id_usuario'],
                $row['correo'],
                $row['contrasena'],
                $row['tipo_usuario']
            );
        }

        return $usuarios;
    }

    // Obtener un usuario por su ID y tipo
    public function obtenerUsuarioPorId($id_usuario) {
        $sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_assoc();
        if ($data) {
            if ($data['tipo_usuario'] === 'persona') {
                $personaDAO = new PersonaDAO();
                return $personaDAO->obtenerPersonaPorId($id_usuario);
            } elseif ($data['tipo_usuario'] === 'empresa') {
                $empresaDAO = new EmpresaDAO();
                return $empresaDAO->obtenerEmpresaPorId($id_usuario);
            } else {
                return new Usuario(
                    $data['id_usuario'],
                    $data['correo'],
                    $data['contrasena'],
                    $data['tipo_usuario']
                );
            }
        }

        return null; // Si no se encuentra el usuario
    }

    public function obtenerUltimoId() {
        return $this->conn->insert_id;
    }

        public function obtenerUsuarioPorCorreo($correo) {
        $sql = "SELECT * FROM usuarios WHERE correo = ?";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }
        $stmt->bind_param('s', $correo);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        if ($data) {
            return new Usuario(
                $data['id_usuario'],
                $data['correo'],
                $data['contrasena'],
                $data['tipo_usuario']
            );
        }
        return null; // Si no se encuentra el usuario
    }
    

    // Actualizar un usuario
    public function actualizarUsuario(Usuario $usuario) {
        $sql = "UPDATE usuarios SET correo = ?, contrasena = ?, tipo_usuario = ? WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param(
            'sssi',
            $usuario->getCorreo(),
            $usuario->getContrasena(),
            $usuario->getTipoUsuario(),
            $usuario->getIdUsuario()
        );

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Eliminar un usuario
    public function eliminarUsuario($id_usuario) {
        // Verificar el tipo de usuario antes de eliminar
        $usuario = $this->obtenerUsuarioPorId($id_usuario);

        if ($usuario instanceof Persona) {
            $personaDAO = new PersonaDAO();
            $personaDAO->eliminarPersona($id_usuario);
        } elseif ($usuario instanceof Empresa) {
            $empresaDAO = new EmpresaDAO();
            $empresaDAO->eliminarEmpresa($id_usuario);
        }

        // Eliminar de la tabla usuarios
        $sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_usuario);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Verificar si un correo ya está registrado
    public function verificarCorreo($correo) {
        $sql = "SELECT * FROM usuarios WHERE correo = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('s', $correo);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $data = $result->fetch_assoc();
            if ($data) {
                return new Usuario(
                    $data['id_usuario'],
                    $data['correo'],
                    $data['contrasena'],
                    $data['tipo_usuario']
                );
            }
            return null;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }
}
?>