import 'package:flutter/material.dart';

import '../models/property.dart';
import '../services/properties_service.dart';
import '../theme.dart';
import '../widgets/property_card.dart';
import '../widgets/state_widgets.dart';
import 'property_detail_screen.dart';

const _propertyTypes = <String, String>{
  '': 'Tous les types',
  'APARTMENT': 'Appartement',
  'HOUSE': 'Maison',
  'OFFICE': 'Bureau',
  'COMMERCIAL': 'Local commercial',
  'LAND': 'Terrain',
  'OTHER': 'Autre',
};

class PropertiesScreen extends StatefulWidget {
  const PropertiesScreen({super.key});

  @override
  State<PropertiesScreen> createState() => _PropertiesScreenState();
}

class _PropertiesScreenState extends State<PropertiesScreen> {
  final _searchController = TextEditingController();
  List<Property>? _items;
  String? _error;
  bool _loading = true;
  String _type = '';
  String _city = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final search = _searchController.text.trim();
      final query = <String, String>{
        if (search.isNotEmpty) 'search': search,
        if (_type.isNotEmpty) 'type': _type,
        if (_city.isNotEmpty) 'city': _city,
      };
      final result = await PropertiesService.instance.fetchProperties(
        query: query,
      );
      if (mounted) {
        setState(() {
          _items = result.items;
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

  Future<void> _refresh() => _load();

  void _resetFilters() {
    _searchController.clear();
    setState(() {
      _type = '';
      _city = '';
    });
    _load();
  }

  bool get _hasFilters => _type.isNotEmpty || _city.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nos biens'),
        actions: [
          IconButton(
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onSubmitted: (_) => _load(),
              decoration: InputDecoration(
                hintText: 'Rechercher un bien ou une ville',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();
                          _load();
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
            child: Row(
              children: [
                Expanded(
                  child: _filterDropdown(
                    theme,
                    value: _type,
                    icon: Icons.apartment,
                    label: _propertyTypes[_type]!,
                    entries: _propertyTypes.entries.toList(),
                    onChanged: (v) {
                      setState(() => _type = v);
                      _load();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _filterDropdown(
                    theme,
                    value: _city,
                    icon: Icons.location_city_outlined,
                    label: _city.isEmpty ? 'Ville' : _city,
                    entries: const [
                      MapEntry('', 'Toutes les villes'),
                      MapEntry('Ouagadougou', 'Ouagadougou'),
                      MapEntry('Bobo-Dioulasso', 'Bobo-Dioulasso'),
                      MapEntry('Koudougou', 'Koudougou'),
                      MapEntry('Banfora', 'Banfora'),
                    ],
                    onChanged: (v) {
                      setState(() => _city = v);
                      _load();
                    },
                  ),
                ),
              ],
            ),
          ),
          if (_hasFilters)
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
                child: TextButton.icon(
                  onPressed: _resetFilters,
                  icon: const Icon(Icons.filter_alt_off, size: 18),
                  label: const Text('Réinitialiser'),
                ),
              ),
            ),
          Expanded(child: _buildBody(theme)),
        ],
      ),
    );
  }

  Widget _filterDropdown(
    ThemeData theme, {
    required String value,
    required IconData icon,
    required String label,
    required List<MapEntry<String, String>> entries,
    required ValueChanged<String> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      key: ValueKey('$label-$value'),
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(
        prefixIcon: Icon(icon, size: 20, color: kPrimary),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
      items: entries
          .map(
            (e) => DropdownMenuItem(
              value: e.key,
              child: Text(
                e.value,
                style: theme.textTheme.bodyMedium,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_loading) {
      return ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: 4,
        itemBuilder: (_, index) => const Padding(
          padding: EdgeInsets.only(bottom: 12),
          child: SkeletonCard(),
        ),
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _refresh);
    }
    final items = _items ?? const <Property>[];
    if (items.isEmpty) {
      return EmptyState(
        title: 'Aucun bien trouvé',
        message: _hasFilters
            ? 'Aucun bien ne correspond à vos filtres.'
            : 'De nouveaux biens arrivent bientôt.',
        icon: _hasFilters
            ? Icons.filter_alt_off_outlined
            : Icons.home_work_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final property = items[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: PropertyCard(
              property: property,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) =>
                        PropertyDetailScreen(propertyId: property.id),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}