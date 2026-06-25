// SDK 54 introduced a new File/Directory API; the classic functions used here
// live under the /legacy entry point.
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import { createId } from '@/utils/id';

const DIR = `${FileSystem.documentDirectory}attachments/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

/**
 * Prompt the user to pick an image, copy it into app storage (so it survives
 * even if the source is cleared) and return the local URI. Null if cancelled.
 */
export async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled || !result.assets.length) return null;

  await ensureDir();
  const src = result.assets[0].uri;
  const ext = src.split('.').pop()?.split('?')[0] ?? 'jpg';
  const dest = `${DIR}${createId('img')}.${ext}`;
  await FileSystem.copyAsync({ from: src, to: dest });
  return dest;
}

export async function deleteAttachment(uri: string): Promise<void> {
  try {
    if (uri.startsWith(DIR)) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // best-effort cleanup
  }
}
