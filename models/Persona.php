<?php
require_once '../libs/configbd.php';

class Persona extends ActiveRecord\Model {
    static $table_name = 'personas';

    // Relación con el modelo Usuario
    static $belongs_to = [
        ['usuario', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario']
    ];
}
?>