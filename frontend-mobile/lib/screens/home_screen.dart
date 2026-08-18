import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import 'manage_screen.dart';
import 'profile_screen.dart';
import 'properties_screen.dart';

bool canManage() {
  final user = AuthService.instance.user;
  if (user == null || user.isGuest) return false;
  const roles = {'ADMIN', 'MANAGER', 'OWNER'};
  return roles.contains(user.role);
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    if (canManage()) {
      _index = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final showManage = canManage();
    final children = <Widget>[
      const PropertiesScreen(),
      if (showManage) const ManageScreen(),
      const ProfileScreen(),
    ];
    final destinations = <NavigationDestination>[
      const NavigationDestination(
        icon: Icon(Icons.home_outlined),
        selectedIcon: Icon(Icons.home),
        label: 'Biens',
      ),
      if (showManage)
        const NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard),
          label: 'Gestion',
        ),
      const NavigationDestination(
        icon: Icon(Icons.person_outline),
        selectedIcon: Icon(Icons.person),
        label: 'Profil',
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _index.clamp(0, children.length - 1),
        children: children,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: destinations,
      ),
    );
  }
}