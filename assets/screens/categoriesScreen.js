import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableNativeFeedback,
  FlatList,
} from "react-native";

import { Icon } from "react-native-elements";

import LanguageContext from ".../App.js";
import HolidaysContext from ".../App.js";

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
    height: 80,
    justifyContent: "center",
    paddingRight: "4%",
    paddingLeft: "3%",
  },
  angleRight: {
    right: "-45%",
    top: "-20%",
  },
  name: {
    fontSize: 19,
    top: "50%",
  },
});

function categoriesScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);
  const { holidays } = React.useContext(HolidaysContext);

  const openСategoryHolidayScreen = (category) => {
    var parameters = { category };
    navigation.navigate("categoryScreen", parameters);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={() => {
          let categories = [];
          for (let category in require("./dictinories/usDictinory.json")
            .categories) {
            if (holidays.some((holiday) => holiday.category == category)) {
              categories.push(category);
            }
          }
          return categories;
        }}
        renderItem={({ item }) => (
          <TouchableNativeFeedback
            onPress={() => openСategoryHolidayScreen(item)}
          >
            <View
              style={Object.assign(
                {},
                styles.listItem,
                categories.indexOf(item) == 0
                  ? {}
                  : {
                      borderTopColor: "#d6d7da",
                      borderTopWidth: 1.5,
                      lineHeight: 10,
                    }
              )}
            >
              <Text style={styles.name}>{dictinory.categories[item]}</Text>
              <Icon
                name="angle-right"
                type="font-awesome"
                color={"#d6d7da"}
                size={80}
                iconStyle={styles.angleRight}
              />
            </View>
          </TouchableNativeFeedback>
        )}
      />
    </View>
  );
}

export default categoriesScreen;
