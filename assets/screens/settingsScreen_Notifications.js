import * as React from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  AppState,
  Linking,
  AsyncStorage,
  Platform,
  StyleSheet,
} from "react-native";

import * as Permissions from "expo-permissions";

import { Icon } from "react-native-elements";

import { LanguageContext, HolidaysContext, setNotifications } from "../../App";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "relative",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  text: {
    top: 20,
    textAlign: "center",
    fontSize: 19,
    width: 300,
  },
  settingsButton: {
    top: 40,
    textAlign: "center",
    fontSize: 19,
    color: "#342dba",
  },
});

function settingsScreen_Notifications({ navigation }) {
  const { holidays } = React.useContext(HolidaysContext);
  const { dictinory } = React.useContext(LanguageContext);

  const checkNotificationsPermission = async (appState) => {
    if (appState == "active") {
      if ((await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted) {
        navigation.goBack();
        AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
        if (Array.isArray(holidays)) setNotifications(holidays);
      }
    }
  };

  const openNotificationsSettings = () => {
    if (Platform.OS == "ios") {
      Linking.openURL("app-settings://notification/holidays"); // holidays - expo
    } else if (Platform.OS == "android") {
      var action = "android.settings.APP_NOTIFICATION_SETTINGS";
      var extras = [
        { "android.provider.extra.APP_PACKAGE": "com.holidaysapp.holidays" }, // com.holidaysapp.holidays - host.exp.exponent
      ];
      Linking.sendIntent(action, extras);
    }
  };

  React.useEffect(() => {
    AppState.addEventListener("change", checkNotificationsPermission);
    return () => {
      AppState.removeEventListener("change", checkNotificationsPermission);
    };
  }, []);

  return (
    <View>
      <TouchableWithoutFeedback onPress={openNotificationsSettings}>
        <View style={styles.container}>
          <Icon
            name="bell-slash"
            type="font-awesome"
            color={"#d6d7da"}
            size={120}
          />
          <Text style={styles.text}>
            {dictinory.settingsScreen_Notifications.description}
          </Text>
          <Text style={styles.settingsButton}>
            {dictinory.settingsScreen_Notifications.settingsButtonText}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

export default settingsScreen_Notifications;
