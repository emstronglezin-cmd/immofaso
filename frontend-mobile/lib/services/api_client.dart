import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;

  const ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();

  static const _timeout = Duration(seconds: 20);

  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = Uri.parse('$apiBaseUrl/api/v1$path');
    return query == null ? base : base.replace(queryParameters: query);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    final response = await http
        .get(_uri(path, query), headers: _headers)
        .timeout(_timeout);
    return _decode(response);
  }

  Future<dynamic> post(
    String path, [
    Map<String, dynamic>? body,
  ]) async {
    final response = await http
        .post(
          _uri(path),
          headers: _headers,
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(_timeout);
    return _decode(response);
  }

  dynamic _decode(http.Response response) {
    final body = response.bodyBytes.isEmpty
        ? null
        : jsonDecode(utf8.decode(response.bodyBytes));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    var message = 'Erreur (${response.statusCode})';
    if (body is Map<String, dynamic>) {
      final raw = body['message'];
      if (raw is String && raw.isNotEmpty) {
        message = raw;
      } else if (raw is List && raw.isNotEmpty) {
        message = raw.join('\n');
      }
    }
    throw ApiException(response.statusCode, message);
  }
}