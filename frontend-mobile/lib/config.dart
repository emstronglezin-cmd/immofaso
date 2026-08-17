import 'package:flutter/foundation.dart';

const _envApiUrl = String.fromEnvironment('API_URL');

const _productionApiUrl = 'https://immofaso-backend.onrender.com';

String get apiBaseUrl {
  if (_envApiUrl.isNotEmpty) return _envApiUrl;
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return _productionApiUrl;
  }
  return _productionApiUrl;
}