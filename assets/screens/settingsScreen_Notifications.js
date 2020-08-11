import * as React from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  AppState,
  Linking,
  AsyncStorage,
  Platform,
} from "react-native";

import * as Permissions from "expo-permissions";

import { Icon } from "react-native-elements";

import { LanguageContext, HolidaysContext, setNotifications } from "../../App";

function settingsScreen_Notifications({ navigation }) {
  const { holidays } = React.useContext(HolidaysContext);
  const { dictinory } = React.useContext(LanguageContext);

  const checkChanges = async (appState) => {
    if (appState == "active") {
      if ((await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted) {
        navigation.goBack();
        await AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
        setNotifications(holidays);
      }
    }
  };

  const openNotificationsSettings = () => {
    if (Platform.OS == "ios") {
      Linking.openURL("app-settings://notification/expo");
    } else if (Platform.OS == "android") {
      var action = "android.settings.APP_NOTIFICATION_SETTINGS";
      var extras = [
        { "android.provider.extra.APP_PACKAGE": "host.exp.exponent" },
      ];
      Linking.sendIntent(action, extras);
    }
  };

  React.useEffect(() => {
    AppState.addEventListener("change", checkChanges);
    return () => {
      AppState.removeEventListener("change", checkChanges);
    };
  }, []);

  return (
    <View
      style={{
        height: "100%",
        position: "relative",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <TouchableWithoutFeedback onPress={openNotificationsSettings}>
        <View style={{ marginTop: "-50%" }}>
          <Icon
            name="bell-slash"
            type="font-awesome"
            color={"#d6d7da"}
            size={120}
          />
          <Text
            style={{
              top: 20,
              textAlign: "center",
              fontSize: 19,
            }}
          >
            {dictinory.settingsScreen_Notifications.description}
          </Text>
          <Text
            style={{
              top: 40,
              textAlign: "center",
              fontSize: 19,
              color: "blue",
            }}
          >
            {dictinory.settingsScreen_Notifications.onButtonText}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

export default settingsScreen_Notifications;
