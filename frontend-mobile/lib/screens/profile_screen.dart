import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import '../theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = AuthService.instance;
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const SizedBox(height: 8),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        gradient: kGrad,
                        shape: BoxShape.circle,
                        boxShadow: boxShadowCard,
                      ),
                      child: Center(
                        child: Text(
                          user.initials,
                          style: const TextStyle(
                            fontSize: 34,
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    if (user.isGuest)
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: kAccentGold,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.visibility_outlined,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  user.displayName,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: kInk,
                    letterSpacing: -0.02,
                  ),
                ),
                if (user.email != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    user.email!,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: kMuted,
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                Center(child: _roleBadge(theme, user.role, user.isGuest)),
                const SizedBox(height: 24),
                Container(
                  decoration: BoxDecoration(
                    color: kCard,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: kBorder),
                  ),
                  child: Column(
                    children: [
                      _infoTile(
                        theme,
                        Icons.person_outline,
                        'Rôle',
                        _roleLabel(user.role, user.isGuest),
                      ),
                      if (user.phone != null)
                        _infoTile(
                          theme,
                          Icons.phone_outlined,
                          'Téléphone',
                          user.phone!,
                        ),
                      _infoTile(
                        theme,
                        Icons.email_outlined,
                        'Email',
                        user.email ?? '—',
                      ),
                    ],
                  ),
                ),
                if (user.isGuest) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: kPrimary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: kPrimary.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: kPrimary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Mode invité : vous parcourez les biens sans compte.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: kPrimaryDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton.tonalIcon(
                  onPressed: () async {
                    await AuthService.instance.logout();
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: kDanger.withValues(alpha: 0.1),
                    foregroundColor: kDanger,
                  ),
                  icon: const Icon(Icons.logout),
                  label: const Text('Se déconnecter'),
                ),
              ],
            ),
    );
  }

  Widget _roleBadge(ThemeData theme, String role, bool isGuest) {
    final label = _roleLabel(role, isGuest);
    final color = isGuest ? kAccentGold : kPrimary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  String _roleLabel(String role, bool isGuest) {
    if (isGuest) return 'Invité';
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'OWNER':
        return 'Propriétaire';
      case 'MANAGER':
        return 'Gestionnaire';
      case 'TENANT':
        return 'Locataire';
      default:
        return role;
    }
  }

  Widget _infoTile(ThemeData theme, IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: kPrimary),
      title: Text(label, style: theme.textTheme.labelMedium),
      subtitle: Text(
        value,
        style: theme.textTheme.bodyLarge?.copyWith(
          color: kInk,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}