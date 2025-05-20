<?php
class Vacante {
    private $id_vacante;
    private $id_usuario_empresa;
    private $titulo;
    private $descripcion;
    private $salario;
    private $estado;
    private $fecha_publicacion;
    private $ciudad;
    private $tipo;
    private $perfil;

    public function __construct($id_vacante = null, $id_usuario_empresa = null, $titulo = null, $descripcion = null, $salario = null, $estado = null, $fecha_publicacion = null, $ciudad = null, $tipo = null, $perfil = null) {
        $this->id_vacante = $id_vacante;
        $this->id_usuario_empresa = $id_usuario_empresa;
        $this->titulo = $titulo;
        $this->descripcion = $descripcion;
        $this->salario = $salario;
        $this->estado = $estado;
        $this->fecha_publicacion = $fecha_publicacion;
        $this->ciudad = $ciudad;
        $this->tipo = $tipo;
        $this->perfil = $perfil;
    }

    public function getIdVacante() {
        return $this->id_vacante;
    }

    public function setIdVacante($id_vacante) {
        $this->id_vacante = $id_vacante;
    }

    public function getIdUsuarioEmpresa() {
        return $this->id_usuario_empresa;
    }

    public function setIdUsuarioEmpresa($id_usuario_empresa) {
        $this->id_empresa = $id_usuario_empresa;
    }

    public function getTitulo() {
        return $this->titulo;
    }

    public function setTitulo($titulo) {
        $this->titulo = $titulo;
    }

    public function getDescripcion() {
        return $this->descripcion;
    }

    public function setDescripcion($descripcion) {
        $this->descripcion = $descripcion;
    }

    public function getSalario() {
        return $this->salario;
    }

    public function setSalario($salario) {
        $this->salario = $salario;
    }

    public function getEstado() {
        return $this->estado;
    }

    public function setEstado($estado) {
        $this->estado = $estado;
    }

    public function getFechaPublicacion() {
        return $this->fecha_publicacion;
    }

    public function setFechaPublicacion($fecha_publicacion) {
        $this->fecha_publicacion = $fecha_publicacion;
    }

    public function getCiudad() {
        return $this->ciudad;
    }

    public function setCiudad($ciudad) {
        $this->ciudad = $ciudad;
    }

    public function getTipo() {
        return $this->tipo;
    }

    public function setTipo($tipo) {
        $this->tipo = $tipo;
    }

    public function getPerfil() {
        return $this->perfil;
    }

    public function setPerfil($perfil) {
        $this->perfil = $perfil;
    }


}