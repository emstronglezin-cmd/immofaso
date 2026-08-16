class User {
  final String id;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String role;
  final bool isGuest;
  final bool active;
  final String? createdAt;

  const User({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.role = 'GUEST',
    this.isGuest = false,
    this.active = true,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      email: json['email'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'GUEST',
      isGuest: json['isGuest'] as bool? ?? false,
      active: json['active'] as bool? ?? true,
      createdAt: json['createdAt'] as String?,
    );
  }

  String get displayName {
    final first = firstName?.trim() ?? '';
    final last = lastName?.trim() ?? '';
    if (first.isNotEmpty && last.isNotEmpty) return '$first $last';
    if (first.isNotEmpty) return first;
    if (email != null && email!.isNotEmpty) return email!;
    return 'Invité';
  }

  String get initials {
    final first = firstName?.trim() ?? '';
    final last = lastName?.trim() ?? '';
    if (first.isNotEmpty && last.isNotEmpty) {
      return '${first[0]}${last[0]}'.toUpperCase();
    }
    if (first.isNotEmpty) return first[0].toUpperCase();
    if (email != null && email!.isNotEmpty) return email![0].toUpperCase();
    return 'I';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'role': role,
      'isGuest': isGuest,
      'active': active,
      'createdAt': createdAt,
    };
  }
}