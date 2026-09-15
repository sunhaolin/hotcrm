// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { zhCN } from '../translations/zh-CN';

/**
 * Demo branch (epic #2): the zh-CN words for a screen-flow select that mirrors
 * an object picklist.
 *
 * Screen copy is authored in Chinese on this branch because a locale pack
 * cannot reach a flow dialog on 17.4.0 — `lead-conversion.flow.ts` (above
 * `warn_duplicate`) carries the measurement. A select that offers an object
 * field's values takes its words FROM the zh-CN pack rather than retyping them,
 * so the dialog and the record page cannot name one value two ways.
 *
 * ⛔ Throws on a value the pack does not label: a silent fallback would put the
 * raw stored value (`waiting_customer`) in front of the user.
 */
export function zhOptions(
  objectName: string,
  fieldName: string,
  values: readonly string[],
): { label: string; value: string }[] {
  const labels = (zhCN.objects?.[objectName]?.fields?.[fieldName]?.options ?? {}) as Record<string, string>;
  return values.map((value) => {
    const label = labels[value];
    if (!label) throw new Error(`zh-CN has no option label for ${objectName}.${fieldName} = "${value}"`);
    return { label, value };
  });
}
