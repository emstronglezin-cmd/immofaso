class Building {
  final String id;
  final String name;
  final String? address;
  final String? city;
  final String? description;
  final int? floors;
  final Map<String, dynamic>? stats;
  final String createdAt;

  const Building({
    required this.id,
    required this.name,
    this.address,
    this.city,
    this.description,
    this.floors,
    this.stats,
    required this.createdAt,
  });

  factory Building.fromJson(Map<String, dynamic> json) {
    final rawStats = json['stats'];
    return Building(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      address: json['address'] as String?,
      city: json['city'] as String?,
      description: json['description'] as String?,
      floors: json['floors'] as int?,
      stats: rawStats is Map<String, dynamic> ? rawStats : null,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  int get propertyCount => (stats?['propertyCount'] as num?)?.toInt() ?? 0;
  int get occupancyRate => (stats?['occupancyRate'] as num?)?.toInt() ?? 0;
  double get revenue => (stats?['revenue'] as num?)?.toDouble() ?? 0;
  double get unpaid => (stats?['unpaid'] as num?)?.toDouble() ?? 0;
}

class TenantModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String createdAt;

  const TenantModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.createdAt,
  });

  factory TenantModel.fromJson(Map<String, dynamic> json) => TenantModel(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        createdAt: json['createdAt'] as String? ?? '',
      );
}

class PaymentModel {
  final String id;
  final double amount;
  final String method;
  final String status;
  final String? tenantName;
  final String? propertyName;
  final String createdAt;

  const PaymentModel({
    required this.id,
    required this.amount,
    required this.method,
    required this.status,
    this.tenantName,
    this.propertyName,
    required this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    final contract = json['contract'] as Map<String, dynamic>?;
    final tenant = contract?['tenant'] as Map<String, dynamic>?;
    final property = contract?['property'] as Map<String, dynamic>?;
    return PaymentModel(
      id: json['id'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      method: json['method'] as String? ?? 'OTHER',
      status: json['status'] as String? ?? 'PENDING',
      tenantName: tenant?['name'] as String?,
      propertyName: property?['name'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class DashboardOverview {
  final double todayCollected;
  final double todayExpected;
  final int ticketsInProgress;
  final double monthRevenue;
  final double monthExpenses;
  final double monthUnpaid;
  final double yearRevenue;
  final double yearProfit;
  final int occupancyRate;
  final List<MapEntry<String, double>> revenueByMonth;

  const DashboardOverview({
    required this.todayCollected,
    required this.todayExpected,
    required this.ticketsInProgress,
    required this.monthRevenue,
    required this.monthExpenses,
    required this.monthUnpaid,
    required this.yearRevenue,
    required this.yearProfit,
    required this.occupancyRate,
    required this.revenueByMonth,
  });

  factory DashboardOverview.fromJson(Map<String, dynamic> json) {
    final today = json['today'] as Map<String, dynamic>? ?? {};
    final month = json['month'] as Map<String, dynamic>? ?? {};
    final year = json['year'] as Map<String, dynamic>? ?? {};
    final rawRevenue = json['revenueByMonth'] as List<dynamic>? ?? const [];
    final revenueByMonth = rawRevenue
        .whereType<Map<String, dynamic>>()
        .map((e) => MapEntry(
              e['month'] as String? ?? '',
              (e['value'] as num?)?.toDouble() ?? 0,
            ))
        .toList();
    return DashboardOverview(
      todayCollected: (today['collected'] as num?)?.toDouble() ?? 0,
      todayExpected: (today['expected'] as num?)?.toDouble() ?? 0,
      ticketsInProgress: (today['ticketsInProgress'] as num?)?.toInt() ?? 0,
      monthRevenue: (month['revenue'] as num?)?.toDouble() ?? 0,
      monthExpenses: (month['expenses'] as num?)?.toDouble() ?? 0,
      monthUnpaid: (month['unpaid'] as num?)?.toDouble() ?? 0,
      yearRevenue: (year['revenue'] as num?)?.toDouble() ?? 0,
      yearProfit: (year['profit'] as num?)?.toDouble() ?? 0,
      occupancyRate: (year['occupancyRate'] as num?)?.toInt() ?? 0,
      revenueByMonth: revenueByMonth,
    );
  }
}

String formatFcfa(num value) {
  final rounded = value.round();
  final digits = rounded.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    buffer.write(digits[i]);
    final remaining = digits.length - 1 - i;
    if (remaining > 0 && remaining % 3 == 0) buffer.write(' ');
  }
  return '${rounded < 0 ? '-' : ''}$buffer FCFA';
}