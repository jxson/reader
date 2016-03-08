import "package:test/test.dart";
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:reader/components/flutter_demo.dart';

void main() {
  test("Example State test", () {
    testWidgets((WidgetTester tester) {
      GlobalKey key = new GlobalKey();
      tester.pumpWidget(new MaterialApp(
          title: 'Test App',
          routes: <String, RouteBuilder>{
            '/': (RouteArguments args) => new FlutterDemo(key: key)
          }));

      StatefulComponentElement element = tester.findElementByKey(key);
      expect(element, isNotNull);
      expect(element.state is FlutterDemoState, isTrue);
      FlutterDemoState state = element.state;

      expect(tester.findText("Flutter Demo"), isNotNull);
      expect(tester.findText("Button tapped 0 times."), isNotNull);

      state.incrementCounter();
      tester.pump();

      expect(state.counter, equals(1));
      expect(tester.findText("Button tapped 1 time."), isNotNull);

      state.incrementCounter();
      tester.pump();
      expect(state.counter, equals(2));
      expect(tester.findText("Button tapped 2 times."), isNotNull);

      StatefulComponentElement fab = tester.findElement((Element element) => element.widget is FloatingActionButton);
      expect(fab, isNotNull);
      tester.tap(fab);
      tester.pump();
      expect(tester.findText("Button tapped 3 times."), isNotNull);
    });
  });
}
