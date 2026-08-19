import 'package:flutter/material.dart';

import '../models/property.dart';
import '../services/properties_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

class PropertyDetailScreen extends StatefulWidget {
  const PropertyDetailScreen({super.key, required this.propertyId});

  final String propertyId;

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  Property? _property;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final property =
          await PropertiesService.instance.fetchProperty(widget.propertyId);
      if (mounted) {
        setState(() {
          _property = property;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Détail du bien')),
      body: _loading
          ? const _DetailSkeleton()
          : _error != null
              ? ErrorState(message: _error!, onRetry: _load)
              : _buildContent(theme),
    );
  }

  Widget _buildContent(ThemeData theme) {
    final property = _property!;
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _cover(theme, property),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        property.name,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: kInk,
                          letterSpacing: -0.02,
                        ),
                      ),
                    ),
                    _statusBadge(theme, property),
                  ],
                ),
                const SizedBox(height: 6),
                if (property.city != null)
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: kMuted),
                      const SizedBox(width: 4),
                      Text(
                        property.city!,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: kMuted,
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 14),
                Text(
                  property.formattedPrice,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: kPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _chip(theme, Icons.apartment, property.typeLabel),
                    if (property.rooms != null)
                      _chip(theme, Icons.king_bed_outlined, '${property.rooms} chambre(s)'),
                    if (property.bathrooms != null)
                      _chip(theme, Icons.bathtub_outlined, '${property.bathrooms} salle(s) de bain'),
                    if (property.area != null)
                      _chip(theme, Icons.straighten, '${property.area!.toStringAsFixed(0)} m²'),
                  ],
                ),
                if (property.description != null) ...[
                  const SizedBox(height: 22),
                  Text(
                    'Description',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    property.description!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: kMuted,
                      height: 1.5,
                    ),
                  ),
                ],
                if (property.address != null) ...[
                  const SizedBox(height: 18),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_city_outlined, size: 18, color: kPrimary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Adresse : ${property.address}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: kMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                if (property.ownerName != null) ...[
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      const Icon(Icons.person_outline, size: 18, color: kPrimary),
                      const SizedBox(width: 6),
                      Text(
                        'Propriétaire : ${property.ownerName}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: kMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _cover(ThemeData theme, Property property) {
    if (property.images.isEmpty) {
      return Container(
        height: 240,
        decoration: const BoxDecoration(gradient: kGradDeep),
        child: const Icon(
          Icons.home_work_outlined,
          size: 80,
          color: Colors.white70,
        ),
      );
    }
    return SizedBox(
      height: 240,
      child: Image.network(
        property.images.first,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) => Container(
          height: 240,
          decoration: const BoxDecoration(gradient: kGradDeep),
          child: const Icon(
            Icons.home_work_outlined,
            size: 80,
            color: Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _statusBadge(ThemeData theme, Property property) {
    final isAvailable = property.status == 'AVAILABLE';
    final color = isAvailable ? kSuccess : kMuted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        property.statusLabel,
        style: theme.textTheme.labelMedium?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _chip(ThemeData theme, IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: kMuted),
          const SizedBox(width: 5),
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: kMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailSkeleton extends StatelessWidget {
  const _DetailSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(bottom: 32),
      children: const [
        SkeletonBox(height: 240, radius: 0),
        Padding(
          padding: EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonBox(height: 26, width: 220),
              SizedBox(height: 10),
              SkeletonBox(height: 14, width: 140),
              SizedBox(height: 18),
              SkeletonBox(height: 30, width: 180),
              SizedBox(height: 18),
              SkeletonBox(height: 30, width: double.infinity),
              SizedBox(height: 16),
              SkeletonBox(height: 90, width: double.infinity),
            ],
          ),
        ),
      ],
    );
  }
}