import 'package:flutter/material.dart';

import '../services/auth_service.dart';

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
                CircleAvatar(
                  radius: 40,
                  backgroundColor: theme.colorScheme.primary,
                  child: Text(
                    user.initials,
                    style: TextStyle(
                      fontSize: 28,
                      color: theme.colorScheme.onPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  user.displayName,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (user.email != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    user.email!,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Center(child: _roleBadge(theme, user.role, user.isGuest)),
                const SizedBox(height: 24),
                Card(
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
                const SizedBox(height: 24),
                FilledButton.tonalIcon(
                  onPressed: () async {
                    await AuthService.instance.logout();
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Se déconnecter'),
                ),
              ],
            ),
    );
  }

  Widget _roleBadge(ThemeData theme, String role, bool isGuest) {
    final label = _roleLabel(role, isGuest);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: theme.colorScheme.onSecondaryContainer,
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
      leading: Icon(icon, color: theme.colorScheme.primary),
      title: Text(label, style: theme.textTheme.labelMedium),
      subtitle: Text(value, style: theme.textTheme.bodyLarge),
    );
  }
}