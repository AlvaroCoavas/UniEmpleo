<?php
require_once '../libs/configbd.php';

class Servicio extends ActiveRecord\Model {
    static $table_name = 'servicios'; // Nombre de la tabla en la base de datos

    // Relaciones
    static $has_many = [
        ['conflictos', 'class_name' => 'Conflicto', 'foreign_key' => 'id_servicio']
    ];

    static $belongs_to = [
        ['usuario_solicita', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario_solicita'],
        ['usuario_ofrece', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario_ofrece']
    ];

    // Validaciones
    static $validates_presence_of = [
        ['descripcion', 'message' => 'La descripción es obligatoria'],
        ['id_usuario_solicita', 'message' => 'El usuario que solicita el servicio es obligatorio'],
        ['id_usuario_ofrece', 'message' => 'El usuario que ofrece el servicio es obligatorio']
    ];
}
?>