import React from "react";
import {View, StyleSheet} from "react-native";

const BillorLines = () => {
  return (
    <View style={styles.lineContainer}>
      <View style={styles.verticalLinesContainer}>
        <View style={styles.verticalLine}></View>
        <View style={styles.verticalLine2}></View>
      </View>
      <View style={styles.curveContainer}>
        <View style={styles.curveLine}></View>
        <View style={styles.curveLine2}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lineContainer: {
    position: "absolute",
    top: 0,
    left: 36,
    zIndex: 0,
    flexDirection: "row",
  },
  verticalLinesContainer: {
    flexDirection: "row",
    gap: 2,
  },
  verticalLine: {
    width: 2,
    height: 270,
    backgroundColor: "#1f1f1f", 
  },
  verticalLine2: {
    width: 2,
    height: 265,
    backgroundColor: "#1f1f1f",
  },
  curveContainer: {
    position: "absolute",
    top: 265,
    left: 0,
  },
  curveLine: {
    position: "absolute",
    top: -0.2,
    left: 4,
    width: 70,
    height: 24.5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#1f1f1f",
    borderBottomLeftRadius: 17,
  },
  curveLine2: {
    position: "absolute",
    top: 4.6,
    left: 0,
    width: 80,
    height: 24.3,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#1f1f1f",
    borderBottomLeftRadius: 20,
  },
});

export default BillorLines;
