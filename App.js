import * as React from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Icon } from "react-native-elements";

import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as Permissions from "expo-permissions";
import * as Localization from "expo-localization";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const usDictinory = require("./assets/dictinories/us.json");
const ruDictinory = require("./assets/dictinories/ru.json");
const defaultDictinory = require("./assets/dictinories/default.json");

export const LanguageContext = React.createContext();
export const HolidaysContext = React.createContext();

export async function updateHolidays() {
  try {
    let [[, ruHolidays], [, usHolidays]] = await AsyncStorage.multiGet([
      "ruHolidays",
      "usHolidays",
    ]);

    ruHolidays =
      ruHolidays != null
        ? JSON.parse(ruHolidays)
        : require("./assets/holidays/ru.json");

    usHolidays =
      usHolidays != null
        ? JSON.parse(usHolidays)
        : require("./assets/holidays/us.json");

    let ruHolidaysFromNet = await (
      await fetch("http://holidays-app.github.io/holidays/ru.json")
    ).json();

    let usHolidaysFromNet = await (
      await fetch("http://holidays-app.github.io/holidays/us.json")
    ).json();

    if (JSON.stringify(ruHolidaysFromNet) != JSON.stringify(ruHolidays))
      await AsyncStorage.setItem(
        "ruHolidays",
        JSON.stringify(ruHolidaysFromNet)
      );

    if (JSON.stringify(usHolidaysFromNet) != JSON.stringify(usHolidays))
      await AsyncStorage.setItem(
        "usHolidays",
        JSON.stringify(usHolidaysFromNet)
      );
  } finally {
    return;
  }
}

export async function getHolidays(language) {
  let [[, ruHolidays], [, usHolidays]] = await AsyncStorage.multiGet([
    "ruHolidays",
    "usHolidays",
  ]);

  ruHolidays =
    ruHolidays != null
      ? JSON.parse(ruHolidays)
      : require("./assets/holidays/ru.json");

  usHolidays =
    usHolidays != null
      ? JSON.parse(usHolidays)
      : require("./assets/holidays/us.json");

  return language == "ru" ? ruHolidays : usHolidays;
}

export async function setNotifications(holidaysList) {
  var allowNotifications = await AsyncStorage.getItem("allowNotifications");

  if (allowNotifications == null || JSON.parse(allowNotifications) == true) {
    if (allowNotifications == null)
      AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
    if (!(await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted)
      return;
  } else if (JSON.parse(allowNotifications) == false) {
    return;
  }

  const date = new Date();

  var notificationsList =
    await Notifications.getAllScheduledNotificationsAsync();

  holidaysList = holidaysList.filter(
    (holiday) => holiday.message != "" && holiday.name != ""
  );

  for (let index = 0; index < holidaysList.length; index++) {
    var notificationDate;
    if (
      holidaysList[index].date.day / 100 + holidaysList[index].date.month >
      date.getMonth() + 1 + date.getDate() / 100
    ) {
      notificationDate = new Date(
        date.getFullYear(),
        holidaysList[index].date.month - 1,
        holidaysList[index].date.day,
        9,
        2
      );
    } else {
      notificationDate = new Date(
        date.getFullYear() + 1,
        holidaysList[index].date.month - 1,
        holidaysList[index].date.day,
        9,
        2
      );
    }

    if (
      !notificationsList.some(
        (element) =>
          element.content.title == holidaysList[index].name &&
          element.content.body == holidaysList[index].message &&
          element.trigger.value == notificationDate.getTime()
      )
    ) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: holidaysList[index].name,
          body: holidaysList[index].message,
        },
        trigger: notificationDate,
      });
    }
  }
}

import holidaysListScreen from "./assets/screens/holidaysListScreen";
import holidayScreen from "./assets/screens/holidayScreen";
import categoriesScreen from "./assets/screens/categoriesScreen";
import settingsScreen from "./assets/screens/settingsScreen";
import settingsScreen_Language from "./assets/screens/settingsScreen_Language";
import firstLaunchScreen from "./assets/screens/firstLaunchScreen";

function firstTabScreen() {
  const { dictinory } = React.useContext(LanguageContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: dictinory.backButtonText,
        headerTitleAlign: "center",
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="upcomingHolidaysScreen"
        component={holidaysListScreen}
        options={{
          title: dictinory.upcomingHolidaysScreen.title,
        }}
      />
      <Stack.Screen
        name="holidayScreen"
        component={holidayScreen}
        options={{
          title: dictinory.holidayScreen.title,
        }}
      />
    </Stack.Navigator>
  );
}

function secondTabScreen() {
  const { dictinory } = React.useContext(LanguageContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: dictinory.backButtonText,
        headerTitleAlign: "center",
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="categoriesScreen"
        component={categoriesScreen}
        options={{
          title: dictinory.categoriesScreen.title,
        }}
      />
      <Stack.Screen
        name="categoryScreen"
        component={holidaysListScreen}
        options={({ route }) => ({
          title: dictinory.categories[route.params.category],
        })}
      />
      <Stack.Screen
        name="holidayScreen"
        component={holidayScreen}
        options={{
          title: dictinory.holidayScreen.title,
        }}
      />
    </Stack.Navigator>
  );
}

function thirdTabScreen() {
  const { dictinory } = React.useContext(LanguageContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: dictinory.backButtonText,
        headerTitleAlign: "center",
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="settingsScreen"
        component={settingsScreen}
        options={{
          title: dictinory.settingsScreen.title,
        }}
      />
      <Stack.Screen
        name="settingsScreen_Language"
        component={settingsScreen_Language}
        options={{
          title: dictinory.settingsScreen_Language.title,
        }}
      />
    </Stack.Navigator>
  );
}

function mainScreen() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "#AC0735",
        tabStyle: { justifyContent: "center" },
        showLabel: false,
      }}
    >
      <Tab.Screen
        name="firstTabScreen"
        component={firstTabScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" type="foundation" color={color} size={38} />
          ),
        }}
      />
      <Tab.Screen
        name="secondTabScreen"
        component={secondTabScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon
              name="align-justify"
              type="foundation"
              color={color}
              size={32}
            />
          ),
        }}
      />
      <Tab.Screen
        name="thirdTabScreen"
        component={thirdTabScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="cog" type="font-awesome" color={color} size={29} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  const [language, setLanguage] = React.useState(null);
  const languageContext = React.useMemo(
    () => ({
      get dictinory() {
        if (language == "ru") {
          return mergeDeep({}, ruDictinory, defaultDictinory);
        } else {
          return mergeDeep({}, usDictinory, defaultDictinory);
        }
      },
      language,
      setLanguage(value) {
        setLanguage(value);
      },
    }),
    [language]
  );

  const [holidays, setHolidays] = React.useState(null);
  const holidaysContext = React.useMemo(
    () => ({
      holidays,
      setHolidays(value) {
        setHolidays(value);
      },
    }),
    [holidays]
  );

  const [alreadyLaunched, setAlreadyLaunched] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();

      //  await AsyncStorage.clear();

      let [[, language], [, alreadyLaunched]] = await AsyncStorage.multiGet([
        "language",
        "alreadyLaunched",
      ]);

      if (language == null) {
        language =
          Localization.locale == "ru-RU" || Localization.locale == "ru"
            ? "ru"
            : "us";
      }
      setLanguage(language);

      if (alreadyLaunched == null) {
        setAlreadyLaunched(false);
      } else {
        setAlreadyLaunched(true);
        let holidays = await getHolidays(language);
        setHolidays(holidays);
      }
      await SplashScreen.hideAsync();
    })();
  }, []);

  return (
    <LanguageContext.Provider value={languageContext}>
      <HolidaysContext.Provider value={holidaysContext}>
        {language == null ||
        (alreadyLaunched === false ? false : holidays == null) ? null : (
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={
                alreadyLaunched ? "mainScreen" : "firstLaunchScreen"
              }
              screenOptions={{
                headerShown: false,
                animationEnabled: false,
              }}
            >
              <Stack.Screen
                name="firstLaunchScreen"
                component={firstLaunchScreen}
              />
              <Stack.Screen name="mainScreen" component={mainScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </HolidaysContext.Provider>
    </LanguageContext.Provider>
  );
}

export default App;
