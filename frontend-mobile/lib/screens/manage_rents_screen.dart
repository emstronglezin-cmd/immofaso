import 'package:flutter/material.dart';

import '../models/management.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

class ManageRentsScreen extends StatefulWidget {
  const ManageRentsScreen({super.key});

  @override
  State<ManageRentsScreen> createState() => _ManageRentsScreenState();
}

class _ManageRentsScreenState extends State<ManageRentsScreen>
    with SingleTickerProviderStateMixin {
  List<RentModel> _all = const [];
  List<ContractModel> _contracts = const [];
  bool _loading = true;
  String? _error;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final rents = await ManagementService.instance.fetchRents();
      final contracts = await ManagementService.instance.fetchContractModels();
      if (mounted) {
        setState(() {
          _all = rents;
          _contracts = contracts;
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

  List<RentModel> get _pending =>
      _all.where((r) => r.status == 'PENDING').toList();
  List<RentModel> get _paid =>
      _all.where((r) => r.status == 'PAID').toList();
  List<RentModel> get _overdue =>
      _all.where((r) => r.status == 'OVERDUE').toList();

  Future<void> _generateRents() async {
    if (_contracts.isEmpty) {
      _showError('Aucun contrat actif trouvé.');
      return;
    }
    ContractModel selectedContract = _contracts.first;
    DateTime dueDate = DateTime.now();

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Générer un loyer'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: selectedContract.id,
                decoration: const InputDecoration(labelText: 'Contrat'),
                items: _contracts
                    .map(
                      (c) => DropdownMenuItem(
                        value: c.id,
                        child: Text(
                          '${c.tenantName ?? '—'} · ${c.propertyName ?? '—'}',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) {
                  if (v != null) {
                    setDialogState(() {
                      selectedContract =
                          _contracts.firstWhere((c) => c.id == v);
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: dueDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2100),
                  );
                  if (picked != null) {
                    setDialogState(() => dueDate = picked);
                  }
                },
                child: InputDecorator(
                  decoration:
                      const InputDecoration(labelText: 'Date d\'échéance'),
                  child: Text(
                    '${dueDate.day.toString().padLeft(2, '0')}/'
                    '${dueDate.month.toString().padLeft(2, '0')}/${dueDate.year}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Montant : ${formatFcfa(selectedContract.rentAmount)}',
                style: const TextStyle(
                    fontWeight: FontWeight.w700, color: kPrimary),
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
              child: const Text('Générer'),
            ),
          ],
        ),
      ),
    );
    if (ok != true) return;
    try {
      await ManagementService.instance.createRent({
        'contractId': selectedContract.id,
        'amount': selectedContract.rentAmount,
        'dueDate': dueDate.toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Loyer généré avec succès.')),
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
        title: const Text('Loyers'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('En attente'),
                  if (!_loading && _pending.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _countBadge(_pending.length, kAccentGold),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Payés'),
                  if (!_loading && _paid.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _countBadge(_paid.length, kSuccess),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Impayés'),
                  if (!_loading && _overdue.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _countBadge(_overdue.length, kDanger),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _generateRents,
        icon: const Icon(Icons.add),
        label: const Text('Générer loyer'),
      ),
      body: _buildBody(theme),
    );
  }

  Widget _countBadge(int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        '$count',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
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
    return TabBarView(
      controller: _tabController,
      children: [
        _rentList(theme, _pending, kAccentGold, 'En attente', Icons.hourglass_empty),
        _rentList(theme, _paid, kSuccess, 'Payés', Icons.check_circle_outline),
        _rentList(theme, _overdue, kDanger, 'Impayés', Icons.warning_amber_outlined),
      ],
    );
  }

  Widget _rentList(ThemeData theme, List<RentModel> rents, Color accentColor,
      String emptyLabel, IconData emptyIcon) {
    if (rents.isEmpty) {
      return EmptyState(
        title: 'Aucun loyer $emptyLabel',
        message: 'Les loyers $emptyLabel apparaîtront ici.',
        icon: emptyIcon,
      );
    }
    final total = rents.fold<double>(0, (s, r) => s + r.amount);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: accentColor.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(emptyIcon, color: accentColor, size: 28),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${rents.length} loyer${rents.length > 1 ? 's' : ''}',
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: accentColor),
                    ),
                    Text(
                      formatFcfa(total),
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: accentColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...rents.map((r) => _rentCard(theme, r, accentColor)),
        ],
      ),
    );
  }

  Widget _rentCard(ThemeData theme, RentModel rent, Color accentColor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: accentColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(Icons.home_work_outlined, color: accentColor),
        ),
        title: Text(
          formatFcfa(rent.amount),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: accentColor,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${rent.tenantName ?? '—'} · ${rent.propertyName ?? '—'}',
              style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
            ),
            if (rent.dueDate.isNotEmpty)
              Text(
                'Échéance : ${rent.dueDate.length >= 10 ? rent.dueDate.substring(0, 10) : rent.dueDate}',
                style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
              ),
            if (rent.paidAmount > 0)
              Text(
                'Payé : ${formatFcfa(rent.paidAmount)}',
                style: theme.textTheme.bodySmall?.copyWith(color: kSuccess),
              ),
          ],
        ),
      ),
    );
  }
}
