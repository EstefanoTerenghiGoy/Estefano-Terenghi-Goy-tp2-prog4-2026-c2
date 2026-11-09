import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalService } from './core/services/modal.service';
import { ModalError } from './shared/components/modal-error/modal-error';

@Component({
  imports: [RouterOutlet, ModalError],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  modalService = inject(ModalService);
}
