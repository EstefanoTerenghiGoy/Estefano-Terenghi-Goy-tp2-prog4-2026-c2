import { ValidatorFn } from '@angular/forms';

export function hoy(): string {
  return new Date().toLocaleDateString('en-CA');
}

export const passwordValida: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  const cumple = valor.length >= 8 && /[A-Z]/.test(valor) && /\d/.test(valor);
  return cumple ? null : { passwordDebil: true };
};

export const passwordsIguales: ValidatorFn = (grupo) => {
  const igual = grupo.get('password')?.value === grupo.get('repetirPassword')?.value;
  return igual ? null : { noCoinciden: true };
};

export const fechaNoFutura: ValidatorFn = (control) => {
  return control.value && control.value > hoy() ? { fechaFutura: true } : null;
};
