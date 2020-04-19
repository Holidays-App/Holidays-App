import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  SafeAreaView,
  AsyncStorage,
  FlatList,
  Dimensions,
  NativeModules,
  Platform,
  Button
} from 'react-native';

import { Icon } from 'react-native-elements';

import NetInfo from '@react-native-community/netinfo';

import { Updates, Notifications } from 'expo';

import Constants from 'expo-constants';

import * as Permissions from 'expo-permissions';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const date = new Date();
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const resurces = {
  unitedStatesFlag: require('./assets/textures/unitedStatesFlag.png'),
  unitedStatesFlagSelect: require('./assets/textures/unitedStatesFlagSelect.png'),
  russiaFlag: require('./assets/textures/russiaFlag.png'),
  russiaFlagSelect: require('./assets/textures/russiaFlagSelect.png'),
  applyButton: require('./assets/textures/applyButton.png'),
  defaultHolidays: require('./assets/db/defaultHolidays.json'),
  dictinory: require('./assets/db/dictinory.json'),
};
///////test
const dictinory = resurces.dictinory;

const localNotification = {
            title: 'done',
            body: 'done!'
        };

        const schedulingOptions = {
            time: (new Date()).getTime() + 5000
        }

        // Notifications show only when app is not active.
        // (ie. another app being used or device's screen is locked)
        Notifications.scheduleLocalNotificationAsync(
            localNotification, schedulingOptions
        );
<<<<<<< HEAD
///////test
=======

>>>>>>> 8442873f8725cd80cb575c5c13bead293f76d308
function sortByDate(holidaysList) {
  let holidayListL = holidaysList;
  holidayListL.sort((a, b) => (
           ((a.date.month < (date.getMonth()+1)) || (a.date.month == (date.getMonth()+1) && a.date.day < date.getDate())?
           ((a.date.month-(date.getMonth()+1))+(a.date.day-date.getDate())/100)+12.5
           :
           ((a.date.month-(date.getMonth()+1))+(a.date.day-date.getDate())/100))
           >
           ((b.date.month < (date.getMonth()+1)) || (b.date.month == (date.getMonth()+1) && b.date.day < date.getDate())?
           ((b.date.month-(date.getMonth()+1))+(b.date.day-date.getDate())/100)+12.5
           :
           ((b.date.month-(date.getMonth()+1))+(b.date.day-date.getDate())/100))
           ? 1 : -1));
  return holidayListL;
}

async function loadLanguage() {
  try {
    var language = await AsyncStorage.getItem('language');
    if (language == null || language == 'ruByDevice' || language == 'enByDevice'){
      let deviceLanguage =
          Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
              NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
            : NativeModules.I18nManager.localeIdentifier;
      await AsyncStorage.setItem('language', (deviceLanguage=='ru_RU'?'ru':'en')+'ByDevice');
    }
  } catch (e) {console.log('ERROR: '+e)}
};

async function loadHolidays(){
  try {
    var defaultHolidays = await AsyncStorage.getItem('defaultHolidays');
    if (defaultHolidays != resurces.defaultHolidays){
      defaultHolidays = resurces.defaultHolidays;
      await AsyncStorage.setItem('defaultHolidays', JSON.stringify(defaultHolidays));
    }
  } catch (e) {console.log('ERROR: '+e)}

  try {
    var customHolidays = await AsyncStorage.getItem('customHolidays');
    if (customHolidays == null){
      await AsyncStorage.setItem('customHolidays', JSON.stringify([]));
    }
  } catch (e) {console.log('ERROR: '+e)}

  try {
    var updatedHolidays = await AsyncStorage.getItem('updatedHolidays');
    if (updatedHolidays == null){
      await AsyncStorage.setItem('updatedHolidays', JSON.stringify([]));
    }
  } catch (e) {console.log('ERROR: '+e)}
};

async function loadUpdatedHolidays(){
  try {
    var updatedHolidaysOnDevise = await AsyncStorage.getItem('updatedHolidays');
    var updatedHolidays = await fetch('http://holidays-app.github.io/db/updatedHolidays.json');
    updatedHolidays = await updatedHolidays.json()

    if (updatedHolidaysOnDevise != updatedHolidays){
      await AsyncStorage.setItem('updatedHolidays', JSON.stringify(updatedHolidays));
    }
  } catch (e) {console.log('ERROR: '+e)}
  return;
}

async function setNotifications(){
  try {
    var notificationsList = await AsyncStorage.getItem('notificationsList');

    if (notificationsList == null){
      await AsyncStorage.setItem('notificationsList', JSON.stringify([]));
      notificationsList = [];
    } else {
      notificationsList = JSON.parse(notificationsList);
    }

    for (let i = 0; i < notificationsList.length; i++) {
      if (date.getTime()>=notificationsList[i].date) {
        notificationsList.splice(i, 1);
        i--;
      }
    }

    await Permissions.askAsync(Permissions.NOTIFICATIONS);

    await loadHolidays();

    var customHolidays = JSON.parse(await AsyncStorage.getItem('customHolidays'));
    var defaultHolidays = JSON.parse(await AsyncStorage.getItem('defaultHolidays'));

    if ((await NetInfo.fetch()).isInternetReachable) {
      await loadUpdatedHolidays();
    }
    var updatedHolidays = await AsyncStorage.getItem('updatedHolidays');
    updatedHolidays = updatedHolidays==null?[]:JSON.parse(updatedHolidays);

    var holidaysList = (defaultHolidays.concat(customHolidays)).concat(updatedHolidays);

    await loadLanguage();
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    for (let i = 0; i < holidaysList.length; i++){

      var notificationDate;
      if ((holidaysList[i].date.day/100+holidaysList[i].date.month)>((date.getMonth()+1)+date.getDate()/100)) {
        notificationDate = (new Date(date.getFullYear(), holidaysList[i].date.month-1, holidaysList[i].date.day, 9, 2)).getTime();
      } else {
        notificationDate = (new Date(date.getFullYear()+1, holidaysList[i].date.month-1, holidaysList[i].date.day, 9, 2)).getTime();
      }

      var notification = {
        holiday: holidaysList[i][language].name,
        date: notificationDate
      }

      var includesFunc = function(element){return(JSON.stringify(element) == JSON.stringify(notification))};

      if (!notificationsList.some(includesFunc)) {
        console.log(notification);
        await Notifications.scheduleLocalNotificationAsync(
          {
            title: holidaysList[i][language].name,
            body: holidaysList[i][language].message,
          },
          {
            time: notificationDate
          }
        );

        notificationsList.push(notification);
        await AsyncStorage.setItem('notificationsList', JSON.stringify(notificationsList));
      }
    }

  } catch (e) {console.log('ERROR: '+e)}
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF'
    },
    item: {
      flex: 1,
      width: '100%',
      height: 80,
      justifyContent: 'center',
      paddingRight: "4%",
      paddingLeft: "3%"
    },
    categoryItem: {
      flex: 1,
      width: '100%',
      height: 80,
      justifyContent: 'center',
      paddingRight: "4%",
      paddingLeft: "3%",
      borderTopColor: '#d6d7da',
      borderTopWidth: 1.5,
    },
    holidayDate: {
      fontSize: 16,
      top: "50%",
      color: '#666666',
    },
    holidayScreenHolidayDate: {
      fontSize: 22,
      top: 20,
      left: "4%",
      color: "#666666",
    },
    name: {
      fontSize: 19,
      top: "50%",
    },
    holidayScreenName: {
      fontSize: 26,
      top: 10,
    },
    angleRight: {
      right: "-45%",
      top: "-35%",
    },
    holidayDescription: {
      fontSize: 19,
      top: 35,
    },
    holidayScreenView: {
      paddingLeft: "3%",
      paddingRight: "3%",
      flex: 1,
      backgroundColor: '#FFFFFF'
    },
    holidayScreenScrollView: {
      paddingBottom: 60,
    },
    categoriesHolidaysScreenAngleRight: {
      right: "-45%",
      top: "-20%",
    },
    settingsScreenAngleRight: {
      right: "-45%",
      top: "-25%",
    },
    settingsScreenSectionName: {
      fontSize: 19,
      top: "33%",
    },
    russiaFlagButton: {
      left: screenWidth/5,
      top: screenWidth/5,
      position: 'absolute',
    },
    unitedStatesFlagButton: {
      left: screenWidth/5*3,
      top: screenWidth/5,
      position: 'absolute',
    },
    FlagImage: {
      width: screenWidth/5,
      height: screenWidth/5,
    },
    warningMessage: {
      fontSize: 16,
      top: '50%',
      left: '10%',
      width: '80%',
      textAlign: 'center',
      color: '#666666',
      position: 'absolute',
    },
    applyButton: {
      left: '12.5%',
      bottom: "0%",
      alignItems: "center",
      position: 'absolute',
    },
    applyButtonImage: {
      width: screenWidth*0.75,
      height: screenWidth*0.75*0.13715,
    },
    applyButtonText: {
      fontSize: 19,
      top: '-50%',
      textAlign: 'center',
      color: '#FFFFFF',
    },
});

class upcomingHolidaysScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { holidaysList: [], language: 'en' }
  }
  async componentDidMount() {
    await loadHolidays();

    var customHolidays = JSON.parse(await AsyncStorage.getItem('customHolidays'));
    var defaultHolidays = JSON.parse(await AsyncStorage.getItem('defaultHolidays'));

    if ((await NetInfo.fetch()).isInternetReachable) {
      await loadUpdatedHolidays();
    }
    var updatedHolidays = await AsyncStorage.getItem('updatedHolidays');
    updatedHolidays = updatedHolidays==null?[]:JSON.parse(updatedHolidays);

    var holidaysList = sortByDate((defaultHolidays.concat(customHolidays)).concat(updatedHolidays));

    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({holidaysList: holidaysList, language: language});
  }
  render() {
    return(
      <View style={styles.container}>
      <FlatList
          data={this.state.holidaysList}
          renderItem={({ item }) => (
          <TouchableOpacity onPress={() => this.openHolidayScreen(item.en.name)}>
            <View
              style={
                Object.assign({},
                              styles.item,
                              (item.date.day == date.getDate() && item.date.month == (date.getMonth()+1)) ?
                              {borderColor: '#f7941d', borderWidth: 3}
                              :
                              (this.state.holidaysList.indexOf(item)==0?
                                {}
                                :
                                {borderTopColor: '#d6d7da', borderTopWidth: 1.5, lineHeight: 10})
                            )
            }>
              <Text style={Object.assign({}, styles.name, (item.important)?{fontWeight: "500"}:{})}>{item[this.state.language].name}</Text>
              <Text style={styles.holidayDate}>{item.date.day+" "+dictinory[this.state.language].months[item.date.month-1]}</Text>
              <Icon name='angle-right' type='font-awesome' color={'#d6d7da'} size={80} iconStyle={styles.angleRight}/>
            </View>
          </TouchableOpacity>
          )}
        />
      </View>
    )
  }
  openHolidayScreen(name) {
    let parameters = {holiday: {}};
    for (let i = 0; i < this.state.holidaysList.length; i++) {
      if(name == this.state.holidaysList[i].en.name){
        parameters.holiday = this.state.holidaysList[i];
      }
    }
    this.props.navigation.navigate('holidayScreen', parameters);
  }
}

class holidayScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'en' };
  }
  async componentDidMount() {
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language });
  }
  render() {
    return(
        <ScrollView contentContainerStyle={styles.holidayScreenScrollView}>
          <View style={styles.holidayScreenView}>
            <Text style={styles.holidayScreenName}>{this.props.route.params.holiday[this.state.language].name}</Text>
            <Text style={styles.holidayScreenHolidayDate}>{this.props.route.params.holiday.date.day+" "+dictinory[this.state.language].months[this.props.route.params.holiday.date.month-1]}</Text>
            <Text style={styles.holidayDescription}>{this.props.route.params.holiday[this.state.language].description}</Text>
          </View>
        </ScrollView>
    )
  }
}

class categoriesHolidaysScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { categoriesHolidaysList: [], language: 'en' }
  }
  async componentDidMount() {
    var categories = [];
    for (let key in dictinory.en.categories) {
      categories.push(key);
    };

    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language, categoriesHolidaysList: categories });
  }
  render() {
    return(
      <View style={styles.container}>
        <FlatList
          data={this.state.categoriesHolidaysList}
          renderItem={({ item }) => (
          <TouchableOpacity onPress={() => this.openСategoryHolidayScreen(item)}>
            <View style={Object.assign({},
                          styles.item,
                          this.state.categoriesHolidaysList.indexOf(item)==0?
                            {}
                            :
                            {borderTopColor: '#d6d7da', borderTopWidth: 1.5, lineHeight: 10}
                        )}>
              <Text style={styles.name}>{dictinory[this.state.language].categories[item]}</Text>
              <Icon name='angle-right' type='font-awesome' color={'#d6d7da'} size={80} iconStyle={styles.categoriesHolidaysScreenAngleRight}/>
            </View>
          </TouchableOpacity>
          )}
        />
      </View>
    )
  }
  openСategoryHolidayScreen(category) {
    let parameters = {category: category};
    this.props.navigation.navigate('categoryHolidaysScreen', parameters);
  }
}

class categoryHolidaysScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { categoryHolidaysList: [], language: 'en' }
  }
  async componentDidMount() {
    await loadHolidays();

    var upcomingHolidaysScreen = this;

    var customHolidays = JSON.parse(await AsyncStorage.getItem('customHolidays'));
    var defaultHolidays = JSON.parse(await AsyncStorage.getItem('defaultHolidays'));

    if ((await NetInfo.fetch()).isInternetReachable) {
      await loadUpdatedHolidays();
    }
    var updatedHolidays = await AsyncStorage.getItem('updatedHolidays');
    updatedHolidays = updatedHolidays==null?[]:JSON.parse(updatedHolidays);

    var holidaysList = defaultHolidays.concat(customHolidays).concat(updatedHolidays);

    var categoryHolidaysList = sortByDate(holidaysList.filter(function(holiday) {
      return (holiday.category == upcomingHolidaysScreen.props.route.params.category);
    }));

    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({categoryHolidaysList: categoryHolidaysList, language: language});
  }
  render() {
    return(
      <View style={styles.container}>
        <FlatList
          data={this.state.categoryHolidaysList}
          renderItem={({ item }) => (
          <TouchableOpacity onPress={() => this.openHolidayScreen(item.en.name)}>
            <View
              style={
                Object.assign({},
                              styles.item,
                              (item.date.day == date.getDate() && item.date.month == (date.getMonth()+1)) ?
                              {borderColor: '#f7941d', borderWidth: 3}
                              :
                              (this.state.categoryHolidaysList.indexOf(item)==0?
                              {}
                              :
                              {borderTopColor: '#d6d7da', borderTopWidth: 1.5, lineHeight: 10})
                            )
                          }>
              <Text style={Object.assign({}, styles.name, (item.important)?{fontWeight: "500"}:{})}>{item[this.state.language].name}</Text>
              <Text style={styles.holidayDate}>{item.date.day+" "+dictinory[this.state.language].months[item.date.month-1]}</Text>
              <Icon name='angle-right' type='font-awesome' color={'#d6d7da'} size={80} iconStyle={styles.angleRight}/>
            </View>
          </TouchableOpacity>
          )}
        />
      </View>
    )
  }
  openHolidayScreen(name) {
    let parameters = {holiday: {}};
    for (let i = 0; i < this.state.categoryHolidaysList.length; i++) {
      if(name == this.state.categoryHolidaysList[i].en.name){
        parameters.holiday = this.state.categoryHolidaysList[i];
      }
    }
    this.props.navigation.navigate('holidayScreen', parameters);
  }
}

class settingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'en' };
  }
  async componentDidMount() {
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language });
  }
  render() {
    return(
      <View style={styles.container}>
        <View style={Object.assign({}, styles.item, {borderBottomWidth: 1.5, height:60, borderTopWidth: 1.5, borderColor: '#d6d7da', top: "30%"})}>
          <TouchableOpacity onPress={() => this.openSettingsLanguageScreen()}>
            <View>
              <Text style={styles.settingsScreenSectionName}>{dictinory[this.state.language].settings.languageButtonText}</Text>
              <Icon name='angle-right' type='font-awesome' color={'#d6d7da'} size={60} iconStyle={styles.settingsScreenAngleRight}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  openSettingsLanguageScreen() {
    this.props.navigation.navigate('settingsLanguageScreen', {title: dictinory[this.state.language].settingsLanguage.title});
  }
}

class settingsLanguageScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enFlagIcon: '',
      ruFlagIcon: '',
      warningMessageText: '',
      buttonText: '',
      language: ''
    }
  }
  async componentDidMount() {
    var selectedLanguage = await AsyncStorage.getItem('language');
    var selectedLanguage = selectedLanguage=='ru'||selectedLanguage=='ruByDevice'?'ru':'en';
    this.setState({
      enFlagIcon: selectedLanguage=='en'?resurces.unitedStatesFlagSelect:resurces.unitedStatesFlag,
      ruFlagIcon: selectedLanguage=='ru'?resurces.russiaFlagSelect:resurces.russiaFlag,
      warningMessageText: dictinory[selectedLanguage].settingsLanguage.warningMessageText,
      buttonText: dictinory[selectedLanguage].settingsLanguage.applyButtonText,
      language: selectedLanguage
    })
  }
  render() {
    return(
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.changeLocalLanguage('ru')} style={styles.russiaFlagButton}>
          <Image
            style={styles.FlagImage}
            source={this.state.ruFlagIcon}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.changeLocalLanguage('en')} style={styles.unitedStatesFlagButton}>
          <Image
            style={styles.FlagImage}
            source={this.state.enFlagIcon}
            />
        </TouchableOpacity>
        <Text style={styles.warningMessage}>{this.state.warningMessageText}</Text>
        <TouchableOpacity onPress={() => this.apply()} style={styles.applyButton}>
          <View>
            <Image
              style={styles.applyButtonImage}
              source={resurces.applyButton}
              />
            <Text style={styles.applyButtonText}>{this.state.buttonText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  changeLocalLanguage(language){
    this.props.navigation.setOptions({ title: dictinory[language].settingsLanguage.title });
    this.setState({
      language: language,
      enFlagIcon: language=='en'?resurces.unitedStatesFlagSelect:resurces.unitedStatesFlag,
      ruFlagIcon: language=='ru'?resurces.russiaFlagSelect:resurces.russiaFlag,
      warningMessageText: dictinory[language].settingsLanguage.warningMessageText,
      buttonText: dictinory[language].settingsLanguage.applyButtonText,
    })
  }
  async apply(){
    await AsyncStorage.setItem('language', this.state.language);
    await AsyncStorage.removeItem('notificationsList')
    await Notifications.cancelAllScheduledNotificationsAsync()
    Updates.reload();
  }
}


class firstScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'en' };
  }
  async componentDidMount() {
    await loadLanguage();
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language });
  }
  render() {
    return(
      <Stack.Navigator>
      <Stack.Screen
        name="upcomingHolidaysScreen"
        component={upcomingHolidaysScreen}
        options={{
          headerBackTitle: dictinory[this.state.language].backButtonText,
          title: dictinory[this.state.language].upcomingHolidays.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="holidayScreen"
        component={holidayScreen}
        options={{
          headerBackTitle: dictinory[this.state.language].backButtonText,
          title: dictinory[this.state.language].upcomingHolidays.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
    </Stack.Navigator>
    )
  }
}

class secondScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'en' };
  }
  async componentDidMount() {
    await loadLanguage();
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language });
  }
  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen
          name="categoriesHolidaysScreen"
          component={categoriesHolidaysScreen}
          options={{
            headerBackTitle: dictinory[this.state.language].backButtonText,
            title: dictinory[this.state.language].categoriesHolidays.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
        <Stack.Screen
          name="categoryHolidaysScreen"
          component={categoryHolidaysScreen}
          options={({ route }) => ({
            headerBackTitle: dictinory[this.state.language].backButtonText,
            title: dictinory[this.state.language].categories[route.params.category],
            headerTitleStyle: {
              fontSize: 21,
            },
          })}
        />
        <Stack.Screen
          name="holidayScreen"
          component={holidayScreen}
          options={{
            headerBackTitle: dictinory[this.state.language].backButtonText,
            title: dictinory[this.state.language].upcomingHolidays.title,
            headerTitleStyle: {
              fontSize: 21,
            },
          }}
        />
    </Stack.Navigator>
    )
  }
}

class thirdScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'en' };
  }
  async componentDidMount() {
    await loadLanguage();
    var language = await AsyncStorage.getItem('language');
    language = language=='ru'||language=='ruByDevice'?'ru':'en';

    this.setState({ language: language });
  }
  render() {
    return(
      <Stack.Navigator>
      <Stack.Screen
        name="settingsScreen"
        component={settingsScreen}
        options={{
          headerBackTitle: dictinory[this.state.language].backButtonText,
          title: dictinory[this.state.language].settings.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
      <Stack.Screen
        name="settingsLanguageScreen"
        component={settingsLanguageScreen}
        options={{
          headerBackTitle: dictinory[this.state.language].backButtonText,
          title: dictinory[this.state.language].settingsLanguage.title,
          headerTitleStyle: {
            fontSize: 21,
          },
        }}
      />
    </Stack.Navigator>
    )
  }
}


export default class App extends React.Component {
  constructor(props) {
    super(props);
  }
  async componentDidMount() {
    setNotifications();
  }
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator tabBarOptions={{
          activeTintColor: '#f7941d',
          tabStyle: { justifyContent: 'center' },
          showLabel: false
        }}>
          <Tab.Screen
          name="firstScreen"
          component={firstScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='calendar' type='foundation' color={color} size={38} iconStyle={{textAlignVertical: 'center'}}/>
            ),
          }}/>
          <Tab.Screen
          name="secondScreen"
          component={secondScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='align-justify' type='foundation' color={color} size={32} iconStyle={{textAlign: 'center',}}/>
            ),
          }}/>
          <Tab.Screen
          name="thirdScreen"
          component={thirdScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='cog' type='font-awesome' color={color} size={29} iconStyle={{justifyContent: 'center'}}/>
            ),
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
