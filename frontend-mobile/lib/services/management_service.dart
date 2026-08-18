import '../models/management.dart';
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

  Future<List<dynamic>> fetchContracts() async {
    final data = await ApiClient.instance.get('/contracts');
    return data as List<dynamic>? ?? const [];
  }
}