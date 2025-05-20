<?php
require_once 'Usuario.php';

class Empresa extends Usuario {
    private $nombre_empresa;
    private $lugar_operacion;
    private $ruc;
    private $sector;
    private $descripcion;

    public function __construct(
        $id_usuario = null,
        $correo = null,
        $contrasena = null,
        $nombre_empresa = null,
        $lugar_operacion = null,
        $ruc = null,
        $sector = null,
        $descripcion = null
    ) {
        parent::__construct($id_usuario, $correo, $contrasena); // Llama al constructor de Usuario
        $this->nombre_empresa = $nombre_empresa;
        $this->lugar_operacion = $lugar_operacion;
        $this->ruc = $ruc;
        $this->sector = $sector;
        $this->descripcion = $descripcion;
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

    public function getRuc() {
        return $this->ruc;
    }

    public function setRuc($ruc) {
        $this->ruc = $ruc;
    }

    public function getSector() {
        return $this->sector;
    }

    public function setSector($sector) {
        $this->sector = $sector;
    }

    public function getDescripcion() {
        return $this->descripcion;
    }

    public function setDescripcion($descripcion) {
        $this->descripcion = $descripcion;
    }
}
?>