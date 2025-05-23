<?php
require_once '../dao/PostulacionDAO.php';

class Postulacion {

    private $id_postulacion;
    private $id_usuario_persona;
    private $id_vacante;
    private $fecha_postulacion;
    private $estado;

    public function __construct($id_postulacion = null, $id_usuario_persona = null, $id_vacante = null, $fecha_postulacion = null, $estado = null) {
        $this->id_postulacion = $id_postulacion;
        $this->id_usuario_persona = $id_usuario_persona;
        $this->id_vacante = $id_vacante;
        $this->fecha_postulacion = $fecha_postulacion;
        $this->estado = $estado;
    }

    public function getIdPostulacion() {
        return $this->id_postulacion;
    }

    public function setIdPostulacion($id_postulacion) {
        $this->id_postulacion = $id_postulacion;
    }

    public function getIdUsuarioPersona() {
        return $this->id_usuario_persona;
    }

    public function setIdUsuarioPersona($id_usuario_persona) {
        $this->id_usuario_persona = $id_usuario_persona;
    }

    public function getIdVacante() {
        return $this->id_vacante;
    }

    public function setIdVacante($id_vacante) {
        $this->id_vacante = $id_vacante;
    }

    public function getFechaPostulacion() {
        return $this->fecha_postulacion;
    }

    public function setFechaPostulacion($fecha_postulacion) {
        $this->fecha_postulacion = $fecha_postulacion;
    }

    public function getEstado() {
        return $this->estado;
    }

    public function setEstado($estado) {
        $this->estado = $estado;
    }

    

   
}
?>