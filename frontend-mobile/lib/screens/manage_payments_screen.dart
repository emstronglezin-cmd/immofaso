import 'package:flutter/material.dart';

import '../models/management.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

const _methods = <String, String>{
  'CASH': 'Espèces',
  'MOBILE_MONEY': 'Mobile Money',
  'BANK_TRANSFER': 'Virement',
  'OTHER': 'Autre',
};

class ManagePaymentsScreen extends StatefulWidget {
  const ManagePaymentsScreen({super.key});

  @override
  State<ManagePaymentsScreen> createState() => _ManagePaymentsScreenState();
}

class _ManagePaymentsScreenState extends State<ManagePaymentsScreen> {
  List<PaymentModel> _items = const [];
  List<dynamic> _contracts = const [];
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
      final payments =
          await ManagementService.instance.fetchPayments();
      final contracts = await ManagementService.instance.fetchContracts();
      if (mounted) {
        setState(() {
          _items = payments;
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

  Future<void> _register() async {
    if (_contracts.isEmpty) {
      _showError('Créez d\'abord un contrat.');
      return;
    }
    final amountController = TextEditingController();
    String contractId = (_contracts.first as Map<String, dynamic>)['id'] as String;
    String method = 'MOBILE_MONEY';

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Enregistrer un paiement'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: contractId,
                decoration: const InputDecoration(labelText: 'Contrat'),
                items: _contracts
                    .map((c) => c as Map<String, dynamic>)
                    .map(
                      (c) => DropdownMenuItem(
                        value: c['id'] as String,
                        child: Text(
                          '${c['reference'] ?? ''} — '
                          '${(c['tenant'] as Map<String, dynamic>?)?['name'] ?? ''}',
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) =>
                    setDialogState(() => contractId = v ?? contractId),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: amountController,
                decoration:
                    const InputDecoration(labelText: 'Montant (FCFA) *'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: method,
                decoration:
                    const InputDecoration(labelText: 'Mode de paiement'),
                items: _methods.entries
                    .map(
                      (e) => DropdownMenuItem(
                        value: e.key,
                        child: Text(e.value),
                      ),
                    )
                    .toList(),
                onChanged: (v) =>
                    setDialogState(() => method = v ?? method),
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
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
    if (ok != true) return;
    final amount = double.tryParse(amountController.text.trim()) ?? 0;
    if (amount <= 0) {
      _showError('Le montant est requis.');
      return;
    }
    try {
      await ManagementService.instance.registerPayment({
        'contractId': contractId,
        'amount': amount,
        'method': method,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Paiement enregistré.')),
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
        title: const Text('Paiements'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _register,
        icon: const Icon(Icons.payments_outlined),
        label: const Text('Encaisser'),
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
        title: 'Aucun paiement',
        message: 'Enregistrez un encaissement.',
        icon: Icons.payments_outlined,
      );
    }
    final total = _items.fold<double>(0, (s, p) => s + p.amount);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: kGrad,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Total encaissé',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formatFcfa(total),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ..._items.map(
            (p) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                leading: Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: kSuccess.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.check_circle_outline,
                      color: kSuccess),
                ),
                title: Text(
                  formatFcfa(p.amount),
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: kSuccess,
                  ),
                ),
                subtitle: Text(
                  '${p.tenantName ?? '—'} · ${p.propertyName ?? '—'}\n'
                  '${_methods[p.method] ?? p.method}',
                  style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                ),
                trailing: Text(
                  p.createdAt.length >= 10 ? p.createdAt.substring(0, 10) : '',
                  style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}