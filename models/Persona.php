<?php
class Empresa {
    private $id_usuario;
    private $nombre_empresa;
    private $lugar_operacion;

    // Constructor
    public function __construct($id_usuario = null, $nombre_empresa = null, $lugar_operacion = null) {
        $this->id_usuario = $id_usuario;
        $this->nombre_empresa = $nombre_empresa;
        $this->lugar_operacion = $lugar_operacion;
    }

    // Getters y Setters
    public function getIdUsuario() {
        return $this->id_usuario;
    }

    public function setIdUsuario($id_usuario) {
        $this->id_usuario = $id_usuario;
    }

    public function getNombreEmpresa() {
        return $this->nombre_empresa;
    }

    public function setNombreEmpresa($nombre_empresa) {
        $this->nombre_empresa = $nombre_empresa;
    }

    public function getLugarOperacion() {
        return $this->lugar_operacion;
    }

    public function setLugarOperacion($lugar_operacion) {
        $this->lugar_operacion = $lugar_operacion;
    }
}
?>