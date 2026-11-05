import { Owner } from '@patacerca/core';

/** Dueños de demo (teléfonos alineados con INITIAL_REQUESTS para paseador w1). */
export const INITIAL_OWNERS: Owner[] = [
  {
    phone: '70000001',
    name: 'Daniela Quiroga',
    zone: 'Queru Queru',
    dogName: 'Toby',
    dogSize: 'medium',
    pets: [{ id: 'p1', name: 'Toby', size: 'medium', breed: 'Mestizo' }],
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    phone: '70000002',
    name: 'Jorge Salinas',
    zone: 'Cala Cala',
    dogName: 'Rocco',
    dogSize: 'large',
    pets: [{ id: 'p2', name: 'Rocco', size: 'large', breed: 'Labrador' }],
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    phone: '70000003',
    name: 'Paola Montaño',
    zone: 'Recoleta',
    dogName: 'Luna',
    dogSize: 'small',
    pets: [{ id: 'p3', name: 'Luna', size: 'small', breed: 'Poodle' }],
    createdAt: Date.now() - 86400000 * 15,
  },
];
