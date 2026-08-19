import 'package:flutter/material.dart';

import '../models/management.dart';
import '../models/property.dart';
import '../services/management_service.dart';
import '../services/properties_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

const _statuses = <String, String>{
  'ACTIVE': 'Actif',
  'EXPIRED': 'Expiré',
  'TERMINATED': 'Résilié',
  'PENDING': 'En attente',
};

class ManageContractsScreen extends StatefulWidget {
  const ManageContractsScreen({super.key});

  @override
  State<ManageContractsScreen> createState() => _ManageContractsScreenState();
}

class _ManageContractsScreenState extends State<ManageContractsScreen> {
  List<ContractModel> _items = const [];
  List<TenantModel> _tenants = const [];
  List<Property> _properties = const [];
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
      final contracts =
          await ManagementService.instance.fetchContractModels();
      final tenants = await ManagementService.instance.fetchTenants();
      final props = await PropertiesService.instance.fetchProperties();
      if (mounted) {
        setState(() {
          _items = contracts;
          _tenants = tenants;
          _properties = props.items;
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

  Future<void> _create() async {
    if (_tenants.isEmpty) {
      _showError('Créez d\'abord un locataire.');
      return;
    }
    if (_properties.isEmpty) {
      _showError('Créez d\'abord un bien.');
      return;
    }
    final rentController = TextEditingController();
    final depositController = TextEditingController();
    String tenantId = _tenants.first.id;
    String propertyId = _properties.first.id;
    String status = 'ACTIVE';
    DateTime startDate = DateTime.now();
    DateTime endDate = DateTime.now().add(const Duration(days: 365));

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Nouveau contrat'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  initialValue: tenantId,
                  decoration: const InputDecoration(labelText: 'Locataire *'),
                  items: _tenants
                      .map(
                        (t) => DropdownMenuItem(
                          value: t.id,
                          child: Text(t.name),
                        ),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setDialogState(() => tenantId = v ?? tenantId),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: propertyId,
                  decoration: const InputDecoration(labelText: 'Bien *'),
                  items: _properties
                      .map(
                        (p) => DropdownMenuItem(
                          value: p.id,
                          child: Text('${p.name} — ${p.formattedPrice}'),
                        ),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setDialogState(() => propertyId = v ?? propertyId),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: rentController,
                  decoration:
                      const InputDecoration(labelText: 'Loyer (FCFA) *'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: depositController,
                  decoration:
                      const InputDecoration(labelText: 'Caution (FCFA)'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _dateField(
                        context,
                        'Début *',
                        startDate,
                        (d) => setDialogState(() => startDate = d),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _dateField(
                        context,
                        'Fin *',
                        endDate,
                        (d) => setDialogState(() => endDate = d),
                      ),
                    ),
                  ],
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
              child: const Text('Créer'),
            ),
          ],
        ),
      ),
    );
    if (ok != true) return;
    final rent = double.tryParse(rentController.text.trim()) ?? 0;
    if (rent <= 0) {
      _showError('Le loyer est requis.');
      return;
    }
    try {
      await ManagementService.instance.createContract({
        'tenantId': tenantId,
        'propertyId': propertyId,
        'rentAmount': rent,
        'deposit': double.tryParse(depositController.text.trim()) ?? 0,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
        'status': status,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Contrat créé.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Widget _dateField(
    BuildContext context,
    String label,
    DateTime value,
    ValueChanged<DateTime> onChanged,
  ) {
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: value,
          firstDate: DateTime(2020),
          lastDate: DateTime(2100),
        );
        if (picked != null) onChanged(picked);
      },
      child: InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Text(
          '${value.day.toString().padLeft(2, '0')}/'
          '${value.month.toString().padLeft(2, '0')}/${value.year}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Future<void> _delete(ContractModel contract) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le contrat'),
        content: Text('Supprimer « ${contract.reference} » ?'),
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
      await ManagementService.instance.deleteContract(contract.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Contrat supprimé.')),
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
        title: const Text('Contrats'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _create,
        icon: const Icon(Icons.add),
        label: const Text('Contrat'),
      ),
      body: _buildBody(theme),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_loading) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SkeletonBox(height: 80),
          SizedBox(height: 12),
          SkeletonBox(height: 80),
          SizedBox(height: 12),
          SkeletonBox(height: 80),
        ],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    if (_items.isEmpty) {
      return const EmptyState(
        title: 'Aucun contrat',
        message: 'Créez un contrat pour lier un locataire à un bien.',
        icon: Icons.description_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final c = _items[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: kPrimary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.description_outlined, color: kPrimary),
              ),
              title: Text(
                c.reference,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                '${c.tenantName ?? '—'} · ${c.propertyName ?? '—'}\n'
                '${formatFcfa(c.rentAmount)}/mois · '
                '${_statuses[c.status] ?? c.status}',
                style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
              ),
              trailing: IconButton(
                onPressed: () => _delete(c),
                icon: const Icon(Icons.delete_outline, color: kDanger),
                tooltip: 'Supprimer',
              ),
            ),
          );
        },
      ),
    );
  }
}