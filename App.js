console.disableYellowBox = true;

import * as React from "react";

import { AsyncStorage } from "react-native";

import { Icon } from "react-native-elements";

import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import * as Localization from "expo-localization";
//import * as Font from "expo-font";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const LanguageContext = React.createContext();
export const HolidaysContext = React.createContext();

const usDictinory = require("./assets/dictinories/us.json");
const ruDictinory = require("./assets/dictinories/ru.json");
const defaultDictinory = require("./assets/dictinories/default.json");

export async function updateHolidays() {
  try {
    var ruHolidays = await AsyncStorage.getItem("ruHolidays");
    ruHolidays =
      ruHolidays != null
        ? JSON.parse(ruHolidays)
        : require("./assets/holidays/ru.json");

    var usHolidays = await AsyncStorage.getItem("usHolidays");
    usHolidays =
      usHolidays != null
        ? JSON.parse(usHolidays)
        : require("./assets/holidays/us.json");

    var ruHolidaysFromNet = await (
      await fetch("http://holidays-app.github.io/holidays/ru.json")
    ).json();

    var usHolidaysFromNet = await (
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
  var ruHolidays = await AsyncStorage.getItem("ruHolidays");
  ruHolidays =
    ruHolidays != null
      ? JSON.parse(ruHolidays)
      : require("./assets/holidays/ru.json");

  var usHolidays = await AsyncStorage.getItem("usHolidays");
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
      await AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
    if (!(await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted)
      return;
  } else if (JSON.parse(allowNotifications) == false) {
    return;
  }

  const date = new Date();

  var notificationsList = await Notifications.getAllScheduledNotificationsAsync();

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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: holidaysList[index].name,
          body: holidaysList[index].message,
        },
        trigger: notificationDate,
      });
    }
  }
}

export const languageAndHolidaysPromise = new Promise(async (resolve) => {
  let language = await AsyncStorage.getItem("language");
  if (language == null) {
    language = Localization.locale == "ru-RU" ? "ru" : "us";
  }
  let holidays = await getHolidays(language);
  resolve([language, holidays]);
});

import holidaysListScreen from "./assets/screens/holidaysListScreen";
import holidayScreen from "./assets/screens/holidayScreen";
import categoriesScreen from "./assets/screens/categoriesScreen";
import settingsScreen from "./assets/screens/settingsScreen";
import settingsScreen_Language from "./assets/screens/settingsScreen_Language";
import settingsScreen_Notifications from "./assets/screens/settingsScreen_Notifications";

function firstScreen() {
  const { dictinory, language } = React.useContext(LanguageContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="upcomingHolidaysScreen"
        component={holidaysListScreen}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.upcomingHolidaysScreen.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="holidayScreen"
        component={holidayScreen}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.holidayScreen.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
    </Stack.Navigator>
  );
}

function secondScreen() {
  const { dictinory, language } = React.useContext(LanguageContext);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="categoriesScreen"
        component={categoriesScreen}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.categoriesScreen.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="categoryScreen"
        component={holidaysListScreen}
        options={({ route }) => ({
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.categories[route.params.category],
          headerTitleStyle: {
            fontSize: 21,
          },
        })}
      />
      <Stack.Screen
        name="holidayScreen"
        component={holidayScreen}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.holidayScreen.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
    </Stack.Navigator>
  );
}

function thirdScreen() {
  const { dictinory, language } = React.useContext(LanguageContext);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="settingsScreen"
        component={settingsScreen}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.settingsScreen.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="settingsScreen_Language"
        component={settingsScreen_Language}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: !language ? "" : dictinory.settingsScreen_Language.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="settingsScreen_Notifications"
        component={settingsScreen_Notifications}
        options={{
          headerBackTitle: !language ? "" : dictinory.backButtonText,
          title: "",
        }}
      />
    </Stack.Navigator>
  );
}

function App() {
  const [language, setLanguage] = React.useState();
  const languageContext = React.useMemo(
    () => ({
      get dictinory() {
        if (language == "ru") {
          return Object.assign({}, ruDictinory, defaultDictinory);
        } else {
          return Object.assign({}, usDictinory, defaultDictinory);
        }
      },
      language,
      setLanguage(value) {
        setLanguage(value);
      },
    }),
    [language]
  );

  const [holidays, setHolidays] = React.useState([]);
  const holidaysContext = React.useMemo(
    () => ({
      holidays,
      setHolidays(value) {
        setHolidays(value);
      },
    }),
    [holidays]
  );

  return (
    <LanguageContext.Provider value={languageContext}>
      <HolidaysContext.Provider value={holidaysContext}>
        <NavigationContainer>
          <Tab.Navigator
            tabBarOptions={{
              activeTintColor: "#f7941d",
              tabStyle: { justifyContent: "center" },
              showLabel: false,
              animationEnabled: true,
            }}
          >
            <Tab.Screen
              name="firstScreen"
              component={firstScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon
                    name="calendar"
                    type="foundation"
                    color={color}
                    size={38}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="secondScreen"
              component={secondScreen}
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
              name="thirdScreen"
              component={thirdScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon
                    name="cog"
                    type="font-awesome"
                    color={color}
                    size={29}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </HolidaysContext.Provider>
    </LanguageContext.Provider>
  );
}

export default App;
