import 'package:flutter/material.dart';

const kPrimary = Color(0xFF0F766E);
const kPrimaryDark = Color(0xFF115E59);
const kPrimaryDarker = Color(0xFF0F3D3A);
const kPrimaryLight = Color(0xFF14B8A6);
const kAccent = Color(0xFF2DD4BF);
const kAccentGold = Color(0xFFF59E0B);
const kInk = Color(0xFF0F172A);
const kMuted = Color(0xFF64748B);
const kMutedLight = Color(0xFF94A3B8);
const kBg = Color(0xFFF5F7FA);
const kCard = Color(0xFFFFFFFF);
const kBorder = Color(0xFFE2E8F0);
const kDanger = Color(0xFFDC2626);
const kSuccess = Color(0xFF16A34A);

const kGrad = LinearGradient(
  colors: [kPrimary, kPrimaryDark],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

const kGradDeep = LinearGradient(
  colors: [kPrimaryDarker, kPrimaryDark, kPrimary],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

ThemeData buildAppTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: kPrimary,
    brightness: Brightness.light,
  ).copyWith(
    primary: kPrimary,
    onPrimary: Colors.white,
    secondary: kAccent,
    onSecondary: kInk,
    surface: kCard,
    onSurface: kInk,
    surfaceContainerHighest: const Color(0xFFF1F5F9),
    onSurfaceVariant: kMuted,
    error: kDanger,
    outline: kBorder,
  );

  final base = ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: kBg,
  );

  return base.copyWith(
    textTheme: base.textTheme.apply(
      bodyColor: kInk,
      displayColor: kInk,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: kBg,
      foregroundColor: kInk,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: const TextStyle(
        color: kInk,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.02,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: kCard,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kPrimary, width: 1.6),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kDanger),
      ),
      hintStyle: const TextStyle(color: kMutedLight),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: kPrimary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.01,
        ),
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: kPrimary,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        side: const BorderSide(color: kPrimary, width: 1.4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: kPrimary,
        textStyle: const TextStyle(fontWeight: FontWeight.w600),
      ),
    ),
    cardTheme: CardThemeData(
      color: kCard,
      elevation: 0,
      shadowColor: Colors.black26,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: kCard,
      indicatorColor: const Color(0x1A0F766E),
      elevation: 0,
      height: 68,
      labelTextStyle: WidgetStatePropertyAll(
        TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: scheme.onSurfaceVariant,
        ),
      ),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? kPrimary : kMutedLight,
          size: 24,
        );
      }),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: kInk,
      contentTextStyle: const TextStyle(color: Colors.white),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    dividerTheme: const DividerThemeData(color: kBorder),
  );
}

const boxShadowCard = [
  BoxShadow(
    color: Color(0x0F0F172A),
    blurRadius: 18,
    offset: Offset(0, 6),
  ),
];