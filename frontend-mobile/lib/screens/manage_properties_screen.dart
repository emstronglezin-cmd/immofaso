import 'package:flutter/material.dart';

import '../models/property.dart';
import '../services/management_service.dart';
import '../services/properties_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

const _types = <String, String>{
  'APARTMENT': 'Appartement',
  'HOUSE': 'Maison',
  'OFFICE': 'Bureau',
  'COMMERCIAL': 'Boutique',
  'LAND': 'Terrain',
  'OTHER': 'Autre',
};

const _statuses = <String, String>{
  'AVAILABLE': 'Disponible',
  'RENTED': 'Loué',
  'RESERVED': 'Réservé',
  'UNDER_MAINTENANCE': 'En maintenance',
  'SOLD': 'Vendu',
};

class ManagePropertiesScreen extends StatefulWidget {
  const ManagePropertiesScreen({super.key});

  @override
  State<ManagePropertiesScreen> createState() =>
      _ManagePropertiesScreenState();
}

class _ManagePropertiesScreenState extends State<ManagePropertiesScreen> {
  List<Property> _items = const [];
  bool _loading = true;
  String? _error;

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
      final result = await PropertiesService.instance.fetchProperties();
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

  Future<void> _edit(Property? property) async {
    final nameController =
        TextEditingController(text: property?.name ?? '');
    final priceController = TextEditingController(
      text: property?.price != null
          ? property!.price.round().toString()
          : '',
    );
    final cityController = TextEditingController(text: property?.city ?? '');
    String type = property?.type ?? 'APARTMENT';
    String status = property?.status ?? 'AVAILABLE';

    final save = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(property == null ? 'Nouveau bien' : 'Modifier le bien'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Nom *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: priceController,
                  decoration: const InputDecoration(
                    labelText: 'Prix (FCFA) *',
                    prefixText: ' ',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: cityController,
                  decoration: const InputDecoration(labelText: 'Ville'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: type,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: _types.entries
                      .map(
                        (e) => DropdownMenuItem(
                          value: e.key,
                          child: Text(e.value),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setDialogState(() => type = v ?? type),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: status,
                  decoration: const InputDecoration(labelText: 'Statut'),
                  items: _statuses.entries
                      .map(
                        (e) => DropdownMenuItem(
                          value: e.key,
                          child: Text(e.value),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setDialogState(() => status = v ?? status),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Annuler'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
    if (save != true) return;
    final name = nameController.text.trim();
    final price = double.tryParse(priceController.text.trim()) ?? 0;
    if (name.isEmpty || price <= 0) {
      _showError('Nom et prix sont requis.');
      return;
    }
    try {
      final body = <String, dynamic>{
        'name': name,
        'price': price,
        'type': type,
        'status': status,
        if (cityController.text.trim().isNotEmpty)
          'city': cityController.text.trim(),
      };
      if (property == null) {
        await ManagementService.instance.createProperty(body);
      } else {
        await ManagementService.instance.updateProperty(property.id, body);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(property == null ? 'Bien créé.' : 'Bien modifié.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _delete(Property property) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le bien'),
        content: Text('Supprimer « ${property.name} » ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: kDanger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ManagementService.instance.deleteProperty(property.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Bien supprimé.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  void _showError(Object e) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.toString())),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Biens'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _edit(null),
        icon: const Icon(Icons.add),
        label: const Text('Bien'),
      ),
      body: _buildBody(theme),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_loading) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SkeletonCard(),
          SizedBox(height: 12),
          SkeletonCard(),
          SizedBox(height: 12),
          SkeletonCard(),
        ],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    if (_items.isEmpty) {
      return const EmptyState(
        title: 'Aucun bien',
        message: 'Ajoutez votre premier bien.',
        icon: Icons.home_work_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final p = _items[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  gradient: kGrad,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.home_work_outlined,
                    color: Colors.white),
              ),
              title: Text(
                p.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                '${p.typeLabel} · ${p.formattedPrice}',
                style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: () => _edit(p),
                    icon: const Icon(Icons.edit_outlined, color: kPrimary),
                    tooltip: 'Modifier',
                  ),
                  IconButton(
                    onPressed: () => _delete(p),
                    icon: const Icon(Icons.delete_outline, color: kDanger),
                    tooltip: 'Supprimer',
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}