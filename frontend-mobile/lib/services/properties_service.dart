import '../models/property.dart';
import 'api_client.dart';

class PropertiesService {
  PropertiesService._();

  static final PropertiesService instance = PropertiesService._();

  Future<PropertyList> fetchProperties({String? search}) async {
    final data = await ApiClient.instance.get(
      '/properties',
      query: (search == null || search.trim().isEmpty)
          ? null
          : {'search': search.trim()},
    );
    return PropertyList.fromJson(data as Map<String, dynamic>);
  }

  Future<Property> fetchProperty(String id) async {
    final data = await ApiClient.instance.get('/properties/$id');
    return Property.fromJson(data as Map<String, dynamic>);
  }
}