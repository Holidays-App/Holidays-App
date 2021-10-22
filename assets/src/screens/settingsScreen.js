import * as React from "react";
import { Text, View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { LanguageContext, ColorSheet } from "../utils";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
    backgroundColor: ColorSheet.backgroundColor,
  },
  touchableOpasity: {
    width: "100%",
  },
  languageButton: {
    position: "absolute",
    width: "80%",
    marginHorizontal: "10%",
    justifyContent: "center",
    borderRadius: 10,
    top: "25%",
    backgroundColor: ColorSheet.primaryColor,
  },
  sectionName: {
    marginVertical: 20,
    textAlign: "center",
    fontSize: 21,
    color: "#FFFFFF",
  },
});

function settingsScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  return (
    <View style={styles.container}>
      <TouchableNativeFeedback
        onPress={() => navigation.navigate("settingsScreen_Language")}
        style={styles.touchableOpasity}
      >
        <View style={styles.languageButton}>
          <Text style={styles.sectionName}>
            {dictinory.settingsScreen.languageButtonText}
          </Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

export default settingsScreen;
