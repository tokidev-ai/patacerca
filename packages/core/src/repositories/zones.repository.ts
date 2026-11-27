export interface IZonesRepository {
  /**
   * Nombres de las zonas activas, en orden. Si la colección está vacía o falla la
   * conexión, devuelve la lista por defecto (`COCHABAMBA_ZONES`).
   */
  getActiveZones(): Promise<string[]>;
}
