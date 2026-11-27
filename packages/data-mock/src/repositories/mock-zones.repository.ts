import { COCHABAMBA_ZONES, type IZonesRepository } from '@patacerca/core';

export class MockZonesRepository implements IZonesRepository {
  async getActiveZones(): Promise<string[]> {
    return [...COCHABAMBA_ZONES];
  }
}
