<?php
class ServicioOfrecido {
    private $id;
    private $id_servicio;
    private $id_usuario_ofrece;
    private $fecha_ofrecimiento;

    public function __construct($id_servicio, $id_usuario_ofrece, $fecha_ofrecimiento = null, $id = null) {
        $this->id = $id;
        $this->id_servicio = $id_servicio;
        $this->id_usuario_ofrece = $id_usuario_ofrece;
        $this->fecha_ofrecimiento = $fecha_ofrecimiento ?? date('Y-m-d H:i:s');
    }

    public function getId() {
        return $this->id;
    }


    public function getIdServicio() {
        return $this->id_servicio;
    }   
    public function setIdServicio($id_servicio) {
        $this->id_servicio = $id_servicio;
    }

    public function setIdUsuarioOfrece($id_usuario_Ofrece) {
        $this->id_usuario_ofrece = $id_usuario_Ofrece;
    }

    public function getIdUsuarioOfrece() {
        return $this->id_usuario_ofrece;
    }

 
    public function getFechaOfrecimiento() {
        return $this->fecha_ofrecimiento;
    }

    public function setFechaOfrecimiento($fecha_ofrecimiento) {
        $this->fecha_ofrecimiento = $fecha_ofrecimiento;
    }
}
?>
