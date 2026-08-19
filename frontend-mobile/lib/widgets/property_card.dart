import 'package:flutter/material.dart';

import '../models/property.dart';
import '../theme.dart';

class PropertyCard extends StatelessWidget {
  const PropertyCard({super.key, required this.property, this.onTap});

  final Property property;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(18),
        boxShadow: boxShadowCard,
        border: Border.all(color: kBorder, width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _cover(context),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            property.name,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: kInk,
                              letterSpacing: -0.01,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _statusBadge(theme, property.status),
                      ],
                    ),
                    const SizedBox(height: 5),
                    if (property.city != null)
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 14,
                            color: kMuted,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              property.city!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: kMuted,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Text(
                          property.formattedPrice,
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: kPrimary,
                            fontWeight: FontWeight.w800,
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
      ),
    );
  }

  Widget _cover(BuildContext context) {
    if (property.images.isEmpty) {
      return Container(
        height: 140,
        decoration: const BoxDecoration(gradient: kGrad),
        child: const Icon(
          Icons.home_work_outlined,
          size: 48,
          color: Colors.white70,
        ),
      );
    }
    return SizedBox(
      height: 140,
      child: Image.network(
        property.images.first,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) => _coverFallback(),
      ),
    );
  }

  Widget _coverFallback() {
    return Container(
      height: 140,
      decoration: const BoxDecoration(gradient: kGrad),
      child: const Icon(
        Icons.home_work_outlined,
        size: 48,
        color: Colors.white70,
      ),
    );
  }

  Widget _statusBadge(ThemeData theme, String status) {
    final isAvailable = status == 'AVAILABLE';
    final color = isAvailable ? kSuccess : kMuted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        property.statusLabel,
        style: theme.textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _stat(ThemeData theme, IconData icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: kMuted),
        const SizedBox(width: 3),
        Text(
          value,
          style: theme.textTheme.bodySmall?.copyWith(
            color: kMuted,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}