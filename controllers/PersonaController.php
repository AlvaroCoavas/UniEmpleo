<?php
require_once '../models/Persona.php';

class PersonaController {
    public function register($data) {
        $persona = new Persona($data);

        if ($persona->save()) {
            return true; // Registro exitoso
        } else {
            return $persona->errors->full_messages(); // Devuelve los errores
        }
    }
}
?>