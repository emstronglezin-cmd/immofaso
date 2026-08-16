import 'package:flutter/foundation.dart';

const _envApiUrl = String.fromEnvironment('API_URL');

String get apiBaseUrl {
  if (_envApiUrl.isNotEmpty) return _envApiUrl;
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}