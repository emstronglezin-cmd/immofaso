import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth_response.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService extends ChangeNotifier {
  AuthService._();

  static final AuthService instance = AuthService._();

  static const _tokenKey = 'immofaso_token';
  static const _refreshKey = 'immofaso_refresh';
  static const _userKey = 'immofaso_user';

  User? _user;
  bool _initialized = false;

  User? get user => _user;

  bool get initialized => _initialized;

  bool get isAuthenticated => _user != null;

  bool get isGuest => _user?.isGuest ?? false;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token != null && token.isNotEmpty) {
      ApiClient.instance.setToken(token);
      final cached = prefs.getString(_userKey);
      if (cached != null) {
        try {
          _user = User.fromJson(
            jsonDecode(cached) as Map<String, dynamic>,
          );
        } catch (_) {
          _user = null;
        }
      }
      try {
        final data = await ApiClient.instance.get('/auth/me');
        final fresh = User.fromJson(data as Map<String, dynamic>);
        _user = fresh;
        await prefs.setString(_userKey, jsonEncode(fresh.toJson()));
      } catch (_) {
        await _clearLocal(prefs);
        ApiClient.instance.setToken(null);
        _user = null;
      }
    }
    _initialized = true;
    notifyListeners();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final data = await ApiClient.instance.post('/auth/login', {
      'email': email.trim(),
      'password': password,
    });
    await _applyAuth(data);
  }

  Future<void> register({
    String? firstName,
    String? lastName,
    required String email,
    String? phone,
    required String password,
  }) async {
    final data = await ApiClient.instance.post('/auth/register', {
      if (firstName != null && firstName.isNotEmpty) 'firstName': firstName,
      if (lastName != null && lastName.isNotEmpty) 'lastName': lastName,
      'email': email.trim(),
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      'password': password,
    });
    await _applyAuth(data);
  }

  Future<void> continueAsGuest() async {
    final data = await ApiClient.instance.post('/auth/guest');
    await _applyAuth(data);
  }

  Future<void> logout() async {
    try {
      await ApiClient.instance.post('/auth/logout');
    } catch (_) {
      // même hors ligne, on purge la session locale
    }
    final prefs = await SharedPreferences.getInstance();
    await _clearLocal(prefs);
    ApiClient.instance.setToken(null);
    _user = null;
    notifyListeners();
  }

  Future<void> _applyAuth(dynamic data) async {
    final response = AuthResponse.fromJson(data as Map<String, dynamic>);
    ApiClient.instance.setToken(response.accessToken);
    _user = response.user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, response.accessToken);
    if (response.refreshToken != null) {
      await prefs.setString(_refreshKey, response.refreshToken!);
    }
    await prefs.setString(_userKey, jsonEncode(response.user.toJson()));
    notifyListeners();
  }

  Future<void> _clearLocal(SharedPreferences prefs) async {
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshKey);
    await prefs.remove(_userKey);
  }
}