// @flow

import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView
} from "react-native";

import { makeReactNativeDisklet, logDisklet } from "disklet";
import { tests } from "./common.js";

type Props = {};
type State = { [name: string]: void | true | string };

function statusLine(name: string, status: void | true | string) {
  if (status == null) {
    return (
      <Text key={name} style={styles.running}>
        Running "{name}"
      </Text>
    );
  }
  if (status === true) {
    return (
      <Text key={name} style={styles.good}>
        Passed "{name}"
      </Text>
    );
  }
  return (
    <Text key={name} style={styles.bad}>
      Failed "{name}" ({status})
    </Text>
  );
}

export default class DiskletTest extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async runTests() {
    for (const name in tests) {
      const disklet = logDisklet(makeReactNativeDisklet());
      await tests[name](disklet)
        .then(
          ok => {
            this.setState({ [name]: true });
            return disklet.delete(".");
          },
          error => {
            console.log(error);
            for (const key in error) {
              console.log(key, error[key]);
            }
            this.setState({ [name]: String(error) });
            return disklet.delete(".");
          }
        )
        .catch(error => {
          console.log(error.domain);
          this.setState({ [name]: String(error) });
        });
    }
  }

  componentDidMount() {
    this.runTests();
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent />
        <Text style={styles.header}>Tests </Text>
        <View style={styles.results}>
          {Object.keys(tests).map(name => statusLine(name, this.state[name]))}
        </View>
      </SafeAreaView>
    );
  }
}

const testStyle = (color: string) => ({
  color,
  margin: 5
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#205030",
    flex: 1,
    paddingTop: StatusBar.currentHeight
  },
  header: {
    color: "#ffffff",
    fontSize: 20,
    padding: 5,
    textAlign: "center"
  },
  results: {
    backgroundColor: "#ffffff",
    flex: 1
  },
  running: testStyle("#000000"),
  bad: testStyle("#7f4f30"),
  good: testStyle("#307f4f")
});
