import * as React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  AppState,
  Image,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";

import * as Permissions from "expo-permissions";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Icon } from "react-native-elements";

import { LanguageContext, HolidaysContext, getHolidays } from "../utils";

const Tab = createMaterialTopTabNavigator();

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const resurces = {
  usFlag: require("../../textures/usFlag.png"),
  usFlagSelect: require("../../textures/usFlagSelect.png"),
  ruFlag: require("../../textures/ruFlag.png"),
  ruFlagSelect: require("../../textures/ruFlagSelect.png"),
  icon: require("../../textures/transparent-icon.png"),
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "relative",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  mainIcon: { top: 90, marginBottom: 90 },
  mainText: { fontSize: 24, top: "5%" },
});

function NextTabButton({ nextTab, navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  const nextTabButtonStyles = StyleSheet.create({
    container: {
      position: "absolute",
      height: 40,
      width: 80,
      bottom: 40,
      right: 40,
    },
    text: { color: "#AC0735", fontSize: 22, textAlign: "right" },
  });

  return (
    <TouchableOpacity
      onPress={() => navigation.jumpTo(nextTab)}
      style={nextTabButtonStyles.container}
    >
      <Text style={nextTabButtonStyles.text}>
        {dictinory.firstLaunchScreen.nextTabButtonText}
      </Text>
    </TouchableOpacity>
  );
}

function firstTabScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  const firstTabStyles = StyleSheet.create({
    logoImage: {
      top: 90,
      marginBottom: 90,
      height: screenHeight / 3,
      width: screenHeight / 3 / 1.842,
    },
    appName: {
      color: "#000000",
      fontSize: (screenHeight / 100) * 5.74,
      textAlign: "center",
      top: "5%",
    },
    text: {
      fontSize: (screenHeight / 100) * 3.45,
      textAlign: "center",
      top: "8%",
      marginHorizontal: "10%",
    },
  });

  return (
    <View style={styles.container}>
      <Image source={resurces.icon} style={firstTabStyles.logoImage} />
      <Text style={firstTabStyles.appName}>
        {dictinory.firstLaunchScreen.appName}
      </Text>
      <Text style={firstTabStyles.text}>
        {dictinory.firstLaunchScreen.firstTabText}
      </Text>
      <NextTabButton nextTab="secondTabScreen" navigation={navigation} />
    </View>
  );
}

function secondTabScreen({ navigation }) {
  const { dictinory, language, setLanguage } =
    React.useContext(LanguageContext);

  const secondTabStyles = StyleSheet.create({
    languageButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      top: "20%",
    },
    flagImage: {
      width: screenWidth / 5,
      height: screenWidth / 5,
    },
    languageButton: {
      marginHorizontal: screenWidth / 10,
      height: screenWidth / 5 + 40,
    },
    languageName: { textAlign: "center", fontSize: 21, top: 15 },
  });

  const changeLanguage = async (newLanguage) => {
    if (newLanguage == language) return;

    AsyncStorage.setItem("language", newLanguage);

    setLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <Icon
        name="language"
        type="font-awesome"
        color={"#F5C684"}
        size={(screenHeight / 20) * 7}
        iconStyle={styles.mainIcon}
      />
      <Text style={styles.mainText}>
        {dictinory.firstLaunchScreen.languageTabText}
      </Text>
      <View style={secondTabStyles.languageButtonsContainer}>
        <TouchableOpacity
          style={secondTabStyles.languageButton}
          onPress={() => changeLanguage("ru")}
        >
          <Image
            style={secondTabStyles.flagImage}
            source={language == "ru" ? resurces.ruFlagSelect : resurces.ruFlag}
          />
          <Text style={secondTabStyles.languageName}>
            {dictinory.languages.ru}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={secondTabStyles.languageButton}
          onPress={() => changeLanguage("us")}
        >
          <Image
            style={secondTabStyles.flagImage}
            source={language == "us" ? resurces.usFlagSelect : resurces.usFlag}
          />
          <Text style={secondTabStyles.languageName}>
            {dictinory.languages.us}
          </Text>
        </TouchableOpacity>
      </View>
      <NextTabButton nextTab="thirdTabScreen" navigation={navigation} />
    </View>
  );
}

function thirdTabScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  const [allowNotifications, setAllowNotifications] = React.useState(null);

  const thirdTabStyles = StyleSheet.create({
    turnonNotificationsButton: {
      borderRadius: 10,
      backgroundColor: allowNotifications ? "#34a853" : "#AC0735",
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: "5%",
      top: "10%",
    },
    turnonNotificationsButtonText: {
      textAlign: "center",
      fontSize: 21,
      color: "#ffffff",
    },
  });

  const turnonNotifications = async () => {
    let notificationsPrem = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    );
    if (
      Platform.OS == "ios"
        ? notificationsPrem.permissions.notifications.ios.status == 0
        : notificationsPrem.canAskAgain
    ) {
      if ((await Permissions.askAsync(Permissions.NOTIFICATIONS)).granted) {
        AsyncStorage.setItem("allowNotifications", JSON.stringify(true));
      }
    } else {
      Alert.alert("", dictinory.settingsScreen_Notifications.description);
    }
  };

  const checkNotificationsPermission = async (appState) => {
    if (appState == "active" || appState == undefined) {
      if ((await Permissions.getAsync(Permissions.NOTIFICATIONS)).granted) {
        setAllowNotifications(true);
      } else {
        setAllowNotifications(false);
      }
    }
  };

  React.useEffect(() => {
    checkNotificationsPermission();
    AppState.addEventListener("change", checkNotificationsPermission);
    return () => {
      AppState.removeEventListener("change", checkNotificationsPermission);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Icon
        name="bell"
        type="font-awesome"
        color={"#F5C684"}
        size={(screenHeight / 20) * 7}
        iconStyle={styles.mainIcon}
      />
      <Text style={styles.mainText}>
        {dictinory.firstLaunchScreen.notificationsTabText}
      </Text>
      {allowNotifications != null ? (
        <TouchableOpacity
          onPress={turnonNotifications}
          disabled={allowNotifications}
          style={thirdTabStyles.turnonNotificationsButton}
        >
          <Text style={thirdTabStyles.turnonNotificationsButtonText}>
            {allowNotifications
              ? dictinory.firstLaunchScreen
                  .allowNotificationsButtonTextNotificationsOn
              : dictinory.firstLaunchScreen.allowNotificationsButtonText}
          </Text>
        </TouchableOpacity>
      ) : null}
      <NextTabButton nextTab="fourthTabScreen" navigation={navigation} />
    </View>
  );
}

function fourthTabScreen({ navigation }) {
  const { dictinory, language } = React.useContext(LanguageContext);
  const { setHolidays } = React.useContext(HolidaysContext);

  const fourthTabStyles = StyleSheet.create({
    container: {
      height: "100%",
      width: "100%",
      position: "relative",
      alignItems: "center",
      textAlign: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },
    text: {
      color: "#AC0735",
      fontSize: 24,
      textAlign: "center",
      marginHorizontal: "5%",
    },
    startButton: { bottom: "15%", position: "absolute" },
  });

  const openMainApp = () => {
    AsyncStorage.setItem("alreadyLaunched", JSON.stringify(true));
    navigation.dangerouslyGetParent().replace("mainScreen");
  };

  navigation.addListener("focus", async () => {
    let holidays = await getHolidays(language);
    setHolidays(holidays);
  });

  return (
    <View style={fourthTabStyles.container}>
      <Text style={fourthTabStyles.text}>
        {dictinory.firstLaunchScreen.finallyTabText}
      </Text>
      <TouchableOpacity
        onPress={openMainApp}
        style={fourthTabStyles.startButton}
      >
        <Text style={fourthTabStyles.text}>
          {dictinory.firstLaunchScreen.startButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function firstLaunchScreen() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        showLabel: false,
        showIcon: false,
        style: { height: 0 },
      }}
    >
      <Tab.Screen name="firstTabScreen" component={firstTabScreen} />
      <Tab.Screen name="secondTabScreen" component={secondTabScreen} />
      <Tab.Screen name="thirdTabScreen" component={thirdTabScreen} />
      <Tab.Screen name="fourthTabScreen" component={fourthTabScreen} />
    </Tab.Navigator>
  );
}

export default firstLaunchScreen;
