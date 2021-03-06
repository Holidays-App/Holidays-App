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

import { useScrollToTop } from "@react-navigation/native";

import {
  LanguageContext,
  HolidaysContext,
  getHolidays,
  updateHolidays,
  setNotifications
} from "../../App";

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sortByDateAndCategory(holidaysList) {
  const date = new Date();
  const categoriesList = [];
  for (const category in require('../dictinories/us.json').categories) {
    categoriesList.push(category);
  }

  const holidaysListLocal = holidaysList;

  holidaysListLocal.sort((a, b) => {
    const aDate = a.date.month < date.getMonth() + 1
      || (a.date.month == date.getMonth() + 1 && a.date.day < date.getDate())
      ? a.date.month
          - (date.getMonth() + 1)
          + (a.date.day - date.getDate()) / 100
          + 12.5
      : a.date.month
          - (date.getMonth() + 1)
          + (a.date.day - date.getDate()) / 100;

    const bDate = b.date.month < date.getMonth() + 1
      || (b.date.month == date.getMonth() + 1 && b.date.day < date.getDate())
      ? b.date.month
          - (date.getMonth() + 1)
          + (b.date.day - date.getDate()) / 100
          + 12.5
      : b.date.month
          - (date.getMonth() + 1)
          + (b.date.day - date.getDate()) / 100;

    if (aDate < bDate) {
      return -1;
    } if (aDate > bDate) {
      return 1;
    } if (aDate == bDate) {
      if (
        categoriesList.indexOf(a.category) < categoriesList.indexOf(b.category)
      ) {
        return -1;
      } if (
        categoriesList.indexOf(a.category) > categoriesList.indexOf(b.category)
      ) {
        return 1;
      } if (
        categoriesList.indexOf(a.category) == categoriesList.indexOf(b.category)
      ) {
        return 0;
      }
    }
  });

  return holidaysListLocal;
}

function randomInteger(min, max) {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function useForceUpdate() {
  const [value, setValue] = React.useState(0);
  return () => setValue((value) => ++value);
}

const styles = StyleSheet.create({
  date: {
    fontSize: 16,
    top: '50%',
    color: '#666666',
  },
  name: {
    fontSize: 19,
    top: '50%',
  },
  angleRight: {
    right: '-45%',
    top: '-35%',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    //    backgroundColor: "#ffffff",
  },
  listItem: {
    flex: 1,
    width: '100%',
    height: 80,
    justifyContent: 'center',
    paddingRight: '4%',
    paddingLeft: '3%',
  },
});

function holidaysListScreen({ navigation, route }) {
  let filteredHolidays;

  const { dictinory, language } = React.useContext(LanguageContext);
  const { holidays, setHolidays } = React.useContext(HolidaysContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const forceUpdate = useForceUpdate();

  const flatListRef = React.useRef(null);
  useScrollToTop(flatListRef);

  const getBorderStyles = (item) => {
    let BorderStyles = {};
    if (
      item.date.day == new Date().getDate()
      && item.date.month == new Date().getMonth() + 1
    ) {
      BorderStyles.borderColor = '#f7941d';
      BorderStyles.borderWidth = 3;
      if (filteredHolidays.indexOf(item) != 0) {
        BorderStyles.borderTopColor = '#d6d7da';
        BorderStyles.borderTopWidth = 1.5;
      }
      if (
        filteredHolidays.indexOf(item) != filteredHolidays.length - 1
        && filteredHolidays[filteredHolidays.indexOf(item) + 1].date.day
          == new Date().getDate()
        && filteredHolidays[filteredHolidays.indexOf(item) + 1].date.month
          == new Date().getMonth() + 1
      ) {
        BorderStyles.borderBottomWidth = 0;
      }
    } else if (filteredHolidays.indexOf(item) != 0) {
      BorderStyles = { borderTopColor: '#d6d7da', borderTopWidth: 1.5 };
    }
    return BorderStyles;
  };

  const refresh = async () => {
    setRefreshing(true);
    forceUpdate();
    await wait(randomInteger(400, 1000));
    setRefreshing(false);
  };

  const openHolidayScreen = (holiday) => {
    var parameters = { holiday };
    navigation.navigate("holidayScreen", parameters);
  };

  React.useEffect(() => {
    if (route.params == undefined) {
      (async () => {
        setNotifications(holidays);

        updateHolidays().then(async () => {
          let updatedHolidays = await getHolidays(language);
          if (JSON.stringify(updatedHolidays) != JSON.stringify(holidays)) {
            setHolidays(updatedHolidays);
            setNotifications(updatedHolidays);
          }
        });
      })();
    }
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={
          (filteredHolidays = sortByDateAndCategory(
            route.params == undefined
              ? holidays
              : holidays.filter(
                  (holiday) => holiday.category == route.params.category
                )
          ))
        }
        renderItem={({ item }) => {
          return (
            <TouchableNativeFeedback onPress={() => openHolidayScreen(item)}>
              <View
                style={Object.assign(
                  {},
                  styles.listItem,
                  getBorderStyles(item)
                )}
              >
                <Text style={styles.name}>{item.name}</Text>
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
          );
        }}
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
