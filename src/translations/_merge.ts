// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectTranslationData } from '@objectstack/spec/system';

/**
 * Overlay one object's translations on another — the PSA demo (epic #2) adds
 * fields, sections, views and an action to objects the base packs already
 * translate, and a locale root composes its `objects` map from ONE entry per
 * object, so the addition is merged here rather than typed into the base file.
 * Maps merge one level down (`fields`, `_sections`, `_views`, `_actions`,
 * `_validations`); scalar keys on the overlay win.
 */
export function mergeObject(base: ObjectTranslationData, over?: Partial<ObjectTranslationData>): ObjectTranslationData {
  if (!over) return base;
  const merged: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const cur = (base as Record<string, unknown>)[k];
    merged[k] = v && typeof v === 'object' && !Array.isArray(v) && cur && typeof cur === 'object' && !Array.isArray(cur)
      ? { ...(cur as Record<string, unknown>), ...(v as Record<string, unknown>) }
      : v;
  }
  return merged as ObjectTranslationData;
}
