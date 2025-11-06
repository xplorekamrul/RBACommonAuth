
export type OkData<T extends object = {}> = T & { ok: true };

export function hasOkData<T extends object = {}>(
  res: { data?: unknown } | null | undefined
): res is { data: OkData<T> } {
  return Boolean(res && (res as any).data && (res as any).data.ok === true);
}
