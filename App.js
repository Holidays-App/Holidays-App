console.disableYellowBox = true;

import * as React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableNativeFeedback,
  ScrollView,
  AsyncStorage,
  FlatList,
  Dimensions,
  NativeModules,
  Platform,
  RefreshControl,
} from "react-native";

import { Icon } from "react-native-elements";

import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
//import * as Font from "expo-font";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const resurces = {
  unitedStatesFlag: require("./assets/textures/unitedStatesFlag.png"),
  unitedStatesFlagSelect: require("./assets/textures/unitedStatesFlagSelect.png"),
  russiaFlag: require("./assets/textures/russiaFlag.png"),
  russiaFlagSelect: require("./assets/textures/russiaFlagSelect.png"),
  applyButton: require("./assets/textures/applyButton.png"),

  defaultHolidays: require("./assets/db/defaultHolidays.json"),
  dictinory: require("./assets/db/dictinory.json"),
};

const dictinory = resurces.dictinory;

function fetchTimeLimit(url, limit = 1500) {
  return new Promise(async (resolve, reject) => {
    fetch(url).then((response) => {
      resolve(response);
    });
    setTimeout(() => {
      resolve(null);
    }, limit);
  });
}

function sortByDateAndCategory(holidaysList) {
  const date = new Date();
  const categoriesList = [];
  for (var category in dictinory.en.categories) {
    categoriesList.push(category);
  }

  var holidaysListLocal = holidaysList;

  holidaysListLocal.sort((a, b) => {
    var aDate =
      a.date.month < date.getMonth() + 1 ||
      (a.date.month == date.getMonth() + 1 && a.date.day < date.getDate())
        ? a.date.month -
          (date.getMonth() + 1) +
          (a.date.day - date.getDate()) / 100 +
          12.5
        : a.date.month -
          (date.getMonth() + 1) +
          (a.date.day - date.getDate()) / 100;

    var bDate =
      b.date.month < date.getMonth() + 1 ||
      (b.date.month == date.getMonth() + 1 && b.date.day < date.getDate())
        ? b.date.month -
          (date.getMonth() + 1) +
          (b.date.day - date.getDate()) / 100 +
          12.5
        : b.date.month -
          (date.getMonth() + 1) +
          (b.date.day - date.getDate()) / 100;

    if (aDate < bDate) {
      return -1;
    } else if (aDate > bDate) {
      return 1;
    } else if (aDate == bDate) {
      if (
        categoriesList.indexOf(a.category) < categoriesList.indexOf(b.category)
      ) {
        return -1;
      } else if (
        categoriesList.indexOf(a.category) > categoriesList.indexOf(b.category)
      ) {
        return 1;
      } else if (
        categoriesList.indexOf(a.category) == categoriesList.indexOf(b.category)
      ) {
        return 0;
      }
    }
  });

  return holidaysListLocal;
}

async function checkLanguage() {
  var language = await languagePromise;
  if (this.state.language != language) {
    this.setState({
      language: language,
    });
  }
}

async function loadLanguage() {
  var language = await AsyncStorage.getItem("language");
  if (language == null) {
    var deviceLanguage =
      Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
        : NativeModules.I18nManager.localeIdentifier;
    language = deviceLanguage == "ru_RU" ? "ru" : "en";
  }
  return language;
}

async function loadHolidays() {
  var customHolidays = await AsyncStorage.getItem("customHolidays");

  if (customHolidays == null) {
    customHolidays = JSON.stringify([]);
    await AsyncStorage.setItem("customHolidays", JSON.stringify([]));
  }

  var updatedHolidays = await AsyncStorage.getItem("updatedHolidays");
  var updatedHolidaysFromNet = await fetchTimeLimit(
    "http://holidays-app.github.io/db/updatedHolidays.json"
  );

  if (updatedHolidaysFromNet != null) {
    updatedHolidaysFromNet = JSON.stringify(
      await updatedHolidaysFromNet.json()
    );

    if (updatedHolidays != updatedHolidaysFromNet) {
      updatedHolidays = updatedHolidaysFromNet;
      await AsyncStorage.setItem("updatedHolidays", updatedHolidaysFromNet);
    }
  } else if (updatedHolidays == null) {
    updatedHolidays = [];
    await AsyncStorage.setItem("updatedHolidays", JSON.stringify([]));
  }

  var defaultHolidays = resurces.defaultHolidays;
  var customHolidays = JSON.parse(customHolidays);
  var updatedHolidays = JSON.parse(updatedHolidays);

  var holidaysList = defaultHolidays
    .concat(customHolidays)
    .concat(updatedHolidays);
  return holidaysList;
}

async function setNotifications() {
  const date = new Date();

  var notificationsList = await Notifications.getAllScheduledNotificationsAsync();

  await Permissions.askAsync(Permissions.NOTIFICATIONS);

  var language = await languagePromise;

  var holidaysList = await holidaysPromise;
  holidaysList = holidaysList.filter(
    (holiday) => holiday[language].message != "" && holiday[language].name != ""
  );

  for (var i = 0; i < holidaysList.length; i++) {
    var notificationDate;
    if (
      holidaysList[i].date.day / 100 + holidaysList[i].date.month >
      date.getMonth() + 1 + date.getDate() / 100
    ) {
      notificationDate = new Date(
        date.getFullYear(),
        holidaysList[i].date.month - 1,
        holidaysList[i].date.day,
        9,
        2
      );
    } else {
      notificationDate = new Date(
        date.getFullYear() + 1,
        holidaysList[i].date.month - 1,
        holidaysList[i].date.day,
        9,
        2
      );
    }

    if (
      !notificationsList.some(
        (element) =>
          element.content.title == holidaysList[i][language].name &&
          element.content.body == holidaysList[i][language].message &&
          element.trigger.value == notificationDate.getTime()
      )
    ) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: holidaysList[i][language].name,
          body: holidaysList[i][language].message,
        },
        trigger: notificationDate,
      });
    }
  }
}

var languagePromise = new Promise(async (resolve, reject) => {
  language = await loadLanguage();
  resolve(language);
});

var holidaysPromise = new Promise(async (resolve, reject) => {
  holidaysList = await loadHolidays();
  resolve(holidaysList);
});

const styles = {
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  listItem: {
    flex: 1,
    width: "100%",
    height: 80,
    justifyContent: "center",
    paddingRight: "4%",
    paddingLeft: "3%",
  },
  holidaysListScreen: {
    date: {
      fontSize: 16,
      top: "50%",
      color: "#666666",
    },
    name: {
      fontSize: 19,
      top: "50%",
    },
    angleRight: {
      right: "-45%",
      top: "-35%",
    },
  },
  categoriesScreen: {
    angleRight: {
      right: "-45%",
      top: "-20%",
    },
    name: {
      fontSize: 19,
      top: "50%",
    },
  },
  holidayScreen: {
    name: {
      fontSize: 26,
      top: 10,
    },
    date: {
      fontSize: 22,
      top: 20,
      left: "4%",
      color: "#666666",
    },
    description: {
      fontSize: 19,
      top: 35,
    },
    View: {
      paddingLeft: "3%",
      paddingRight: "3%",
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    ScrollView: {
      paddingBottom: 60,
    },
  },
  settingsScreen: {
    angleRight: {
      right: "-45%",
      top: "-25%",
    },
    sectionName: {
      fontSize: 19,
      top: "33%",
    },
  },
  settingsScreen_Language: {
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
  },
};

class holidaysListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { holidaysList: [], refreshing: false, language: "en" };
  }
  async componentDidMount() {
    this.setState({ refreshing: true });

    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var holidaysList = await holidaysPromise;

    if (this.props.route.params != null) {
      if (this.props.route.params.category != null) {
        const category = this.props.route.params.category;
        holidaysList = holidaysList.filter(
          (holiday) => holiday.category == category
        );
      }
    }

    holidaysList = sortByDateAndCategory(holidaysList);

    var language = await languagePromise;

    holidaysList = holidaysList.filter(
      (holiday) => holiday[language].name != ""
    );

    this.setState({
      holidaysList: holidaysList,
      refreshing: false,
      language: language,
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.holidaysList}
          renderItem={({ item }) => (
            <TouchableNativeFeedback
              onPress={() => this.openHolidayScreen(item.en.name)}
            >
              <View
                style={Object.assign(
                  {},
                  styles.listItem,
                  this.getBorderStyles(item)
                )}
              >
                <Text style={styles.holidaysListScreen.name}>
                  {item[this.state.language].name}
                </Text>
                <Text style={styles.holidaysListScreen.date}>
                  {item.date.day +
                    " " +
                    dictinory[this.state.language].months[item.date.month - 1]}
                </Text>
                <Icon
                  name="angle-right"
                  type="font-awesome"
                  color={"#d6d7da"}
                  size={80}
                  iconStyle={styles.holidaysListScreen.angleRight}
                />
              </View>
            </TouchableNativeFeedback>
          )}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh.bind(this)}
              colors={["#f7941d"]}
            />
          }
        />
      </View>
    );
  }
  async refresh() {
    this.setState({ refreshing: true });

    holidaysPromise = new Promise(async (resolve, reject) => {
      holidaysList = await loadHolidays();
      resolve(holidaysList);
    });

    var holidaysList = await holidaysPromise;

    var holidaysListScreen = this;
    if (this.props.route.params != null) {
      if (this.props.route.params.category != null) {
        holidaysList = holidaysList.filter((holiday) => {
          return (
            holiday.category == holidaysListScreen.props.route.params.category
          );
        });
      }
    }

    holidaysList = sortByDateAndCategory(holidaysList);

    this.setState({ holidaysList: holidaysList, refreshing: false });
  }
  getBorderStyles(item) {
    var BorderStyles = {};
    if (
      item.date.day == new Date().getDate() &&
      item.date.month == new Date().getMonth() + 1
    ) {
      BorderStyles.borderColor = "#f7941d";
      BorderStyles.borderWidth = 3;
      if (this.state.holidaysList.indexOf(item) != 0) {
        BorderStyles.borderTopColor = "#d6d7da";
        BorderStyles.borderTopWidth = 1.5;
      }
      if (
        this.state.holidaysList[this.state.holidaysList.indexOf(item) + 1].date
          .day == new Date().getDate() &&
        this.state.holidaysList[this.state.holidaysList.indexOf(item) + 1].date
          .month ==
          new Date().getMonth() + 1
      ) {
        BorderStyles.borderBottomWidth = 0;
      }
    } else if (this.state.holidaysList.indexOf(item) != 0) {
      BorderStyles = { borderTopColor: "#d6d7da", borderTopWidth: 1.5 };
    }
    return BorderStyles;
  }
  openHolidayScreen(name) {
    var parameters = { holiday: {} };
    for (var i = 0; i < this.state.holidaysList.length; i++) {
      if (name == this.state.holidaysList[i].en.name) {
        parameters.holiday = this.state.holidaysList[i];
      }
    }
    this.props.navigation.navigate("holidayScreen", parameters);
  }
}

class holidayScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "en" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <ScrollView contentContainerStyle={styles.holidayScreen.ScrollView}>
        <View style={styles.holidayScreen.View}>
          <Text style={styles.holidayScreen.name}>
            {this.props.route.params.holiday[this.state.language].name}
          </Text>
          <Text style={styles.holidayScreen.date}>
            {this.props.route.params.holiday.date.day +
              " " +
              dictinory[this.state.language].months[
                this.props.route.params.holiday.date.month - 1
              ]}
          </Text>
          <Text style={styles.holidayScreen.description}>
            {this.props.route.params.holiday[this.state.language].description}
          </Text>
        </View>
      </ScrollView>
    );
  }
}

class categoriesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { categoriesHolidaysList: [], language: "en" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var holidaysList = await holidaysPromise;
    var categories = [];
    for (var category in dictinory.en.categories) {
      if (holidaysList.some((holiday) => holiday.category == category)) {
        categories.push(category);
      }
    }

    var language = await languagePromise;

    this.setState({ language: language, categoriesHolidaysList: categories });
  }
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.categoriesHolidaysList}
          renderItem={({ item }) => (
            <TouchableNativeFeedback
              onPress={() => this.openСategoryHolidayScreen(item)}
            >
              <View
                style={Object.assign(
                  {},
                  styles.listItem,
                  this.state.categoriesHolidaysList.indexOf(item) == 0
                    ? {}
                    : {
                        borderTopColor: "#d6d7da",
                        borderTopWidth: 1.5,
                        lineHeight: 10,
                      }
                )}
              >
                <Text style={styles.categoriesScreen.name}>
                  {dictinory[this.state.language].categories[item]}
                </Text>
                <Icon
                  name="angle-right"
                  type="font-awesome"
                  color={"#d6d7da"}
                  size={80}
                  iconStyle={styles.categoriesScreen.angleRight}
                />
              </View>
            </TouchableNativeFeedback>
          )}
        />
      </View>
    );
  }
  openСategoryHolidayScreen(category) {
    var parameters = { category: category };
    this.props.navigation.navigate("categoryScreen", parameters);
  }
}

class settingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "en" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", this.checkLanguage.bind(this));

    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <View style={styles.container}>
        <View
          style={Object.assign({}, styles.listItem, {
            borderBottomWidth: 1.5,
            height: 60,
            borderTopWidth: 1.5,
            borderColor: "#d6d7da",
            top: "30%",
          })}
        >
          <TouchableNativeFeedback
            onPress={() => this.openSettingsLanguageScreen()}
          >
            <View>
              <Text style={styles.settingsScreen.sectionName}>
                {this.state.language == ""
                  ? ""
                  : dictinory[this.state.language].settingsScreen
                      .languageButtonText}
              </Text>
              <Icon
                name="angle-right"
                type="font-awesome"
                color={"#d6d7da"}
                size={60}
                iconStyle={styles.settingsScreen.angleRight}
              />
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    );
  }
  async checkLanguage() {
    var language = await languagePromise;
    if (this.state.language != language) {
      this.props.navigation.setOptions({
        title: dictinory[language].settingsScreen.title,
      });
      this.setState({ language: language });
    }
  }
  openSettingsLanguageScreen() {
    this.props.navigation.navigate("settingsScreen_Language");
  }
}

class settingsScreen_Language extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "en" };
  }
  async componentDidMount() {
    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.changeLanguage("ru")}
          style={styles.settingsScreen_Language.russiaFlagButton}
        >
          <Image
            style={styles.settingsScreen_Language.flagImage}
            source={
              this.state.language == "ru"
                ? resurces.russiaFlagSelect
                : resurces.russiaFlag
            }
          />
        </TouchableOpacity>
        <Text style={styles.settingsScreen_Language.ruLanguageName}>
          {dictinory.languages.ru}
        </Text>
        <TouchableOpacity
          onPress={() => this.changeLanguage("en")}
          style={styles.settingsScreen_Language.unitedStatesFlagButton}
        >
          <Image
            style={styles.settingsScreen_Language.flagImage}
            source={
              this.state.language == "en"
                ? resurces.unitedStatesFlagSelect
                : resurces.unitedStatesFlag
            }
          />
        </TouchableOpacity>
        <Text style={styles.settingsScreen_Language.enLanguageName}>
          {dictinory.languages.en}
        </Text>
      </View>
    );
  }
  async changeLanguage(language) {
    if (this.state.language == language) return;

    await AsyncStorage.setItem("language", language);
    languagePromise = new Promise(async (resolve, reject) => {
      resolve(language);
    });

    await Notifications.cancelAllScheduledNotificationsAsync();

    setTimeout(
      async (language) => {
        if (language == (await AsyncStorage.getItem("language"))) {
          setNotifications();
        }
      },
      10000,
      language
    );

    this.props.navigation.setOptions({
      title: dictinory[language].settingsScreen_Language.title,
    });

    this.setState({ language: language });
  }
}

class firstScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="upcomingHolidaysScreen"
          component={holidaysListScreen}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].upcomingHolidaysScreen.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
        <Stack.Screen
          name="holidayScreen"
          component={holidayScreen}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].holidayScreen.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
      </Stack.Navigator>
    );
  }
}

class secondScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="categoriesScreen"
          component={categoriesScreen}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].categoriesScreen.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
          initialParams={{ language: this.state.language }}
        />
        <Stack.Screen
          name="categoryScreen"
          component={holidaysListScreen}
          options={({ route }) => ({
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].categories[
                    route.params.category
                  ],
            headerTitleStyle: {
              fontSize: 21,
            },
          })}
        />
        <Stack.Screen
          name="holidayScreen"
          component={holidayScreen}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].holidayScreen.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
      </Stack.Navigator>
    );
  }
}

class thirdScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: "" };
  }
  async componentDidMount() {
    this.props.navigation.addListener("focus", checkLanguage.bind(this));

    var language = await languagePromise;
    this.setState({ language: language });
  }
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="settingsScreen"
          component={settingsScreen}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].settingsScreen.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
        <Stack.Screen
          name="settingsScreen_Language"
          component={settingsScreen_Language}
          options={{
            headerBackTitle:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].backButtonText,
            title:
              this.state.language == ""
                ? ""
                : dictinory[this.state.language].settingsScreen_Language.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
      </Stack.Navigator>
    );
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    setNotifications();
  }
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          tabBarOptions={{
            activeTintColor: "#f7941d",
            tabStyle: { justifyContent: "center" },
            showLabel: false,
          }}
        >
          <Tab.Screen
            name="firstScreen"
            component={firstScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon
                  name="calendar"
                  type="foundation"
                  color={color}
                  size={38}
                />
              ),
            }}
            initialParams={{ language: "" }}
          />
          <Tab.Screen
            name="secondScreen"
            component={secondScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon
                  name="align-justify"
                  type="foundation"
                  color={color}
                  size={32}
                />
              ),
            }}
            initialParams={{ language: "" }}
          />
          <Tab.Screen
            name="thirdScreen"
            component={thirdScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon name="cog" type="font-awesome" color={color} size={29} />
              ),
            }}
            initialParams={{ language: "" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
