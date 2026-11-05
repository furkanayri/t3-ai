export default function object<T>(obj: any): T[] {
  return !!obj && !Array.isArray(obj) && !(obj instanceof Date) ? obj : {};
}
