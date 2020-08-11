import * as React from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Switch,
  AsyncStorage,
  AppState,
  Platform,
} from "react-native";

import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

import { LanguageContext, HolidaysContext, setNotifications } from "../../App";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
    /*
    
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    position: "absolute"
    */
  },
  languageButton: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 1.5,
    height: 60,
    borderTopWidth: 1.5,
    borderColor: "#d6d7da",
    top: "45%",
  },
  notificationsButton: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 1.5,
    height: 60,
    borderTopWidth: 1.5,
    borderColor: "#d6d7da",
    top: "20%",
  },
  sectionName: {
    position: "absolute",
    fontSize: 19,
    top: "33%",
    left: "5%",
  },
  sectionView: {
    height: 85,
  },
  notificationsSwitch: {
    position: "absolute",
    top: "33%",
    right: "5%",
  },
});

function settingsScreen({ navigation }) {
  var notificationsTimerId;

  const { dictinory } = React.useContext(LanguageContext);
  const { holidays } = React.useContext(HolidaysContext);

  const [allowNotifications, setAllowNotifications] = React.useState(null);

  const toggleAllowNotifications = async () => {
    var newValue = !allowNotifications;
    setAllowNotifications(newValue);

    if ((await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted) {
      if (newValue) {
        await AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
        clearTimeout(notificationsTimerId);
        notificationsTimerId = setTimeout(setNotifications, 2000, holidays);
      } else {
        await AsyncStorage.setItem("allowNotifications", JSON.stringify(false));
        clearTimeout(notificationsTimerId);
        notificationsTimerId = setTimeout(
          Notifications.cancelAllScheduledNotificationsAsync,
          1000
        );
      }
    } else {
      setAllowNotifications(false);
      if (
        (await Permissions.getAsync(Permissions.NOTIFICATIONS)).canAskAgain &&
        Platform.OS == "android"
      ) {
        if ((await Permissions.askAsync(Permissions.NOTIFICATIONS)).granted) {
          await AsyncStorage.setItem(
            "allowNotifications",
            JSON.stringify(true)
          );
          clearTimeout(notificationsTimerId);
          notificationsTimerId = setTimeout(setNotifications, 2000, holidays);
          setAllowNotifications(true);
        }
      } else {
        await navigation.navigate("settingsScreen_Notifications");
      }
    }
  };

  const updateAllowNotifications = async (appState) => {
    if (appState == "active" || appState == undefined) {
      let allowNotifications = await AsyncStorage.getItem("allowNotifications");
      if (JSON.parse(allowNotifications) == true) {
        if ((await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted) {
          setAllowNotifications(true);
        } else {
          setAllowNotifications(false);
        }
      } else if (JSON.parse(allowNotifications) == false) {
        setAllowNotifications(false);
      }
    }
  };

  React.useEffect(() => {
    updateAllowNotifications();
    AppState.addEventListener("change", updateAllowNotifications);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.notificationsButton}>
        <TouchableWithoutFeedback onPress={toggleAllowNotifications}>
          <View style={styles.sectionView}>
            <Text style={styles.sectionName}>
              {dictinory.settingsScreen.notificationsButtonText}
            </Text>
            {allowNotifications == null ? null : (
              <Switch
                trackColor={{ false: "#dddddd", true: "#6edc5f" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#dddddd"
                onValueChange={toggleAllowNotifications}
                value={allowNotifications}
                style={styles.notificationsSwitch}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.languageButton}>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("settingsScreen_Language")}
        >
          <View style={styles.sectionView}>
            <Text style={styles.sectionName}>
              {dictinory.settingsScreen.languageButtonText}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

export default settingsScreen;
