import '../models/management.dart';
import '../models/notification_model.dart';
import 'api_client.dart';

class ManagementService {
  ManagementService._();

  static final ManagementService instance = ManagementService._();

  Future<DashboardOverview> fetchOverview() async {
    final data = await ApiClient.instance.get('/dashboard/overview');
    return DashboardOverview.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Building>> fetchBuildings() async {
    final data = await ApiClient.instance.get('/buildings');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Building.fromJson)
        .toList();
  }

  Future<void> createBuilding(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/buildings', body);
  }

  Future<void> deleteBuilding(String id) async {
    await ApiClient.instance.delete('/buildings/$id');
  }

  Future<List<dynamic>> fetchProperties() async {
    final data = await ApiClient.instance.get('/properties');
    return (data as Map<String, dynamic>)['items'] as List<dynamic>? ??
        const [];
  }

  Future<void> createProperty(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/properties', body);
  }

  Future<void> updateProperty(String id, Map<String, dynamic> body) async {
    await ApiClient.instance.patch('/properties/$id', body);
  }

  Future<void> deleteProperty(String id) async {
    await ApiClient.instance.delete('/properties/$id');
  }

  Future<List<TenantModel>> fetchTenants() async {
    final data = await ApiClient.instance.get('/tenants');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(TenantModel.fromJson)
        .toList();
  }

  Future<void> createTenant(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/tenants', body);
  }

  Future<void> deleteTenant(String id) async {
    await ApiClient.instance.delete('/tenants/$id');
  }

  Future<List<PaymentModel>> fetchPayments() async {
    final data = await ApiClient.instance.get('/payments');
    return ((data as Map<String, dynamic>)['items'] as List<dynamic>?)
            ?.whereType<Map<String, dynamic>>()
            .map(PaymentModel.fromJson)
            .toList() ??
        const [];
  }

  Future<dynamic> registerPayment(Map<String, dynamic> body) async {
    return ApiClient.instance.post('/payments', body);
  }

  Future<void> deletePayment(String id) async {
    await ApiClient.instance.delete('/payments/$id');
  }

  Future<List<dynamic>> fetchContracts() async {
    final data = await ApiClient.instance.get('/contracts');
    return data as List<dynamic>? ?? const [];
  }

  Future<List<ContractModel>> fetchContractModels() async {
    final data = await ApiClient.instance.get('/contracts');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(ContractModel.fromJson)
        .toList();
  }

  Future<void> createContract(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/contracts', body);
  }

  Future<void> deleteContract(String id) async {
    await ApiClient.instance.delete('/contracts/$id');
  }

  Future<List<ExpenseModel>> fetchExpenses() async {
    final data = await ApiClient.instance.get('/expenses');
    return ((data as Map<String, dynamic>)['items'] as List<dynamic>?)
            ?.whereType<Map<String, dynamic>>()
            .map(ExpenseModel.fromJson)
            .toList() ??
        const [];
  }

  Future<void> createExpense(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/expenses', body);
  }

  Future<void> deleteExpense(String id) async {
    await ApiClient.instance.delete('/expenses/$id');
  }

  Future<List<MaintenanceTicketModel>> fetchTickets() async {
    final data = await ApiClient.instance.get('/maintenance');
    return ((data as Map<String, dynamic>)['items'] as List<dynamic>?)
            ?.whereType<Map<String, dynamic>>()
            .map(MaintenanceTicketModel.fromJson)
            .toList() ??
        const [];
  }

  Future<void> createTicket(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/maintenance', body);
  }

  Future<void> updateTicket(String id, Map<String, dynamic> body) async {
    await ApiClient.instance.patch('/maintenance/$id', body);
  }

  Future<void> deleteTicket(String id) async {
    await ApiClient.instance.delete('/maintenance/$id');
  }

  // ── Loyers ─────────────────────────────────────────────────────────────
  Future<List<RentModel>> fetchRents() async {
    final data = await ApiClient.instance.get('/rents');
    final items = data is Map<String, dynamic>
        ? (data['items'] as List<dynamic>? ?? [])
        : (data as List<dynamic>? ?? []);
    return items
        .whereType<Map<String, dynamic>>()
        .map(RentModel.fromJson)
        .toList();
  }

  Future<void> createRent(Map<String, dynamic> body) async {
    await ApiClient.instance.post('/rents', body);
  }

  // ── Notifications ───────────────────────────────────────────────────────
  Future<List<NotificationModel>> fetchNotifications() async {
    final data = await ApiClient.instance.get('/notifications');
    final items = data is Map<String, dynamic>
        ? (data['items'] as List<dynamic>? ?? [])
        : (data as List<dynamic>? ?? []);
    return items
        .whereType<Map<String, dynamic>>()
        .map(NotificationModel.fromJson)
        .toList();
  }

  Future<void> markAllNotificationsRead() async {
    await ApiClient.instance.post('/notifications/read-all');
  }

  // ── Solde crédit/dette par contrat ─────────────────────────────────────
  Future<Map<String, dynamic>> fetchContractBalance(String contractId) async {
    final data = await ApiClient.instance.get('/payments/balance/$contractId');
    return data as Map<String, dynamic>? ?? {};
  }
}