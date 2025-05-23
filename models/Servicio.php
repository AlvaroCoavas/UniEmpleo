<?php
class Servicio {
    private $id_servicio;
    private $id_usuario_solicita;
    private $nombre_servicio;
    private $descripcion;
    private $fecha_solicitud;
    private $estado;

    public function __construct($id_servicio = null, $id_usuario_solicita = null, $nombre_servicio = null, $descripcion = null, $fecha_solicitud = null, $estado = null) {
        $this->id_servicio = $id_servicio;
        $this->id_usuario_solicita = $id_usuario_solicita;
        $this->nombre_servicio = $nombre_servicio;
        $this->descripcion = $descripcion;
        $this->fecha_solicitud = $fecha_solicitud;
        $this->estado = $estado;
    }

    public function getIdServicio() {
        return $this->id_servicio;
    }

    public function setIdServicio($id_servicio) {
        $this->id_servicio = $id_servicio;
    }

    public function getIdUsuarioSolicita() {
        return $this->id_usuario_solicita;
    }

    public function setIdUsuarioSolicita($id_usuario_solicita) {
        $this->id_usuario_solicita = $id_usuario_solicita;
    }

    public function getNombreServicio() {
        return $this->nombre_servicio;
    }

    public function setNombreServicio($nombre_servicio) {
        $this->nombre_servicio = $nombre_servicio;
    }

    public function getDescripcion() {
        return $this->descripcion;
    }

    public function setDescripcion($descripcion) {
        $this->descripcion = $descripcion;
    }

    public function getFechaSolicitud() {
        return $this->fecha_solicitud;
    }

    public function setFechaSolicitud($fecha_solicitud) {
        $this->fecha_solicitud = $fecha_solicitud;
    }

    public function getEstado() {
        return $this->estado;
    }

    public function setEstado($estado) {
        $this->estado = $estado;
    }

    
}
?>