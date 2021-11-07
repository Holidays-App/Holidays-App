import * as React from "react";

import { Image } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SvgCss } from "react-native-svg";

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

function julianDateToNormal(year, month, day) {
  var x = Math.floor((14 - month) / 12);
  var y = year + 4800 - x;
  var z = month - 3 + 12 * x;

  var n =
    day + Math.floor((153 * z + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;

  var a = n + 32044;
  var b = Math.floor((4 * a + 3) / 146097);
  var c = a - Math.floor((146097 * b) / 4);
  var d = Math.floor((4 * c + 3) / 1461);
  var e = c - Math.floor((1461 * d) / 4);
  var f = Math.floor((5 * e + 2) / 153);

  var D = e + 1 - Math.floor((153 * f + 2) / 5);
  var M = f + 3 - 12 * Math.round(f / 10);
  var Y = 100 * b + d - 4800 + Math.floor(f / 10);

  return new Date(Y, M - 1, D);
}

// Holidays block

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

function getEasterDate(year, orthodox = false) {
  let a = year % 19;
  let b = year % 4;
  let c = year % 7;

  let k = Math.floor(year / 100);
  let p = Math.floor((13 + 8 * k) / 25);
  let q = Math.floor(k / 4);

  let M = orthodox ? 15 : (15 - p + k - q) % 30;
  let N = orthodox ? 6 : (4 + k - q) % 7;

  let d = (19 * a + M) % 30;
  let e = (2 * b + 4 * c + 6 * d + N) % 7;

  let day;
  if (d == 29 && e == 6) {
    day = 19;
  } else if (d == 28 && e == 6 && (11 * M + 11) % 30 < 19) {
    day = 18;
  } else {
    day = 22 + d + e;
  }

  let date;

  if (orthodox) {
    let helpDate = new Date(year, 2, day);
    date = julianDateToNormal(
      helpDate.getFullYear(),
      helpDate.getMonth() + 1,
      helpDate.getDate()
    );
  } else {
    date = new Date(year, 2, day);
  }

  return date;
}

function getMaslenitsaDate(year) {
  let result = getEasterDate(year, true);
  result.setDate(result.getDate() - 49);
  return result;
}

function getDayOfWeekInMonth(year, month, dayOfWeek, number) {
  month--; // to js format

  let date1;
  let difference;

  let jsDayOfWeek = dayOfWeek % 7;

  if (number < 0) {
    date1 = new Date(year, month + 1, 0);

    difference = (date1.getDay() - jsDayOfWeek + 7) % 7;

    return new Date(
      year,
      date1.getMonth(),
      date1.getDate() + 7 * (number + 1) - difference
    );
  } else if (number > 0) {
    date1 = new Date(year, month);

    difference = (jsDayOfWeek - date1.getDay() + 7) % 7;

    return new Date(
      year,
      date1.getMonth(),
      date1.getDate() + 7 * (number - 1) + difference
    );
  }
}

function getDayInYear(year, day) {
  return new Date(year, 0, day);
}

export function getHolidayUniverseDate(customFormatDate) {
  let result;
  let dateConfig;

  let today = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  switch (customFormatDate.type) {
    case "еaster":
      result = getEasterDate(today.getFullYear());
      if (result < today) {
        result = getEasterDate(today.getFullYear() + 1);
      }
      break;

    case "orthodoxEaster":
      result = getEasterDate(today.getFullYear(), true);
      if (result < today) {
        result = getEasterDate(today.getFullYear() + 1, true);
      }
      break;

    case "maslenitsa":
      result = getMaslenitsaDate(today.getFullYear());
      if (result < today) {
        result = getMaslenitsaDate(today.getFullYear(+1));
      }
      break;

    case "mondayOfButterWeek":
      result = getMaslenitsaDate(today.getFullYear());
      result.setDate(result.getDate() - 6);

      if (result < today) {
        result = getMaslenitsaDate(today.getFullYear() + 1);
        result.setDate(result.getDate() - 6);
      }

      break;

    case "dayOfWeekInMonth":
      dateConfig = [
        customFormatDate.month,
        customFormatDate.dayOfWeek,
        customFormatDate.number,
      ];

      result = getDayOfWeekInMonth(today.getFullYear(), ...dateConfig);

      if (result < today) {
        result = getDayOfWeekInMonth(today.getFullYear() + 1, ...dateConfig);
      }
      break;

    case "dayInYear":
      result = getDayInYear(today.getFullYear(), customFormatDate.day);

      if (result < today) {
        result = getDayInYear(today.getFullYear() + 1, customFormatDate.day);
      }
      break;

    default:
      dateConfig = [customFormatDate.month - 1, customFormatDate.day];

      result = new Date(today.getFullYear(), ...dateConfig);
      if (result < today) {
        result = new Date(today.getFullYear() + 1, ...dateConfig);
      }
      break;
  }
  return result;
}

// Notifications block

function getHolidayNotificationDate(date) {
  let holidayDate = getHolidayUniverseDate(date);

  let notificationDate = new Date(
    holidayDate.getFullYear(),
    holidayDate.getMonth(),
    holidayDate.getDate(),
    9
  );

  //return { seconds: 2 };

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
      defaultResult: holiday.defaultNotify,
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

  let notificationDate = getHolidayNotificationDate(holiday.date);

  Notifications.scheduleNotificationAsync({
    content: {
      title: holiday.name,
      body: notificationText,
    },
    trigger: notificationDate,
  });
}

export async function setHolidaysNotificationsAsync(holidaysList, language) {
  console.log(1);
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
      (holidaysNotificationsRules[holiday.id] == null
        ? holiday.defaultNotify
        : holidaysNotificationsRules[holiday.id]) &&
      !scheduledNotifications.some(
        (notificationRequest) =>
          notificationRequest.content.title == holiday.name &&
          notificationRequest.content.body == notificationText
      )
    ) {
      await cancelNotificationByTitleIfExist(holiday.name);

      let notificationDate = getHolidayNotificationDate(holiday.date);

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

// Cache

class RequestCacheController {
  constructor(cacheGroupId) {
    this.groupId = cacheGroupId;
  }

  async _loadGroupKeys() {
    let allKeys = await AsyncStorage.getAllKeys();
    let groupKeys = allKeys.filter((key) =>
      key.startsWith(`cacheController/${this.groupId}/`)
    );
    this.groupKeys = groupKeys;
  }

  async getRequestCache(uri) {
    return await AsyncStorage.getItem(`cacheController/${this.groupId}/${uri}`);
  }

  async setRequestCache(uri, value) {
    return await AsyncStorage.setItem(
      `cacheController/${this.groupId}/${uri}`,
      value
    );
  }

  async makeRequestAndCacheIt(uri) {
    let savedValue = await AsyncStorage.getItem(
      `cacheController/${this.groupId}/${uri}`
    );
    let netValue = await (await fetch(uri)).text();

    if (savedValue != netValue) {
      this.setRequestCache(uri, netValue);
    }

    return netValue;
  }

  async updateAllGroupCache() {
    await this._loadGroupKeys();
    let uriStartIndex = `cacheController/${this.groupId}/`.length;
    for (groupKey in this.groupKeys) {
      let uri = groupKey.substring(uriStartIndex);
      this.makeRequestAndCacheIt(uri);
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

// React elemnts block

var fastSvgCache = new RequestCacheController("fastSvg");

function FastSvgCssUri({ uri, height, width }) {
  const [svgXml, setSvgXml] = React.useState(null);

  React.useEffect(() => {
    let stop = false;

    fastSvgCache.getRequestCache(uri).then((savedValue) => {
      if (stop) return;

      setSvgXml(savedValue);

      fastSvgCache.makeRequestAndCacheIt(uri).then((netValue) => {
        if (netValue != savedValue && !stop) {
          setSvgXml(netValue);
        }
      });
    });

    return () => {
      stop = true;
    };
  }, []);

  return <SvgCss xml={svgXml} width={width} height={height} />;
}

export function SvgOrImageUri({ uri, type, height, width }) {
  return type == "svg" ? (
    <FastSvgCssUri width={width} height={height} uri={uri} />
  ) : (
    <Image
      source={{ uri }}
      style={{ height, width }}
      resizeMode={"stretch"}
      fadeDuration={0}
    />
  );
}

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
  RedHatDisplay_Light: require("../fonts/RedHatDisplay-Light.ttf"),
};
