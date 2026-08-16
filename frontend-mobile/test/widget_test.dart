import 'package:flutter_test/flutter_test.dart';

import 'package:immofaso/main.dart';

void main() {
  testWidgets('App renders splash then welcome', (WidgetTester tester) async {
    await tester.pumpWidget(const ImmofasoApp());
    await tester.pump();

    expect(find.text('IMMOFASO'), findsOneWidget);
  });
}
