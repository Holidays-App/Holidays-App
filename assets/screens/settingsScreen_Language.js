import * as React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  AsyncStorage,
  Dimensions,
} from "react-native";

import * as Notifications from "expo-notifications";

import {
  LanguageContext,
  HolidaysContext,
  setNotifications,
  getHolidays,
} from "../../App";

const resurces = {
  usFlag: require("../textures/usFlag.png"),
  usFlagSelect: require("../textures/usFlagSelect.png"),
  ruFlag: require("../textures/ruFlag.png"),
  ruFlagSelect: require("../textures/ruFlagSelect.png"),
};

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    top: screenWidth / 5,
  },
  ruFlagButton: {
    marginLeft: screenWidth / 5,
  },
  usFlagButton: {
    marginRight: screenWidth / 5,
  },
  flagImage: {
    width: screenWidth / 5,
    height: screenWidth / 5,
  },
  languageName: {
    fontSize: 21,
    textAlign: "center",
    top: 15,
  },
});

function settingsScreen_Language() {
  var notificationsTimerId;

  const { dictinory, language, setLanguage } = React.useContext(
    LanguageContext
  );
  const { setHolidays } = React.useContext(HolidaysContext);

  const changeLanguage = async (newLanguage) => {
    if (language == newLanguage) return;

    AsyncStorage.setItem("language", newLanguage);

    let holidays = await getHolidays(newLanguage);

    await Notifications.cancelAllScheduledNotificationsAsync();
    clearTimeout(notificationsTimerId);
    notificationsTimerId = setTimeout(setNotifications, 2000, holidays);

    setHolidays(holidays);

    setLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => changeLanguage("ru")}
        style={styles.ruFlagButton}
      >
        <Image
          style={styles.flagImage}
          source={language == "ru" ? resurces.ruFlagSelect : resurces.ruFlag}
        />
        <Text style={styles.languageName}>{dictinory.languages.ru}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => changeLanguage("us")}
        style={styles.usFlagButton}
      >
        <Image
          style={styles.flagImage}
          source={language == "us" ? resurces.usFlagSelect : resurces.usFlag}
        />
        <Text style={styles.languageName}>{dictinory.languages.us}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default settingsScreen_Language;
