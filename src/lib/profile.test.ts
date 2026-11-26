import { describe, expect, it } from 'vitest';
import { basalMetabolism, bmi, DEFAULT_PROFILE, targetCalories, upsertWeight, type Profile } from './profile';

const homme: Profile = { ...DEFAULT_PROFILE, sex: 'homme', age: 30, heightCm: 180, weightKg: 80, activity: 'modere' };

describe('profil', () => {
  it('calcule le métabolisme de base (Mifflin-St Jeor)', () => {
    expect(basalMetabolism(homme)).toBe(1780); // 800 + 1125 - 150 + 5
    expect(basalMetabolism({ ...homme, sex: 'femme' })).toBe(1614);
  });

  it('adapte les calories à l’objectif', () => {
    const eq = targetCalories(homme, 'equilibre');
    expect(eq).toBe(2750); // 1780 × 1,55 = 2759 → 2750
    expect(targetCalories(homme, 'perte')).toBe(2250);
    expect(targetCalories(homme, 'masse')).toBe(3100);
  });

  it('ne descend jamais sous le minimum de sécurité', () => {
    const petite: Profile = { ...DEFAULT_PROFILE, age: 70, heightCm: 150, weightKg: 45, activity: 'sedentaire' };
    expect(targetCalories(petite, 'perte')).toBeGreaterThanOrEqual(1200);
  });

  it('calcule l’IMC', () => {
    expect(bmi(homme)).toBeCloseTo(24.7, 1);
  });

  it('remplace la pesée d’une même date et trie', () => {
    const list = upsertWeight(
      [
        { date: '2026-11-20', kg: 80 },
        { date: '2026-11-10', kg: 81 },
      ],
      { date: '2026-11-20', kg: 79.5 },
    );
    expect(list).toEqual([
      { date: '2026-11-10', kg: 81 },
      { date: '2026-11-20', kg: 79.5 },
    ]);
  });
});
