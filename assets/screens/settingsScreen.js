import * as React from "react";
import { Text, View, TouchableNativeFeedback, StyleSheet } from "react-native";

import { Icon } from "react-native-elements";

import LanguageContext from ".../App.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  listItem: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingRight: "4%",
    paddingLeft: "3%",
    borderBottomWidth: 1.5,
    height: 60,
    borderTopWidth: 1.5,
    borderColor: "#d6d7da",
    top: "30%",
  },
  angleRight: {
    right: "-45%",
    top: "-25%",
  },
  sectionName: {
    fontSize: 19,
    top: "33%",
  },
});

function settingsScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  return (
    <View style={styles.container}>
      <View style={styles.listItem}>
        <TouchableNativeFeedback
          onPress={() => navigation.navigate("settingsScreen_Language")}
        >
          <View>
            <Text style={styles.sectionName}>
              {dictinory.settingsScreen.languageButtonText}
            </Text>
            <Icon
              name="angle-right"
              type="font-awesome"
              color={"#d6d7da"}
              size={60}
              iconStyle={styles.angleRight}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
}

export default settingsScreen;
