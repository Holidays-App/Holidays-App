import * as React from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

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
        : require("../holidays/ru.json");

    usHolidays =
      usHolidays != null
        ? JSON.parse(usHolidays)
        : require("../holidays/us.json");

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
      : require("../holidays/ru.json");

  usHolidays =
    usHolidays != null
      ? JSON.parse(usHolidays)
      : require("../holidays/us.json");

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
