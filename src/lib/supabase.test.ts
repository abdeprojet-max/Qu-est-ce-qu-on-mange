import { describe, expect, it } from 'vitest';
import { normalizeSupabaseUrl } from './supabase';

describe('normalizeSupabaseUrl', () => {
  it('ne garde que l’origine', () => {
    for (const raw of [
      'https://abcd.supabase.co',
      'https://abcd.supabase.co/',
      'https://abcd.supabase.co/rest/v1/',
      'https://abcd.supabase.co/auth/v1',
      '  https://abcd.supabase.co/rest/v1  ',
      '"https://abcd.supabase.co"',
      'abcd.supabase.co',
    ]) {
      expect(normalizeSupabaseUrl(raw)).toBe('https://abcd.supabase.co');
    }
  });

  it('renvoie null si vide', () => {
    expect(normalizeSupabaseUrl(undefined)).toBeNull();
    expect(normalizeSupabaseUrl('  ')).toBeNull();
  });
});
