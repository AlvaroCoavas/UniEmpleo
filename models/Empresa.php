<?php
require_once '../libs/configbd.php';

class Empresa extends ActiveRecord\Model {
    static $table_name = 'empresas';

    // Relación con el modelo Usuario
    static $belongs_to = [
        ['usuario', 'class_name' => 'Usuario', 'foreign_key' => 'id_usuario']
    ];
}
?>