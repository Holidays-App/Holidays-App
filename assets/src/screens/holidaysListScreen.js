import * as React from "react";
import {
  Text,
  View,
  TouchableNativeFeedback,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useScrollToTop } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  LanguageContext,
  HolidaysContext,
  getHolidaysAsync,
  updateHolidaysAsync,
  setHolidaysNotificationsAsync,
  ColorSheet,
  getHolidayUniverseDate,
} from "../utils";

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sortByDateAndCategory(holidaysList) {
  const categoriesList = [];
  for (const category in require("../../dictinories/us.json").categories) {
    categoriesList.push(category);
  }

  const holidaysListLocal = [...holidaysList];

  holidaysListLocal.sort((a, b) => {
    const aDate = getHolidayUniverseDate(a.date);

    const bDate = getHolidayUniverseDate(b.date);

    if (aDate < bDate) {
      return -1;
    }
    if (aDate > bDate) {
      return 1;
    }

    if (aDate == bDate) {
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
    color: ColorSheet.text.subtitle,
  },
  name: {
    fontSize: 19,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: ColorSheet.backgroundColor,
  },
  listItem: {
    flex: 1,
    width: "100%",
    height: 80,
    justifyContent: "center",
    paddingRight: "4%",
    paddingLeft: "3%",
  },
  noImportantHolidaysText: {
    top: "40%",
    textAlign: "center",
    fontSize: 19,
    color: ColorSheet.primaryColor,
    marginHorizontal: 20,
  },
});

const getBorderStyles = (holiday, holidays) => {
  let today = new Date();
  let BorderStyles = {};
  if (
    getHolidayUniverseDate(holiday.date).getDate() == today.getDate() &&
    getHolidayUniverseDate(holiday.date).getMonth() == today.getMonth()
  ) {
    BorderStyles.borderColor = ColorSheet.primaryColor;
    BorderStyles.borderWidth = 4;

    if (holidays.indexOf(holiday) != 0) {
      BorderStyles.borderTopWidth = 0;
    }

    if (
      holidays.indexOf(holiday) != holidays.length - 1 &&
      getHolidayUniverseDate(
        holidays[holidays.indexOf(holiday) + 1].date
      ).getDate() == today.getDate() &&
      getHolidayUniverseDate(
        holidays[holidays.indexOf(holiday) + 1].date
      ).getMonth() == today.getMonth()
    ) {
      BorderStyles.borderBottomWidth = 0;
    }
  }
  return BorderStyles;
};

class ShowingImportantHolidaysListHelper {
  constructor() {
    this.flatListVerticalOffset = 0;
    this.isOnlyImportantHolidays = false;
  }
  static helpers = {};
}

function holidaysListScreen({ navigation, route }) {
  const { dictinory, language } = React.useContext(LanguageContext);
  const { holidays, setHolidays } = React.useContext(HolidaysContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const [holidaysImportance, setHolidaysImportance] = React.useState({});

  const [isOnlyImportantHolidays, setIsOnlyImportantHolidays] =
    React.useState(false);

  const forceUpdate = useForceUpdate();

  const flatListRef = React.useRef(null);
  useScrollToTop(flatListRef);

  const refresh = async () => {
    setRefreshing(true);
    forceUpdate();
    await wait(randomInteger(400, 1000));
    setRefreshing(false);
  };

  const openHolidayScreen = (holiday) => {
    var parameters = { holiday, holidayLanguage: language };
    navigation.navigate("holidayScreen", parameters);
  };

  let isMount;
  React.useEffect(() => {
    isMount = true;
    let stop = false;

    if (!!route?.params?.useImportantHolidays) {
      ShowingImportantHolidaysListHelper.helpers[route.key] =
        new ShowingImportantHolidaysListHelper();
    }

    updateHolidaysAsync().then(async () => {
      let updatedHolidays = await getHolidaysAsync(language);
      if (
        JSON.stringify(updatedHolidays) != JSON.stringify(holidays) &&
        !stop
      ) {
        setHolidays(updatedHolidays);
      }
      setHolidaysNotificationsAsync(updatedHolidays, language);
    });

    const updateHolidaysImportance = async (holidaysImportanceJSON) => {
      if (
        holidaysImportanceJSON != JSON.stringify(holidaysImportance) &&
        !stop
      ) {
        setHolidaysImportance(JSON.parse(holidaysImportanceJSON));
      }
    };

    let unsubscribeFromImportanceHolidaysUpdate = () => {};
    AsyncStorage.getItem("holidaysImportance").then(
      async (holidaysImportanceJSON) => {
        if (!stop) {
          updateHolidaysImportance(holidaysImportanceJSON);

          unsubscribeFromImportanceHolidaysUpdate = navigation.addListener(
            "focus",
            async () => {
              updateHolidaysImportance(
                await AsyncStorage.getItem("holidaysImportance")
              );
            }
          );
        }
      }
    );

    return () => {
      stop = true;

      if (ShowingImportantHolidaysListHelper.helpers[route.key] != undefined) {
        delete ShowingImportantHolidaysListHelper.helpers[route.key];
      }

      unsubscribeFromImportanceHolidaysUpdate();
    };
  }, []);

  React.useEffect(() => {
    if (!isMount && navigation.getState().index != 0) {
      navigation.popToTop();
    }

    if (route?.params?.category == undefined) {
      navigation.setOptions({
        title: isOnlyImportantHolidays
          ? dictinory.upcomingHolidaysScreen.importantHolidaysTitle
          : dictinory.upcomingHolidaysScreen.title,
      });
    }

    if (!!route?.params?.useImportantHolidays) {
      let unsubscribeFromTabPress = navigation
        .getParent()
        .addListener("tabPress", (_e) => {
          let helper = ShowingImportantHolidaysListHelper.helpers[route.key];
          if (navigation.isFocused() && helper.flatListVerticalOffset == 0) {
            setIsOnlyImportantHolidays(!helper.isOnlyImportantHolidays);

            navigation.setOptions({
              title: !helper.isOnlyImportantHolidays
                ? dictinory.upcomingHolidaysScreen.importantHolidaysTitle
                : dictinory.upcomingHolidaysScreen.title,
            });

            helper.isOnlyImportantHolidays = !helper.isOnlyImportantHolidays;
          }
        });

      return unsubscribeFromTabPress;
    }
  }, [language]);

  let filteredHolidays = sortByDateAndCategory(
    holidays
      .filter(
        (holiday) =>
          route?.params?.category == undefined ||
          holiday.category == route?.params?.category
      )
      .filter(
        (holiday) =>
          !isOnlyImportantHolidays || !!holidaysImportance[holiday.id]
      )
  );

  return (
    <View style={styles.container}>
      {isOnlyImportantHolidays && filteredHolidays.length == 0 ? (
        <Text style={styles.noImportantHolidaysText}>
          {dictinory.upcomingHolidaysScreen.noImportantHolidaysInfo}
        </Text>
      ) : (
        <FlatList
          ref={flatListRef}
          onScroll={(event) => {
            if (!!route?.params?.useImportantHolidays) {
              ShowingImportantHolidaysListHelper.helpers[
                route.key
              ].flatListVerticalOffset = event.nativeEvent.contentOffset.y;
            }
          }}
          data={filteredHolidays}
          renderItem={({ item }) => {
            let date = getHolidayUniverseDate(item.date);
            return (
              <TouchableNativeFeedback onPress={() => openHolidayScreen(item)}>
                <View
                  style={{
                    ...styles.listItem,
                    ...getBorderStyles(item, filteredHolidays),
                  }}
                >
                  <Text
                    style={{
                      ...styles.name,
                      ...{
                        fontWeight: !!holidaysImportance[item.id]
                          ? "bold"
                          : "normal",
                      },
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      ...styles.date,
                      ...{
                        fontWeight: !!holidaysImportance[item.id]
                          ? "bold"
                          : "normal",
                      },
                    }}
                  >
                    {date.getDate() + " " + dictinory.months[date.getMonth()]}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            );
          }}
          keyExtractor={(_item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[ColorSheet.primaryColor]}
            />
          }
        />
      )}
    </View>
  );
}

export default holidaysListScreen;
