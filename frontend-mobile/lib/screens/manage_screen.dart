import 'package:flutter/material.dart';

import '../models/management.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';
import 'manage_buildings_screen.dart';
import 'manage_contracts_screen.dart';
import 'manage_expenses_screen.dart';
import 'manage_maintenance_screen.dart';
import 'manage_payments_screen.dart';
import 'manage_properties_screen.dart';
import 'manage_rents_screen.dart';
import 'manage_tenants_screen.dart';
import 'notifications_screen.dart';
import 'rapports_screen.dart';

class ManageScreen extends StatefulWidget {
  const ManageScreen({super.key});

  @override
  State<ManageScreen> createState() => _ManageScreenState();
}

class _ManageScreenState extends State<ManageScreen> {
  DashboardOverview? _overview;
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
      final data = await ManagementService.instance.fetchOverview();
      if (mounted) {
        setState(() {
          _overview = data;
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
      appBar: AppBar(
        title: const Text('Gestion'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: _buildBody(theme),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_loading) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SkeletonBox(height: 100),
          SizedBox(height: 12),
          SkeletonBox(height: 100),
          SizedBox(height: 12),
          SkeletonBox(height: 100),
        ],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    final o = _overview!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _heroCard(theme, o),
        const SizedBox(height: 20),
        Text(
          'Modules',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        _moduleTile(
          theme,
          icon: Icons.apartment,
          label: 'Immeubles',
          subtitle: 'Patrimoine et occupation',
          onTap: () => _push(const ManageBuildingsScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.home_work_outlined,
          label: 'Biens',
          subtitle: 'Ajouter, modifier, supprimer',
          onTap: () => _push(const ManagePropertiesScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.people_outline,
          label: 'Locataires',
          subtitle: 'Gérer les occupants',
          onTap: () => _push(const ManageTenantsScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.payments_outlined,
          label: 'Paiements',
          subtitle: 'Encaisser et suivre',
          onTap: () => _push(const ManagePaymentsScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.description_outlined,
          label: 'Contrats',
          subtitle: 'Lier locataires et biens',
          onTap: () => _push(const ManageContractsScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.receipt_long_outlined,
          label: 'Dépenses',
          subtitle: 'Enregistrer les charges',
          onTap: () => _push(const ManageExpensesScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.build_outlined,
          label: 'Maintenance',
          subtitle: 'Tickets et interventions',
          onTap: () => _push(const ManageMaintenanceScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.home_filled,
          label: 'Loyers',
          subtitle: 'Échéances et impayés',
          onTap: () => _push(const ManageRentsScreen()),
        ),
        const Divider(height: 24),
        Text(
          'Analyses',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        _moduleTile(
          theme,
          icon: Icons.bar_chart,
          label: 'Rapports',
          subtitle: 'Statistiques et performance',
          onTap: () => _push(const RapportsScreen()),
        ),
        _moduleTile(
          theme,
          icon: Icons.notifications_outlined,
          label: 'Notifications',
          subtitle: 'Alertes et rappels',
          onTap: () => _push(const NotificationsScreen()),
        ),
      ],
    );
  }

  void _push(Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  Widget _heroCard(ThemeData theme, DashboardOverview o) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: kGradDeep,
        borderRadius: BorderRadius.circular(22),
        boxShadow: boxShadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.trending_up, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'Vue du jour',
                style: theme.textTheme.titleSmall?.copyWith(
                  color: Colors.white70,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            formatFcfa(o.todayCollected),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'encaissé — ${formatFcfa(o.todayExpected)} attendu',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _chip('Revenus du mois', formatFcfa(o.monthRevenue)),
              const SizedBox(width: 10),
              _chip('Impayés', formatFcfa(o.monthUnpaid), danger: true),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _chip('Bénéfice an.', formatFcfa(o.yearProfit)),
              const SizedBox(width: 10),
              _chip('Occupation', '${o.occupancyRate}%'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, String value, {bool danger = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(color: Colors.white60, fontSize: 11),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                color: danger ? const Color(0xFFFECACA) : Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _moduleTile(
    ThemeData theme, {
    required IconData icon,
    required String label,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: kPrimary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: kPrimary),
        ),
        title: Text(
          label,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
        ),
        trailing: const Icon(Icons.chevron_right, color: kMutedLight),
        onTap: onTap,
      ),
    );
  }
}