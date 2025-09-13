export function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) {
    return `$${min.toLocaleString()}-${max.toLocaleString()}`;
  } else if (min) {
    return `>=$${min.toLocaleString()}`;
  } else if (max) {
    return `<=$${max.toLocaleString()}`;
  }
  return '';
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}