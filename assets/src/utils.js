import * as React from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

export const LanguageContext = React.createContext();
export const HolidaysContext = React.createContext();

// Functional block

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
    date.getFullYear() + (nextYear ? 1 : 0),
    month - 1,
    day,
    9
  );

  return notificationDate;
}

function getHolidayNotificationText({ message, note, language }) {
  let finalNoteText = !note
    ? ""
    : getDictinoryByLanguage(language).reminderText + " " + note;

  let finalMessage;
  {
    if (message == "") {
      finalMessage = "";
    } else {
      let s = message.substr(0, 128);
      let matches = s.match(/[?!.]/g);

      if (matches == null) {
        s = "";
      } else {
        s = s.substr(0, s.lastIndexOf(matches[matches.length - 1]) + 1);
      }

      finalMessage = s;
    }
  }

  return (
    finalMessage +
    (finalNoteText != "" && finalMessage != "" ? "\n" : "") +
    finalNoteText
  );
}

export async function cancelNotificationByTitleIfExist(title) {
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

export async function setHolidayNotificationAsync(holiday, language) {
  if (!(await allowsNotificationsAsync())) return;

  await cancelNotificationByTitleIfExist(holiday.name);

  if (
    !ObjectFormatASDW.getData({
      dataName: "holidaysNotificationsRules",
      key: holiday.id,
      defaultResult: true,
    })
  ) {
    return;
  }

  let notesJSON = await AsyncStorage.getItem("notes");
  let notes = notesJSON == null ? {} : JSON.parse(notesJSON);

  let notificationText = getHolidayNotificationText({
    message: holiday.message,
    note: notes[holiday.id],
    language,
  });

  if (notificationText == "") {
    return;
  }

  let notificationDate = getHolidayNotificationDate({
    month: holiday.date.month,
    day: holiday.date.day,
  });

  Notifications.scheduleNotificationAsync({
    content: {
      title: holiday.name,
      body: notificationText,
    },
    trigger: notificationDate,
  });
}

export async function setHolidaysNotificationsAsync(holidaysList, language) {
  if (!(await allowsNotificationsAsync())) return;

  let scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  let notesJSON = await AsyncStorage.getItem("notes");
  let notes = notesJSON == null ? {} : JSON.parse(notesJSON);

  let holidaysNotificationsRulesJSON = await AsyncStorage.getItem(
    "holidaysNotificationsRules"
  );
  let holidaysNotificationsRules =
    holidaysNotificationsRulesJSON == null
      ? {}
      : JSON.parse(holidaysNotificationsRulesJSON);

  for (let index = 0; index < holidaysList.length; index++) {
    let holiday = holidaysList[index];

    let notificationText = getHolidayNotificationText({
      message: holiday.message,
      note: notes[holiday.id],
      language,
    });

    if (
      notificationText != "" &&
      holidaysNotificationsRules[holiday.id] != false &&
      !scheduledNotifications.some(
        (notificationRequest) =>
          notificationRequest.content.title == holiday.name &&
          notificationRequest.content.body == notificationText
      )
    ) {
      await cancelNotificationByTitleIfExist(holiday.name);

      let notificationDate = getHolidayNotificationDate({
        month: holiday.date.month,
        day: holiday.date.day,
      });

      Notifications.scheduleNotificationAsync({
        content: {
          title: holiday.name,
          body: notificationText,
        },
        trigger: notificationDate,
      });
    }
  }
}

// Object Format Async Storage Data Worker

export var ObjectFormatASDW = {
  _sessions: {},
  getData: async ({ dataName, key, defaultResult = null }) => {
    let dataJSON = await AsyncStorage.getItem(dataName);

    if (dataJSON == null) {
      return defaultResult;
    } else {
      let data = JSON.parse(dataJSON);
      if (Object.keys(data).includes(key.toString())) {
        return data[key];
      } else {
        return defaultResult;
      }
    }
  },
  setData: async ({
    dataName,
    key,
    dataForSave,
    sessionId = "",
    delay = 0,
    onSuccess = (_isValueChanged) => {},
  }) => {
    if (
      sessionId != "" &&
      Object.keys(ObjectFormatASDW._sessions).includes(sessionId)
    ) {
      clearTimeout(ObjectFormatASDW._sessions[sessionId]);
    }

    ObjectFormatASDW._sessions[sessionId] = setTimeout(async () => {
      let dataJSON = await AsyncStorage.getItem(dataName);

      let data;

      if (dataJSON == null) {
        data = {};
      } else {
        data = JSON.parse(dataJSON);
      }

      let isValueChanged = false;

      if (data[key] != dataForSave) {
        data[key] = dataForSave;
        isValueChanged = true;
      }

      await AsyncStorage.setItem(dataName, JSON.stringify(data));

      onSuccess(isValueChanged);
    }, delay);
  },
};

// Dictionaries

export const Dictionaries = {
  usDictinory: require("../dictinories/us.json"),
  ruDictinory: require("../dictinories/ru.json"),
  defaultDictinory: require("../dictinories/default.json"),
};

export function getDictinoryByLanguage(language) {
  return mergeDeep(
    {},
    language == "ru" ? Dictionaries.ruDictinory : Dictionaries.usDictinory,
    Dictionaries.defaultDictinory
  );
}

// Global styles

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
