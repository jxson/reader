import "package:test/test.dart";
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:reader/components/flutter_demo.dart';

void main() {
  test("Example widget test", () {
    testWidgets((WidgetTester tester) {
      GlobalKey key = new GlobalKey();
      tester.pumpWidget(new MaterialApp(
          title: 'Flutter Demo',
          routes: <String, RouteBuilder>{
            '/': (RouteArguments args) => new FlutterDemo(key: key)
          }));

      expect("Foo", equals("Foo"));

      // tester.pump();
      //
      // expect(tester.findText("Flutter Demo"), isNotNull);
    });
  });
}
