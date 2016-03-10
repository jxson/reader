import 'package:flutter/material.dart';

class FlutterDemo extends StatefulComponent {
  FlutterDemo({Key key}): super(key: key);

  FlutterDemoState createState() => new FlutterDemoState();
}

class FlutterDemoState extends State<FlutterDemo> {
  int counter = 0;

  void incrementCounter() {
    setState(() {
      counter++;
    });
  }

  Widget build(BuildContext context) {
    return new Scaffold(
        toolBar: new ToolBar(center: new Text('Flutter Demo')),
        body: new Center(
            child: new Text(
                'Button tapped $counter time${ counter == 1 ? '' : 's' }.')),
        floatingActionButton: new FloatingActionButton(
            onPressed: incrementCounter,
            tooltip: 'Increment',
            child: new Icon(icon: Icons.add)));
  }
}