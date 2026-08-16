export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
}

export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: 'Appartement',
    HOUSE: 'Maison',
    OFFICE: 'Bureau',
    COMMERCIAL: 'Local commercial',
    LAND: 'Terrain',
    OTHER: 'Autre',
  };
  return labels[type] || type;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    RENTED: 'Loué',
    UNDER_MAINTENANCE: 'En maintenance',
    SOLD: 'Vendu',
  };
  return labels[status] || status;
}