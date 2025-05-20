<?php
require_once 'Usuario.php';

class Persona extends Usuario {
    private $nombre;
    private $apellido;
    private $cedula;
    private $telefono;
    private $fecha_nacimiento;
    private $lugar_residencia;
    private $profesion_u_oficio;
    private $resumen_profesional;
    private $servicios_completados;

    public function __construct(
        $id_usuario = null,
        $correo = null,
        $contrasena = null,
        $nombre = null,
        $apellido = null,
        $cedula = null,
        $telefono = null,
        $fecha_nacimiento = null,
        $lugar_residencia = null,
        $profesion_u_oficio = null,
        $resumen_profesional = null,
        $servicios_completados = null
    ) {
        parent::__construct($id_usuario, $correo, $contrasena); // Llama al constructor de Usuario
        $this->nombre = $nombre;
        $this->apellido = $apellido;
        $this->cedula = $cedula;
        $this->telefono = $telefono;
        $this->fecha_nacimiento = $fecha_nacimiento;
        $this->lugar_residencia = $lugar_residencia;
        $this->profesion_u_oficio = $profesion_u_oficio;
        $this->resumen_profesional = $resumen_profesional;
        $this->servicios_completados = $servicios_completados;
    }

    public function getNombre() {
        return $this->nombre;
    }

    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }

    public function getApellido() {
        return $this->apellido;
    }

    public function setApellido($apellido) {
        $this->apellido = $apellido;
    }

    public function getCedula() {
        return $this->cedula;
    }

    public function setCedula($cedula) {
        $this->cedula = $cedula;
    }

    public function getTelefono() {
        return $this->telefono;
    }

    public function setTelefono($telefono) {
        $this->telefono = $telefono;
    }

    public function getFechaNacimiento() {
        return $this->fecha_nacimiento;
    }

    public function setFechaNacimiento($fecha_nacimiento) {
        $this->fecha_nacimiento = $fecha_nacimiento;
    }

    public function getLugarResidencia() {
        return $this->lugar_residencia;
    }

    public function setLugarResidencia($lugar_residencia) {
        $this->lugar_residencia = $lugar_residencia;
    }

    public function getProfesionUOficio() {
        return $this->profesion_u_oficio;
    }

    public function setProfesionUOficio($profesion_u_oficio) {
        $this->profesion_u_oficio = $profesion_u_oficio;
    }

    public function getResumenProfesional() {
        return $this->resumen_profesional;
    }

    public function setResumenProfesional($resumen_profesional) {
        $this->resumen_profesional = $resumen_profesional;
    }

    public function getServiciosCompletados() {
        return $this->servicios_completados;
    }

    public function setServiciosCompletados($servicios_completados) {
        $this->servicios_completados = $servicios_completados;
    }
}
?>