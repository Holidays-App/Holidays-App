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
    top: 30,
    color: "#666666",
  },
  description: {
    fontSize: 19,
    top: 70,
  },
  View: {
    paddingLeft: "4%",
    paddingRight: "4%",
    backgroundColor: "#ffffff",
  },
  ScrollView: {
//    marginBottom: 60,
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
