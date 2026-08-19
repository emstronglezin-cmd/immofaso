import 'package:flutter/material.dart';

import '../models/management.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

class RapportsScreen extends StatefulWidget {
  const RapportsScreen({super.key});

  @override
  State<RapportsScreen> createState() => _RapportsScreenState();
}

class _RapportsScreenState extends State<RapportsScreen> {
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
        title: const Text('Rapports & Statistiques'),
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
          SkeletonBox(height: 120),
          SizedBox(height: 16),
          SkeletonBox(height: 200),
          SizedBox(height: 16),
          SkeletonBox(height: 160),
        ],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    final o = _overview!;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // En-tête
          _sectionHeader(theme, 'Résumé mensuel', Icons.calendar_month),
          const SizedBox(height: 12),
          _summaryGrid(theme, o),
          const SizedBox(height: 24),

          // Rentabilité annuelle
          _sectionHeader(theme, 'Performance annuelle', Icons.trending_up),
          const SizedBox(height: 12),
          _yearCard(theme, o),
          const SizedBox(height: 24),

          // Occupation
          _sectionHeader(theme, 'Taux d\'occupation', Icons.home_work),
          const SizedBox(height: 12),
          _occupancyCard(theme, o),
          const SizedBox(height: 24),

          // Évolution revenus
          if (o.revenueByMonth.isNotEmpty) ...[
            _sectionHeader(theme, 'Évolution des revenus (12 mois)', Icons.bar_chart),
            const SizedBox(height: 12),
            _revenueChart(theme, o),
            const SizedBox(height: 24),
          ],

          // Infos du jour
          _sectionHeader(theme, "Aujourd'hui", Icons.today),
          const SizedBox(height: 12),
          _todayCard(theme, o),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _sectionHeader(ThemeData theme, String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 20, color: kPrimary),
        const SizedBox(width: 8),
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: kPrimary,
          ),
        ),
      ],
    );
  }

  Widget _summaryGrid(ThemeData theme, DashboardOverview o) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _statCard(
                theme,
                label: 'Revenus du mois',
                value: formatFcfa(o.monthRevenue),
                icon: Icons.payments_outlined,
                color: kSuccess,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                theme,
                label: 'Dépenses du mois',
                value: formatFcfa(o.monthExpenses),
                icon: Icons.receipt_long_outlined,
                color: kDanger,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _statCard(
                theme,
                label: 'Impayés du mois',
                value: formatFcfa(o.monthUnpaid),
                icon: Icons.warning_amber_outlined,
                color: kAccentGold,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                theme,
                label: 'Bénéfice net',
                value: formatFcfa(o.monthRevenue - o.monthExpenses),
                icon: Icons.trending_up,
                color: o.monthRevenue > o.monthExpenses ? kSuccess : kDanger,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _statCard(
    ThemeData theme, {
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 16,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
          ),
        ],
      ),
    );
  }

  Widget _yearCard(ThemeData theme, DashboardOverview o) {
    final profit = o.yearProfit;
    final isPositive = profit >= 0;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: kGradDeep,
        borderRadius: BorderRadius.circular(20),
        boxShadow: boxShadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Revenus annuels",
            style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 4),
          Text(
            formatFcfa(o.yearRevenue),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _miniStat(
                  'Bénéfice',
                  formatFcfa(profit),
                  isPositive ? kAccent : const Color(0xFFFECACA),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _miniStat(
                  'Tickets actifs',
                  '${o.ticketsInProgress}',
                  Colors.white70,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String label, String value, Color valueColor) {
    return Container(
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
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontWeight: FontWeight.w800,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _occupancyCard(ThemeData theme, DashboardOverview o) {
    final rate = o.occupancyRate.clamp(0, 100);
    final color = rate >= 80
        ? kSuccess
        : rate >= 50
            ? kAccentGold
            : kDanger;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: boxShadowCard,
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Occupation globale',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$rate%',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: rate / 100,
              backgroundColor: kBorder,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 12,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            rate >= 80
                ? 'Excellent taux d\'occupation !'
                : rate >= 50
                    ? 'Occupation correcte — des logements disponibles'
                    : 'Taux d\'occupation faible — agissez',
            style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
          ),
        ],
      ),
    );
  }

  Widget _revenueChart(ThemeData theme, DashboardOverview o) {
    final entries = o.revenueByMonth;
    if (entries.isEmpty) return const SizedBox();
    final maxVal = entries
        .map((e) => e.value)
        .fold<double>(0, (a, b) => a > b ? a : b);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: boxShadowCard,
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: entries.map((entry) {
                final ratio = maxVal > 0 ? entry.value / maxVal : 0.0;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: Tooltip(
                      message: '${entry.key}\n${formatFcfa(entry.value)}',
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Flexible(
                            child: FractionallySizedBox(
                              heightFactor: ratio.clamp(0.05, 1.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: kGrad,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            entry.key.length >= 3
                                ? entry.key.substring(0, 3)
                                : entry.key,
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontSize: 9,
                              color: kMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Revenus mensuels sur les 12 derniers mois',
            style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
          ),
        ],
      ),
    );
  }

  Widget _todayCard(ThemeData theme, DashboardOverview o) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: kPrimary.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kPrimary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _todayStat(
              theme,
              "Encaissé",
              formatFcfa(o.todayCollected),
              kSuccess,
            ),
          ),
          Container(width: 1, height: 50, color: kPrimary.withValues(alpha: 0.2)),
          Expanded(
            child: _todayStat(
              theme,
              "Attendu",
              formatFcfa(o.todayExpected),
              kPrimary,
            ),
          ),
          Container(width: 1, height: 50, color: kPrimary.withValues(alpha: 0.2)),
          Expanded(
            child: _todayStat(
              theme,
              "Tickets",
              '${o.ticketsInProgress}',
              o.ticketsInProgress > 0 ? kAccentGold : kSuccess,
            ),
          ),
        ],
      ),
    );
  }

  Widget _todayStat(ThemeData theme, String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 14,
            color: color,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
