import * as React from "react";
import {
  Text,
  View,
  TouchableNativeFeedback,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { Icon } from "react-native-elements";

import LanguageContext from ".../App.js";
import HolidaysContext from ".../App.js";

function sortByDateAndCategory(holidaysList) {
  const date = new Date();
  var categoriesList = [];
  for (let category in dictinory.en.categories) {
    categoriesList.push(category);
  }

  var holidaysListLocal = holidaysList;

  holidaysListLocal.sort((a, b) => {
    var aDate =
      a.date.month < date.getMonth() + 1 ||
      (a.date.month == date.getMonth() + 1 && a.date.day < date.getDate())
        ? a.date.month -
          (date.getMonth() + 1) +
          (a.date.day - date.getDate()) / 100 +
          12.5
        : a.date.month -
          (date.getMonth() + 1) +
          (a.date.day - date.getDate()) / 100;

    var bDate =
      b.date.month < date.getMonth() + 1 ||
      (b.date.month == date.getMonth() + 1 && b.date.day < date.getDate())
        ? b.date.month -
          (date.getMonth() + 1) +
          (b.date.day - date.getDate()) / 100 +
          12.5
        : b.date.month -
          (date.getMonth() + 1) +
          (b.date.day - date.getDate()) / 100;

    if (aDate < bDate) {
      return -1;
    } else if (aDate > bDate) {
      return 1;
    } else if (aDate == bDate) {
      if (
        categoriesList.indexOf(a.category) < categoriesList.indexOf(b.category)
      ) {
        return -1;
      } else if (
        categoriesList.indexOf(a.category) > categoriesList.indexOf(b.category)
      ) {
        return 1;
      } else if (
        categoriesList.indexOf(a.category) == categoriesList.indexOf(b.category)
      ) {
        return 0;
      }
    }
  });

  return holidaysListLocal;
}

const styles = StyleSheet({
  date: {
    fontSize: 16,
    top: "50%",
    color: "#666666",
  },
  name: {
    fontSize: 19,
    top: "50%",
  },
  angleRight: {
    right: "-45%",
    top: "-35%",
  },
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
});

function holidaysListScreen({ navigation, route }) {
  const { dictinory, language } = React.useContext(LanguageContext);
  const { holidays, refreshHolidays } = React.useContext(HolidaysContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const getBorderStyles = (item) => {
    var BorderStyles = {};
    if (
      item.date.day == new Date().getDate() &&
      item.date.month == new Date().getMonth() + 1
    ) {
      BorderStyles.borderColor = "#f7941d";
      BorderStyles.borderWidth = 3;
      if (holidaysList.indexOf(item) != 0) {
        BorderStyles.borderTopColor = "#d6d7da";
        BorderStyles.borderTopWidth = 1.5;
      }
      if (
        holidaysList[holidaysList.indexOf(item) + 1].date.day ==
          new Date().getDate() &&
        holidaysList[holidaysList.indexOf(item) + 1].date.month ==
          new Date().getMonth() + 1
      ) {
        BorderStyles.borderBottomWidth = 0;
      }
    } else if (holidaysList.indexOf(item) != 0) {
      BorderStyles = { borderTopColor: "#d6d7da", borderTopWidth: 1.5 };
    }
    return BorderStyles;
  };

  const refresh = async () => {
    setRefreshing(true);
    await refreshHolidays();
    setRefreshing(false);
  };

  const openHolidayScreen = (holiday) => {
    var parameters = { holiday };
    navigation.navigate("holidayScreen", parameters);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sortByDateAndCategory(
          route.params == undefined
            ? holidays
            : holidays.filter(
                (holiday) => holiday.category == route.params.category
              )
        )}
        renderItem={({ item }) => (
          <TouchableNativeFeedback onPress={() => openHolidayScreen(item)}>
            <View
              style={Object.assign({}, styles.listItem, getBorderStyles(item))}
            >
              <Text style={styles.name}>{item[language].name}</Text>
              <Text style={styles.date}>
                {item.date.day + " " + dictinory.months[item.date.month - 1]}
              </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#f7941d"]}
          />
        }
      />
    </View>
  );
}

export default holidaysListScreen;
