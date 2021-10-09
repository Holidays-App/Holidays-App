import * as React from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

export const LanguageContext = React.createContext();
export const HolidaysContext = React.createContext();

//Holidays block

export async function updateHolidaysAsync() {
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

export async function getHolidaysAsync(language) {
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

// Notifications block

function getHolidayNotificationDate({ month, day }) {
  const date = new Date();
  let holidayDate = new Date(date.getFullYear(), month - 1, day, 9);

  let nextYear = holidayDate.getTime() < date.getTime();

  let notificationDate = new Date(
    date.getFullYear() + nextYear ? 1 : 0,
    holiday.date.month - 1,
    holiday.date.day,
    9
  );

  return notificationDate;
}

function getHolidayNotificationText(message, note = "") {
  return (
    (message != "" ? message + "\n" : "") +
    (note != "" && note != null ? "Напоминание: " + note : "")
  );
}

async function cancelNotificationByTitleIfExist(title) {
  let oldHolidayNotificationIndex = notificationsList.find(
    (e) => e.content.title == title
  );

  if (oldHolidayNotificationIndex !== undefined) {
    let oldNotificationId =
      notificationsList[oldHolidayNotificationIndex].identifier;
    await Notifications.cancelScheduledNotificationAsync(oldNotificationId);
  }
}

export async function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
}

export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function canselAllNotificationsAsync() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setHolidayNotificationAsync(holiday) {
  let allowNotifications = await allowsNotificationsAsync();
  if (!allowNotifications) return;

  let notes = JSON.parse(await AsyncStorage.getItem("notes"));
  let holidaysWithNotesIds = Object.keys(notes);

  if (holiday.message == "" && !holidaysWithNotesIds.includes(holiday.id)) {
    return;
  }

  let notificationDate = getHolidayNotificationDate({
    month: holiday.date.month,
    day: holiday.date.day,
  });

  await cancelNotificationByTitleIfExist(holiday.name);

  Notifications.scheduleNotificationAsync({
    content: {
      title: holiday.name,
      body: getHolidayNotificationText(holiday.message, notes[holiday.id]),
    },
    trigger: notificationDate,
  });
}

export async function setHolidaysNotificationsAsync(holidaysList) {
  let allowNotifications = await allowsNotificationsAsync();
  if (!allowNotifications) return;

  let scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  let holidaysWithMessages = holidaysList.filter(
    (holiday) => holiday.message != ""
  );

  let notes = JSON.parse(await AsyncStorage.getItem("notes"));
  let holidaysWithNotesIds = Object.keys(notes);

  let holidaysWithNotes = holidaysList.filter((holiday) =>
    holidaysWithNotesIds.includes(holiday.id)
  );

  holidaysList = [...new Set([...holidaysWithMessages, ...holidaysWithNotes])];

  for (
    let holidayIndex = 0;
    holidayIndex < holidaysList.length;
    holidayIndex++
  ) {
    let holiday = holidaysList[holidayIndex];

    let notificationDate = getHolidayNotificationDate({
      month: holiday.date.month,
      day: holiday.date.day,
    });

    if (
      !scheduledNotifications.some(
        (e) =>
          e.content.title == holiday.name &&
          e.content.body ==
            getHolidayNotificationText(holiday.message, notes[holiday.id])
      )
    ) {
      await cancelNotificationByTitleIfExist(holiday.name);

      Notifications.scheduleNotificationAsync({
        content: {
          title: holiday.name,
          body: getHolidayNotificationText(holiday.message, notes[holiday.id]),
        },
        trigger: notificationDate,
      });
    }
  }
}
