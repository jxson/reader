import "package:test/test.dart";
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:reader/components/flutter_demo.dart';

void main() {
  test("Example widget test", () {
    testWidgets((WidgetTester tester) {
      GlobalKey demo = new GlobalKey();
      Widget widget = new FlutterDemo(key: demo);

      tester.pumpWidget(widget);

      expect(tester.findText("Flutter Demo"), isNotNull);
      // expect(demo.currentState._counter, 0);

      // 'Button tapped $_counter time${ _counter == 1 ? '' : 's' }.'))
    });
  });
}


// class _FlutterDemoState extends State<FlutterDemo> {
//   int _counter = 0;
//
//   void _incrementCounter() {
//     setState(() {
//       _counter++;
//     });
//   }
