import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableNativeFeedback,
  FlatList,
} from "react-native";

import { useScrollToTop } from "@react-navigation/native";

import { LanguageContext, HolidaysContext } from "../../App";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  listItem: {
    flex: 1,
    width: "100%",
    height: 80,
    justifyContent: "center",
    paddingRight: "4%",
    paddingLeft: "3%",
  },
  name: {
    fontSize: 19,
  },
});

function categoriesScreen({ navigation }) {
  var categories;

  const { dictinory } = React.useContext(LanguageContext);
  const { holidays } = React.useContext(HolidaysContext);

  const flatListRef = React.useRef(null);
  useScrollToTop(flatListRef);

  const openСategoryHolidayScreen = (category) => {
    var parameters = { category };
    navigation.navigate("categoryScreen", parameters);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={(() => {
          categories = [];
          for (let category in require("../dictinories/us.json").categories) {
            if (holidays.some((holiday) => holiday.category == category)) {
              categories.push(category);
            }
          }
          return categories;
        })()}
        renderItem={({ item }) => (
          <TouchableNativeFeedback
            onPress={() => openСategoryHolidayScreen(item)}
          >
            <View style={styles.listItem}>
              <Text style={styles.name}>{dictinory.categories[item]}</Text>
            </View>
          </TouchableNativeFeedback>
        )}
        keyExtractor={(_item, index) => index.toString()}
      />
    </View>
  );
}

export default categoriesScreen;
