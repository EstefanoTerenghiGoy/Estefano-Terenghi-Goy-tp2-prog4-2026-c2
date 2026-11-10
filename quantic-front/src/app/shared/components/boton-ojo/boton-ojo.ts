import { Component, input, output } from '@angular/core';

// Ojito para mostrar u ocultar una contraseña. No cambia nada por sí mismo:
// avisa con "alternar" y quien lo usa decide el type del input
@Component({
  selector: 'app-boton-ojo',
  templateUrl: './boton-ojo.html',
  styleUrl: './boton-ojo.css',
})
export class BotonOjo {
  visible = input(false);
  alternar = output<void>();
}
