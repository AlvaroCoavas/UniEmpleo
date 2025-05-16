<?php
require_once '../libs/configbd.php';
class Usuario extends ActiveRecord\Model {
    // Especificar el nombre de la tabla
    static $table_name = 'usuarios';

    // Validaciones
    static $validates_presence_of = [
        ['correo', 'message' => 'El correo es obligatorio'],
        ['contrasena', 'message' => 'La contraseña es obligatoria']
    ];

    // Relaciones
    static $has_one = [
        ['persona', 'class_name' => 'Persona', 'foreign_key' => 'id_usuario'],
        ['empresa', 'class_name' => 'Empresa', 'foreign_key' => 'id_usuario']
    ];

    // Métodos personalizados
    public static function verificarCorreo($correo) {
        return self::find('first', ['conditions' => ['correo = ?', $correo]]);
    }

    public static function autenticar($correo, $contrasena) {
        $usuario = self::verificarCorreo($correo);
        if ($usuario && password_verify($contrasena, $usuario->contrasena)) {
            return $usuario;
        }
        return null;
    }

    public function esPersona() {
        return $this->tipo_usuario === 'persona';
    }

    public function esEmpresa() {
        return $this->tipo_usuario === 'empresa';
    }
}
?>