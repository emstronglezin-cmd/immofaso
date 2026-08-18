import 'package:flutter/material.dart';

import '../models/management.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

class ManageTenantsScreen extends StatefulWidget {
  const ManageTenantsScreen({super.key});

  @override
  State<ManageTenantsScreen> createState() => _ManageTenantsScreenState();
}

class _ManageTenantsScreenState extends State<ManageTenantsScreen> {
  List<TenantModel> _items = const [];
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
      final items = await ManagementService.instance.fetchTenants();
      if (mounted) {
        setState(() {
          _items = items;
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
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final emailController = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouveau locataire'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Nom *'),
              autofocus: true,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(labelText: 'Téléphone'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
          ],
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
    );
    if (ok != true) return;
    final name = nameController.text.trim();
    if (name.isEmpty) {
      _showError('Le nom est requis.');
      return;
    }
    try {
      await ManagementService.instance.createTenant({
        'name': name,
        if (phoneController.text.trim().isNotEmpty)
          'phone': phoneController.text.trim(),
        if (emailController.text.trim().isNotEmpty)
          'email': emailController.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Locataire créé.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _delete(TenantModel tenant) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le locataire'),
        content: Text('Supprimer « ${tenant.name} » ?'),
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
      await ManagementService.instance.deleteTenant(tenant.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Locataire supprimé.')),
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
        title: const Text('Locataires'),
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
        label: const Text('Locataire'),
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
        title: 'Aucun locataire',
        message: 'Ajoutez un locataire.',
        icon: Icons.people_outline,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final t = _items[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: CircleAvatar(
                backgroundColor: kPrimary.withValues(alpha: 0.12),
                foregroundColor: kPrimary,
                child: const Icon(Icons.person_outline),
              ),
              title: Text(
                t.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                [t.phone, t.email].where((e) => e != null && e.isNotEmpty).join(' · '),
                style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
              ),
              trailing: IconButton(
                onPressed: () => _delete(t),
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