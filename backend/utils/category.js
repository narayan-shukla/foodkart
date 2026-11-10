export function validateCategoryName(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 40 || !/^[\p{L}\p{N}& -]+$/u.test(name)) return null;
  return name;
}
