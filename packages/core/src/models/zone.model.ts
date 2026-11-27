/** Zona/barrio gestionado desde el panel admin (colección `zones`). */
export interface Zone {
  id: string;
  name: string;
  /** Si es false, no aparece en las apps (los perfiles que ya la tienen la conservan). */
  active: boolean;
  /** Orden de aparición en las listas (menor primero). */
  order: number;
}
