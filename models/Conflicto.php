<?php
require_once '../libs/configbd.php';

class Conflicto extends ActiveRecord\Model {
    static $table_name = 'conflictos'; // Nombre de la tabla en la base de datos

    // Relaciones
    static $belongs_to = [
        ['servicio', 'class_name' => 'Servicio', 'foreign_key' => 'id_servicio'],
        ['usuario_solicita', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario_solicita'],
        ['usuario_ofrece', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario_ofrece']
    ];

    // Validaciones
    static $validates_presence_of = [
        ['descripcion', 'message' => 'La descripción es obligatoria'],
        ['fecha_solicitud', 'message' => 'La fecha de solicitud es obligatoria'],
        ['estado', 'message' => 'El estado es obligatorio']
    ];
}
?>