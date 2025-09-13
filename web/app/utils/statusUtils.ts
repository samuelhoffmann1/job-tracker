export function getStatusColor(status: string | undefined): string {
  if (!status) return 'text-gray-400';

  status = status.toLowerCase();

  if (status === 'applied') return 'text-blue-400';
  if (status === 'interview') return 'text-purple-400';
  if (status === 'offer') return 'text-green-400';
  if (status === 'rejected') return 'text-red-400';
  if (status === 'accepted') return 'text-green-500';
  return 'text-gray-300';
}