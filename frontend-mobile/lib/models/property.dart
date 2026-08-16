class Property {
  final String id;
  final String name;
  final String type;
  final String status;
  final String? description;
  final String? address;
  final String? city;
  final String? country;
  final double price;
  final double? area;
  final int? rooms;
  final int? bathrooms;
  final List<String> images;
  final String? ownerId;
  final String? ownerName;
  final String createdAt;

  const Property({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    this.description,
    this.address,
    this.city,
    this.country,
    required this.price,
    this.area,
    this.rooms,
    this.bathrooms,
    this.images = const [],
    this.ownerId,
    this.ownerName,
    required this.createdAt,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    final owner = json['owner'] as Map<String, dynamic>?;
    final rawImages = json['images'];
    return Property(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'OTHER',
      status: json['status'] as String? ?? 'AVAILABLE',
      description: json['description'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0,
      area: (json['area'] as num?)?.toDouble(),
      rooms: json['rooms'] as int?,
      bathrooms: json['bathrooms'] as int?,
      images: _parseImages(rawImages),
      ownerId: json['ownerId'] as String?,
      ownerName: owner?['name'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  static List<String> _parseImages(dynamic raw) {
    if (raw is List) {
      return raw.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
    }
    return const [];
  }

  String get typeLabel => _label(type);

  String get statusLabel => _label(status);

  String get formattedPrice => '${_formatNumber(price)} FCFA';

  static String _label(String value) {
    switch (value) {
      case 'APARTMENT':
        return 'Appartement';
      case 'HOUSE':
        return 'Maison';
      case 'OFFICE':
        return 'Bureau';
      case 'COMMERCIAL':
        return 'Local commercial';
      case 'LAND':
        return 'Terrain';
      case 'AVAILABLE':
        return 'Disponible';
      case 'RENTED':
        return 'Loué';
      case 'UNDER_MAINTENANCE':
        return 'En travaux';
      case 'SOLD':
        return 'Vendu';
      default:
        return value;
    }
  }

  static String _formatNumber(double value) {
    final rounded = value.round();
    final digits = rounded.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      buffer.write(digits[i]);
      final remaining = digits.length - 1 - i;
      if (remaining > 0 && remaining % 3 == 0) buffer.write(' ');
    }
    return buffer.toString();
  }
}

class PropertyList {
  final List<Property> items;
  final int total;

  const PropertyList({required this.items, required this.total});

  factory PropertyList.fromJson(Map<String, dynamic> json) {
    final raw = json['items'] as List<dynamic>? ?? const [];
    return PropertyList(
      items: raw
          .whereType<Map<String, dynamic>>()
          .map(Property.fromJson)
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? raw.length,
    );
  }
}