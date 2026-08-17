import '../models/property.dart';
import 'api_client.dart';

class PropertiesService {
  PropertiesService._();

  static final PropertiesService instance = PropertiesService._();

  Future<PropertyList> fetchProperties({String? search, Map<String, String>? query}) async {
    final params = <String, String>{...?query};
    if (search != null && search.trim().isNotEmpty) {
      params['search'] = search.trim();
    }
    final data = await ApiClient.instance.get(
      '/properties',
      query: params.isEmpty ? null : params,
    );
    return PropertyList.fromJson(data as Map<String, dynamic>);
  }

  Future<Property> fetchProperty(String id) async {
    final data = await ApiClient.instance.get('/properties/$id');
    return Property.fromJson(data as Map<String, dynamic>);
  }
}