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

    if (JSON.stringify(ruHolidaysFromNet) != JSON.stringify(ruHolidays)) {
      await AsyncStorage.setItem(
        "ruHolidays",
        JSON.stringify(ruHolidaysFromNet)
      );
    }

    if (JSON.stringify(usHolidaysFromNet) != JSON.stringify(usHolidays)) {
      await AsyncStorage.setItem(
        "usHolidays",
        JSON.stringify(usHolidaysFromNet)
      );
    }
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
    month - 1,
    day,
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
  let scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  let oldHolidayNotification = scheduledNotifications.find(
    (e) => e.content.title == title
  );

  if (oldHolidayNotification !== undefined) {
    let oldNotificationId = oldHolidayNotification.identifier;
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

  let notesJSON = await AsyncStorage.getItem("notes");
  let notes = JSON.parse(notesJSON);
  let holidaysWithNotesIds;
  if (notes == null) {
    holidaysWithNotesIds = [];
  } else {
    holidaysWithNotesIds = Object.keys(notes);
  }

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
      body: getHolidayNotificationText(
        holiday.message,
        notes != null ? notes[holiday.id] : null
      ),
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

  let notesJSON = await AsyncStorage.getItem("notes");
  let notes = JSON.parse(notesJSON);
  let holidaysWithNotesIds;
  if (notes == null) {
    holidaysWithNotesIds = [];
  } else {
    holidaysWithNotesIds = Object.keys(notes);
  }

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
            getHolidayNotificationText(
              holiday.message,
              notes != null ? notes[holiday.id] : null
            )
      )
    ) {
      await cancelNotificationByTitleIfExist(holiday.name);

      Notifications.scheduleNotificationAsync({
        content: {
          title: holiday.name,
          body: getHolidayNotificationText(
            holiday.message,
            notes != null ? notes[holiday.id] : null
          ),
        },
        trigger: notificationDate,
      });
    }
  }
}

export const ColorSheet = {
  primaryColor: "#ac0735",
  alternativeColor: "#F5C684",
  okColor: "#34a853",
  backgroundColor: "#ffffff",
  text: {
    main: "#000000",
    subtitle: "#666666",
  },
};

export const CustomFonts = {
  RedHatDisplay_Bold: require("../fonts/RedHatDisplay-Bold.ttf"),
};
