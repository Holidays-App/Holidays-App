import * as React from "react";
import {
  AsyncStorage,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  AppState,
  Image,
  Platform,
  StyleSheet,
} from "react-native";

import * as Permissions from "expo-permissions";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Icon } from "react-native-elements";

import { LanguageContext, HolidaysContext, getHolidays } from "../../App";

const Tab = createMaterialTopTabNavigator();

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const resurces = {
  usFlag: require("../textures/usFlag.png"),
  usFlagSelect: require("../textures/usFlagSelect.png"),
  ruFlag: require("../textures/ruFlag.png"),
  ruFlagSelect: require("../textures/ruFlagSelect.png"),
  icon: require("../icon.png"),
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "relative",
    alignItems: "center",
  },
  mainIcon: { top: "15%", marginBottom: "20%" },
  mainText: { fontSize: 24 },
});

function NextTabButton({ nextTab, navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  const nextTabButtonStyles = StyleSheet.create({
    container: {
      position: "absolute",
      height: 40,
      width: 80,
      bottom: 20,
      right: 5,
    },
    text: { color: "#f7941d", fontSize: 22, textAlign: "right", right: 50 },
    angle: { top: -39 },
  });

  return (
    <TouchableOpacity
      onPress={() => navigation.jumpTo(nextTab)}
      style={nextTabButtonStyles.container}
    >
      <Text style={nextTabButtonStyles.text}>
        {dictinory.firstLaunchScreen.nextTabButtonText}
      </Text>
      <Icon
        name="angle-right"
        type="font-awesome"
        color={"#f7941d"}
        size={50}
        iconStyle={nextTabButtonStyles.angle}
      />
    </TouchableOpacity>
  );
}

function firstTabScreen({ navigation }) {
  const { dictinory } = React.useContext(LanguageContext);

  const firstTabStyles = StyleSheet.create({
    logoImage: {
      top: 30,
      marginBottom: 40,
      height:
        (screenHeight / 18) * 9 <= screenWidth
          ? (screenHeight / 18) * 9
          : screenWidth,
      width:
        (screenHeight / 18) * 9 <= screenWidth
          ? (screenHeight / 18) * 9
          : screenWidth,
    },
    appNameContainer: {
      backgroundColor: "#f7941d",
      width: "90%",
      borderRadius: 10,
      paddingVertical: "1%",
    },
    appName: {
      color: "#ffffff",
      fontSize: (screenHeight / 100) * 5.74,
      textAlign: "center",
    },
    text: {
      fontSize: (screenHeight / 100) * 3.45,
      textAlign: "center",
      top: "5%",
      marginHorizontal: "10%",
    },
  });

  return (
    <View style={styles.container}>
      <Image source={resurces.icon} style={firstTabStyles.logoImage} />
      <View style={firstTabStyles.appNameContainer}>
        <Text style={firstTabStyles.appName}>
          {dictinory.firstLaunchScreen.appName}
        </Text>
      </View>
      <Text style={firstTabStyles.text}>
        {dictinory.firstLaunchScreen.firstTabText}
      </Text>
      <NextTabButton nextTab="secondTabScreen" navigation={navigation} />
    </View>
  );
}

function secondTabScreen({ navigation }) {
  const { dictinory, language, setLanguage } = React.useContext(
    LanguageContext
  );

  const secondTabStyles = StyleSheet.create({
    languageButtonsContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      top: 30,
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
        color={"#34a853"}
        size={(screenHeight / 20) * 9}
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
      backgroundColor: allowNotifications ? "#34a853" : "#f7941d",
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: "5%",
      top: 30,
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
      navigation
        .dangerouslyGetParent()
        .navigate("settingsScreen_Notifications");
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
        color={"#34a853"}
        size={(screenHeight / 20) * 9}
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
            {dictinory.firstLaunchScreen.allowNotificationsButtonText}
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
    },
    text: {
      color: "#f7941d",
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
