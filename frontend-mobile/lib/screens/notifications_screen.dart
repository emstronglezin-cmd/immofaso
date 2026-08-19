import 'package:flutter/material.dart';

import '../models/notification_model.dart';
import '../services/management_service.dart';
import '../theme.dart';
import '../widgets/state_widgets.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationModel> _items = const [];
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
      final items = await ManagementService.instance.fetchNotifications();
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

  Future<void> _markAllRead() async {
    try {
      await ManagementService.instance.markAllNotificationsRead();
      _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'PAYMENT':
        return Icons.payments_outlined;
      case 'RENT':
        return Icons.home_work_outlined;
      case 'MAINTENANCE':
        return Icons.build_outlined;
      case 'CONTRACT':
        return Icons.description_outlined;
      case 'ALERT':
        return Icons.warning_amber_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'PAYMENT':
        return kSuccess;
      case 'RENT':
        return kPrimary;
      case 'MAINTENANCE':
        return kAccentGold;
      case 'CONTRACT':
        return const Color(0xFF6366F1);
      case 'ALERT':
        return kDanger;
      default:
        return kMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final unread = _items.where((n) => !n.isRead).length;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifications'),
            if (!_loading && unread > 0)
              Text(
                '$unread non lue${unread > 1 ? 's' : ''}',
                style: TextStyle(
                  fontSize: 12,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  fontWeight: FontWeight.w400,
                ),
              ),
          ],
        ),
        actions: [
          if (unread > 0)
            TextButton.icon(
              onPressed: _markAllRead,
              icon: const Icon(Icons.done_all, size: 18),
              label: const Text('Tout lire'),
            ),
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
          SkeletonBox(height: 72),
          SizedBox(height: 10),
          SkeletonBox(height: 72),
          SizedBox(height: 10),
          SkeletonBox(height: 72),
          SizedBox(height: 10),
          SkeletonBox(height: 72),
        ],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    if (_items.isEmpty) {
      return const EmptyState(
        title: 'Aucune notification',
        message: 'Toutes vos notifications apparaîtront ici.',
        icon: Icons.notifications_none_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final n = _items[index];
          final color = _colorForType(n.type);
          return Container(
            decoration: BoxDecoration(
              color: n.isRead
                  ? theme.colorScheme.surface
                  : color.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: n.isRead
                    ? kBorder
                    : color.withValues(alpha: 0.3),
              ),
            ),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_iconForType(n.type), color: color, size: 22),
              ),
              title: Text(
                n.title,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: n.isRead ? FontWeight.w600 : FontWeight.w800,
                ),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (n.message.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      n.message,
                      style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                    ),
                  ],
                  const SizedBox(height: 4),
                  Text(
                    n.createdAt.length >= 10 ? n.createdAt.substring(0, 10) : n.createdAt,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 11,
                      color: kMutedLight,
                    ),
                  ),
                ],
              ),
              trailing: !n.isRead
                  ? Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    )
                  : null,
            ),
          );
        },
      ),
    );
  }
}
