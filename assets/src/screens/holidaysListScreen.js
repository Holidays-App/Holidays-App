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
  SvgOrImageUri,
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

  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",

    minHeight: 80,
    paddingHorizontal: "4%",
    paddingVertical: "3%",
  },

  listItemTextContainer: {
    justifyContent: "center",
  },

  listItemIconContainer: {
    height: "100%",
    width: "18%",
    justifyContent: "center",
  },

  listItemIcon: {
    height: 60,
    width: 60,
  },

  noImportantHolidaysText: {
    top: "40%",
    textAlign: "center",
    fontSize: 19,
    color: ColorSheet.primaryColor,
    marginHorizontal: 20,
  },
});

function getBorderStyles(holiday, holidays) {
  let today = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  let todayGetTime = today.getTime();
  let holidayUniverseDate = getHolidayUniverseDate(holiday.date);

  let BorderStyles = {};

  if (holidayUniverseDate.getTime() == todayGetTime) {
    BorderStyles.borderColor = ColorSheet.primaryColor;
    BorderStyles.borderWidth = 4;

    let indexOfHoliday = holidays.indexOf(holiday);

    if (indexOfHoliday != 0) {
      BorderStyles.borderTopWidth = 0;
    }

    if (
      indexOfHoliday != holidays.length - 1 &&
      getHolidayUniverseDate(holidays[indexOfHoliday + 1].date).getTime() ==
        todayGetTime
    ) {
      BorderStyles.borderBottomWidth = 0;
    }
  }
  return BorderStyles;
}

function ListItem({
  holiday,
  isHolidayImportant,
  openHolidayScreen,
  holidaysList,
}) {
  const { dictinory } = React.useContext(LanguageContext);

  let date = getHolidayUniverseDate(holiday.date);

  return (
    <TouchableNativeFeedback onPress={openHolidayScreen}>
      <View
        style={{
          ...styles.listItemContainer,
          ...getBorderStyles(holiday, holidaysList),
        }}
      >
        <View
          style={{
            ...styles.listItemTextContainer,
            ...(holiday?.icon == null
              ? { width: "100%" }
              : {
                  width: "80%",
                  paddingRight: "1%",
                }),
          }}
        >
          <Text
            style={{
              ...styles.name,
              ...{
                fontWeight: isHolidayImportant ? "bold" : "normal",
              },
            }}
          >
            {holiday.name}
          </Text>
          <Text
            style={{
              ...styles.date,
              ...{
                fontWeight: isHolidayImportant ? "bold" : "normal",
              },
            }}
          >
            {date.getDate() + " " + dictinory.months[date.getMonth()]}
          </Text>
        </View>
        {holiday?.icon == null ? null : (
          <View style={styles.listItemIconContainer}>
            <SvgOrImageUri
              type={holiday?.icon?.type}
              uri={`http://holidays-app.github.io/holidays/icons/${holiday?.icon?.fileName}`}
              height={styles.listItemIcon.height}
              width={styles.listItemIcon.width}
            />
          </View>
        )}
      </View>
    </TouchableNativeFeedback>
  );
}

class ShowingImportantHolidaysListHelper {
  constructor() {
    this.flatListVerticalOffset = 0;
    this.isOnlyImportantHolidays = false;
  }
  static helpers = {};
}

function holidaysListScreen({ navigation, route }) {
  const { dictinory, language } = React.useContext(LanguageContext);
  const { holidays } = React.useContext(HolidaysContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const [holidaysImportance, setHolidaysImportance] = React.useState(
    route?.params?.holidaysImportance != null
      ? route?.params?.holidaysImportance
      : {}
  );

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

    const updateHolidaysImportance = async (holidaysImportanceJSON) => {
      if (
        holidaysImportanceJSON != null &&
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
            return (
              <ListItem
                holiday={item}
                isHolidayImportant={!!holidaysImportance[item.id]}
                holidaysList={filteredHolidays}
                openHolidayScreen={() => {
                  openHolidayScreen(item);
                }}
              />
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
