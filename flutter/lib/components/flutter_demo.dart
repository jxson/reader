import 'package:flutter/material.dart';

class FlutterDemo extends StatefulComponent {
  FlutterDemo({Key key}): super(key: key);

  _FlutterDemoState createState() => new _FlutterDemoState();
}

class _FlutterDemoState extends State<FlutterDemo> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  Widget build(BuildContext context) {
    return new Scaffold(
        toolBar: new ToolBar(center: new Text('Flutter Demo')),
        body: new Center(
            child: new Text(
                'Button tapped $_counter time${ _counter == 1 ? '' : 's' }.')),
        floatingActionButton: new FloatingActionButton(
            onPressed: _incrementCounter,
            tooltip: 'Increment',
            child: new Icon(icon: Icons.add)));
  }
}
