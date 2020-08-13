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
  unitedStatesFlag: require("../textures/unitedStatesFlag.png"),
  unitedStatesFlagSelect: require("../textures/unitedStatesFlagSelect.png"),
  russiaFlag: require("../textures/russiaFlag.png"),
  russiaFlagSelect: require("../textures/russiaFlagSelect.png"),
};

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
//    backgroundColor: "#FFFFFF",
  },
  russiaFlagButton: {
    left: screenWidth / 5,
    top: screenWidth / 5,
    position: "absolute",
  },
  unitedStatesFlagButton: {
    left: (screenWidth / 5) * 3,
    top: screenWidth / 5,
    position: "absolute",
  },
  flagImage: {
    width: screenWidth / 5,
    height: screenWidth / 5,
  },
  ruLanguageName: {
    fontSize: 21,
    left: screenWidth / 5,
    top: (screenWidth / 5) * 2.2,
    position: "absolute",
  },
  enLanguageName: {
    fontSize: 21,
    left: (screenWidth / 5) * 3,
    top: (screenWidth / 5) * 2.2,
    position: "absolute",
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

    await AsyncStorage.setItem("language", newLanguage);

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
        style={styles.russiaFlagButton}
      >
        <Image
          style={styles.flagImage}
          source={
            language == "ru" ? resurces.russiaFlagSelect : resurces.russiaFlag
          }
        />
      </TouchableOpacity>
      <Text style={styles.ruLanguageName}>{dictinory.languages.ru}</Text>
      <TouchableOpacity
        onPress={() => changeLanguage("us")}
        style={styles.unitedStatesFlagButton}
      >
        <Image
          style={styles.flagImage}
          source={
            language == "us"
              ? resurces.unitedStatesFlagSelect
              : resurces.unitedStatesFlag
          }
        />
      </TouchableOpacity>
      <Text style={styles.enLanguageName}>{dictinory.languages.us}</Text>
    </View>
  );
}

export default settingsScreen_Language;