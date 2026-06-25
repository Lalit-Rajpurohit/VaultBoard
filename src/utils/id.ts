import { customAlphabet } from 'nanoid/non-secure';

// URL-safe, collision-resistant short IDs. `non-secure` avoids needing native
// crypto in Expo Go while remaining more than adequate for local row keys.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nano = customAlphabet(alphabet, 16);

export function createId(prefix = ''): string {
  return prefix ? `${prefix}_${nano()}` : nano();
}
