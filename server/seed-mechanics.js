import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { query } from './db.js';

const DEFAULT_MECHANICS = [
  { nombre: 'Mecánico 1', pin: '1111' },
  { nombre: 'Mecánico 2', pin: '2222' },
  { nombre: 'Mecánico 3', pin: '3333' }
];

export async function ensureDefaultMechanics() {
  for (const mechanic of DEFAULT_MECHANICS) {
    const { rows } = await query(
      "select id from usuarios where rol='mecanico' and lower(nombre)=lower($1) limit 1",
      [mechanic.nombre]
    );
    if (rows[0]) continue;

    const id = crypto.randomUUID();
    const pinHash = await bcrypt.hash(mechanic.pin, 12);
    await query(
      `insert into usuarios(id,nombre,apellido,email,rol,activo,pin_hash,pin_enabled)
       values($1,$2,null,$3,'mecanico',1,$4,1)`,
      [id, mechanic.nombre, `${id}@local.invalid`, pinHash]
    );
  }
}
