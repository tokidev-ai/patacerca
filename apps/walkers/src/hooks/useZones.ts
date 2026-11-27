import { useQuery } from '@tanstack/react-query';
import { COCHABAMBA_ZONES } from '@patacerca/core';
import { useWalkerData } from '../providers/DataProvider';

/** Zonas activas definidas en el panel admin (con la lista por defecto mientras carga). */
export function useZones(): string[] {
  const { zonesRepository } = useWalkerData();
  const { data } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesRepository.getActiveZones(),
    staleTime: 5 * 60 * 1000,
  });
  return data ?? [...COCHABAMBA_ZONES];
}
