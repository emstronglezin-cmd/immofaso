const _envApiUrl = String.fromEnvironment('API_URL');

const _productionApiUrl = 'https://immofaso-backend.onrender.com';

String get apiBaseUrl {
  final base = _envApiUrl.isNotEmpty ? _envApiUrl : _productionApiUrl;
  return base.trim().replaceAll(RegExp(r'/+$'), '');
}