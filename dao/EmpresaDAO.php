<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Empresa.php';

class EmpresaDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); 
    }

    public function guardarEmpresa(Empresa $empresa) {

        $id_usuario = $empresa->getIdUsuario();
        $nombre_empresa = $empresa->getNombreEmpresa();
        $lugar_operacion = $empresa->getLugarOperacion();
        $ruc = $empresa->getRuc();
        $sector = $empresa->getSector();
        $descripcion = $empresa->getDescripcion();

        $sqlEmpresa = "INSERT INTO empresas (id_usuario, nombre_empresa, lugar_operacion, ruc, sector, descripcion) 
                       VALUES (?, ?, ?, ?, ?, ?)";
        $stmtEmpresa = $this->conn->prepare($sqlEmpresa);

        if ($stmtEmpresa === false) {
            throw new Exception("Error al preparar la consulta de empresas: " . $this->conn->error);
        }

        $stmtEmpresa->bind_param(
            'isssss',
            $id_usuario,
            $nombre_empresa,
            $lugar_operacion,
            $ruc,
            $sector,
            $descripcion
            
            );

        if (!$stmtEmpresa->execute()) {
            throw new Exception("Error al ejecutar la consulta de empresas: " . $stmtEmpresa->error);
        }

        return true;
    }

    public function obtenerEmpresaPorId($id_usuario) {
        $sql = "SELECT u.id_usuario, u.correo, u.contrasena, e.nombre_empresa, e.lugar_operacion, e.ruc, e.sector, e.descripcion 
                FROM usuarios u
                JOIN empresas e ON u.id_usuario = e.id_usuario
                WHERE u.id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_assoc();
        if ($data) {
            return new Empresa(
                $data['id_usuario'],
                $data['correo'],
                $data['contrasena'],
                $data['nombre_empresa'],
                $data['lugar_operacion'],
                $data['ruc'],
                $data['sector'],
                $data['descripcion']
            );
        }

        return null; 
    }

    public function actualizarEmpresa(Empresa $empresa) {
        
        $sqlUsuario = "UPDATE usuarios SET correo = ?, contrasena = ? WHERE id_usuario = ?";
        $stmtUsuario = $this->conn->prepare($sqlUsuario);

        if ($stmtUsuario === false) {
            throw new Exception("Error al preparar la consulta de usuarios: " . $this->conn->error);
        }

        $stmtUsuario->bind_param(
            'ssi',
            $empresa->getCorreo(),
            $empresa->getContrasena(),
            $empresa->getIdUsuario()
        );

        if (!$stmtUsuario->execute()) {
            throw new Exception("Error al ejecutar la consulta de usuarios: " . $stmtUsuario->error);
        }

        $sqlEmpresa = "UPDATE empresas 
                       SET nombre_empresa = ?, lugar_operacion = ?, ruc = ?, sector = ?, descripcion = ? 
                       WHERE id_usuario = ?";
        $stmtEmpresa = $this->conn->prepare($sqlEmpresa);

        if ($stmtEmpresa === false) {
            throw new Exception("Error al preparar la consulta de empresas: " . $this->conn->error);
        }

        $stmtEmpresa->bind_param(
            'sssssi',
            $empresa->getNombreEmpresa(),
            $empresa->getLugarOperacion(),
            $empresa->getRuc(),
            $empresa->getSector(),
            $empresa->getDescripcion(),
            $empresa->getIdUsuario()
        );

        if (!$stmtEmpresa->execute()) {
            throw new Exception("Error al ejecutar la consulta de empresas: " . $stmtEmpresa->error);
        }

        return true; 
    }

    public function eliminarEmpresa($id_usuario) {
        $sqlEmpresa = "DELETE FROM empresas WHERE id_usuario = ?";
        $stmtEmpresa = $this->conn->prepare($sqlEmpresa);

        if ($stmtEmpresa === false) {
            throw new Exception("Error al preparar la consulta de empresas: " . $this->conn->error);
        }

        $stmtEmpresa->bind_param('i', $id_usuario);

        if (!$stmtEmpresa->execute()) {
            throw new Exception("Error al ejecutar la consulta de empresas: " . $stmtEmpresa->error);
        }

        $sqlUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmtUsuario = $this->conn->prepare($sqlUsuario);

        if ($stmtUsuario === false) {
            throw new Exception("Error al preparar la consulta de usuarios: " . $this->conn->error);
        }

        $stmtUsuario->bind_param('i', $id_usuario);

        if (!$stmtUsuario->execute()) {
            throw new Exception("Error al ejecutar la consulta de usuarios: " . $stmtUsuario->error);
        }

        return true; 
    }
}
?>