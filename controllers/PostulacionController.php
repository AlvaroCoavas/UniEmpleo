<?php
session_start();
require_once '../models/Postulacion.php';
require_once '../dao/PostulacionDAO.php';
require_once '../dao/UsuarioDAO.php';
require_once '../dao/VacanteDAO.php';
require_once '../utils/Utils.php';

class PostulacionController{

    private $postulacionDAO;
    private $usuarioDAO;
    private $vacanteDAO;

    public function __construct() {
        $this->postulacionDAO = new PostulacionDao();
        $this->usuarioDAO = new UsuarioDAO();
        $this->vacanteDAO = new VacanteDAO();
    }

    public function crearPostulacion() {
        if (isset($_SESSION['usuario_id'])) {
            $id_usuario_persona = $_SESSION['usuario_id'];
            $id_vacante = Utils::sanitizarEntrada($_POST['id_vacante']);
            $fecha_postulacion = date('Y-m-d H:i:s');
            $estado = 'pendiente';

            // Crear el objeto Postulacion
            $postulacion = new Postulacion(null, $id_usuario_persona, $id_vacante, $fecha_postulacion, $estado);

            // Guardar la postulacion
            if ($this->postulacionDAO->guardarPostulacion($postulacion)) {
                $_SESSION['mensaje'] = "Postulación realizada exitosamente";
                $_SESSION['tipo_mensaje'] = "success";
                header('Location: index.php?controlador=vacante&accion=listar');
                exit;
            } else {
                throw new Exception("No se pudo guardar la postulación");
            }
        } else {
            throw new Exception("Usuario no autenticado");
        }
    }
}
?>