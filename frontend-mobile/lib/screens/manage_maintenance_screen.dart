import 'package:flutter/material.dart';

import '../models/management.dart';
import '../models/property.dart';
import '../services/management_service.dart';
import '../services/properties_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

const _priorities = <String, String>{
  'LOW': 'Faible',
  'MEDIUM': 'Moyenne',
  'HIGH': 'Haute',
  'URGENT': 'Urgente',
};

const _statuses = <String, String>{
  'NEW': 'Nouveau',
  'IN_PROGRESS': 'En cours',
  'WAITING': 'En attente',
  'DONE': 'Terminé',
};

class ManageMaintenanceScreen extends StatefulWidget {
  const ManageMaintenanceScreen({super.key});

  @override
  State<ManageMaintenanceScreen> createState() =>
      _ManageMaintenanceScreenState();
}

class _ManageMaintenanceScreenState extends State<ManageMaintenanceScreen> {
  List<MaintenanceTicketModel> _items = const [];
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
      final tickets = await ManagementService.instance.fetchTickets();
      final props = await PropertiesService.instance.fetchProperties();
      if (mounted) {
        setState(() {
          _items = tickets;
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
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String priority = 'MEDIUM';
    String? propertyId;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Nouveau ticket'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'Titre *'),
                  autofocus: true,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descriptionController,
                  decoration:
                      const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: priority,
                  decoration: const InputDecoration(labelText: 'Priorité'),
                  items: _priorities.entries
                      .map(
                        (e) => DropdownMenuItem(
                          value: e.key,
                          child: Text(e.value),
                        ),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setDialogState(() => priority = v ?? priority),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String?>(
                  initialValue: propertyId,
                  decoration: const InputDecoration(labelText: 'Bien'),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('Aucun'),
                    ),
                    ..._properties.map(
                      (p) => DropdownMenuItem<String?>(
                        value: p.id,
                        child: Text(p.name),
                      ),
                    ),
                  ],
                  onChanged: (v) =>
                      setDialogState(() => propertyId = v),
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
    final title = titleController.text.trim();
    if (title.isEmpty) {
      _showError('Le titre est requis.');
      return;
    }
    try {
      await ManagementService.instance.createTicket({
        'title': title,
        'priority': priority,
        if (descriptionController.text.trim().isNotEmpty)
          'description': descriptionController.text.trim(),
        'propertyId': ?propertyId,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ticket créé.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _changeStatus(MaintenanceTicketModel ticket) async {
    final selected = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: Text('Statut de « ${ticket.title} »'),
        children: _statuses.entries
            .map(
              (e) => SimpleDialogOption(
                onPressed: () => Navigator.pop(context, e.key),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Icon(
                        e.key == ticket.status
                            ? Icons.radio_button_checked
                            : Icons.radio_button_off,
                        color: e.key == ticket.status
                            ? kPrimary
                            : kMutedLight,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Text(e.value),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
    if (selected == null || selected == ticket.status) return;
    try {
      await ManagementService.instance.updateTicket(ticket.id, {
        'status': selected,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Statut mis à jour.')),
        );
      }
      _load();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _delete(MaintenanceTicketModel ticket) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le ticket'),
        content: Text('Supprimer « ${ticket.title} » ?'),
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
      await ManagementService.instance.deleteTicket(ticket.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ticket supprimé.')),
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

  Color _priorityColor(String priority) {
    switch (priority) {
      case 'URGENT':
        return kDanger;
      case 'HIGH':
        return const Color(0xFFEA580C);
      case 'MEDIUM':
        return kAccentGold;
      default:
        return kSuccess;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maintenance'),
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
        label: const Text('Ticket'),
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
        title: 'Aucun ticket',
        message: 'Créez un ticket de maintenance.',
        icon: Icons.build_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final t = _items[index];
          final priorityColor = _priorityColor(t.priority);
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(Icons.build_outlined, color: priorityColor),
              ),
              title: Text(
                t.title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                '${_priorities[t.priority] ?? t.priority} · '
                '${t.propertyName ?? '—'}\n'
                '${_statuses[t.status] ?? t.status}',
                style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: () => _changeStatus(t),
                    icon: const Icon(Icons.swap_vert, color: kPrimary),
                    tooltip: 'Changer le statut',
                  ),
                  IconButton(
                    onPressed: () => _delete(t),
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