<?php
class Usuario {
    private $id_usuario;
    private $correo;
    private $contrasena;
    private $tipo_usuario;

    // Constructor
    public function __construct($id_usuario = null, $correo = null, $contrasena = null, $tipo_usuario = null) {
        $this->id_usuario = $id_usuario;
        $this->correo = $correo;
        $this->contrasena = $contrasena;
        $this->tipo_usuario = $tipo_usuario;
    }

    // Getters y Setters
    public function getIdUsuario() {
        return $this->id_usuario;
    }

    public function getCorreo() {
        return $this->correo;
    }

    public function setCorreo($correo) {
        $this->correo = $correo;
    }

    public function getContrasena() {
        return $this->contrasena;
    }

    public function setContrasena($contrasena) {
        $this->contrasena = $contrasena;
    }

    public function getTipoUsuario() {
        return $this->tipo_usuario;
    }

    public function setTipoUsuario($tipo_usuario) {
        $this->tipo_usuario = $tipo_usuario;
    }

    // Métodos de utilidad
    public function esPersona() {
        return $this->tipo_usuario === 'persona';
    }

    public function esEmpresa() {
        return $this->tipo_usuario === 'empresa';
    }
}
?>