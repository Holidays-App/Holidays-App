import * as React from "react";
import { Text, View, ScrollView, StyleSheet } from "react-native";

import { LanguageContext } from "../../App";

const styles = StyleSheet.create({
  name: {
    fontSize: 26,
    top: 10,
  },
  date: {
    fontSize: 22,
    top: 20,
    left: "4%",
    color: "#666666",
  },
  description: {
    fontSize: 19,
    top: 35,
  },
  View: {
    paddingLeft: "3%",
    paddingRight: "3%",
    flex: 1,
//    backgroundColor: "#FFFFFF",
  },
  ScrollView: {
    paddingBottom: 60,
  },
});

function holidayScreen({ route }) {
  const { dictinory } = React.useContext(LanguageContext);

  return (
    <ScrollView contentContainerStyle={styles.ScrollView}>
      <View style={styles.View}>
        <Text style={styles.name}>{route.params.holiday.name}</Text>
        <Text style={styles.date}>
          {route.params.holiday.date.day +
            " " +
            dictinory.months[route.params.holiday.date.month - 1]}
        </Text>
        <Text style={styles.description}>
          {route.params.holiday.description}
        </Text>
      </View>
    </ScrollView>
  );
}

export default holidayScreen;
