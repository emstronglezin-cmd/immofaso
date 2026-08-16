import 'package:flutter/material.dart';

import '../models/property.dart';

class PropertyCard extends StatelessWidget {
  const PropertyCard({super.key, required this.property, this.onTap});

  final Property property;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _cover(context),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          property.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      _badge(theme, property.statusLabel),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (property.city != null)
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            property.city!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        property.formattedPrice,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      if (property.rooms != null)
                        _stat(theme, Icons.king_bed_outlined, '${property.rooms}'),
                      if (property.bathrooms != null) ...[
                        const SizedBox(width: 12),
                        _stat(theme, Icons.bathtub_outlined, '${property.bathrooms}'),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _cover(BuildContext context) {
    if (property.images.isEmpty) {
      return Container(
        height: 140,
        color: Theme.of(context).colorScheme.primaryContainer,
        child: Icon(
          Icons.home_work_outlined,
          size: 48,
          color: Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      );
    }
    return SizedBox(
      height: 140,
      child: Image.network(
        property.images.first,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _coverFallback(context),
      ),
    );
  }

  Widget _coverFallback(BuildContext context) {
    return Container(
      height: 140,
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Icon(
        Icons.home_work_outlined,
        size: 48,
        color: Theme.of(context).colorScheme.onPrimaryContainer,
      ),
    );
  }

  Widget _badge(ThemeData theme, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSecondaryContainer,
        ),
      ),
    );
  }

  Widget _stat(ThemeData theme, IconData icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.onSurfaceVariant),
        const SizedBox(width: 3),
        Text(value, style: theme.textTheme.bodySmall),
      ],
    );
  }
}