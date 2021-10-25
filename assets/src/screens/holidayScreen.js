import * as React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  TextInput,
} from "react-native";

import CheckBox from "react-native-check-box";

import {
  LanguageContext,
  setHolidayNotificationAsync,
  cancelNotificationByTitleIfExist,
  ColorSheet,
  ObjectFormatASDW,
} from "../utils";

const styles = StyleSheet.create({
  name: {
    fontSize: 26,
    top: 20,
  },
  date: {
    fontSize: 22,
    color: ColorSheet.text.subtitle,
    top: 30,
  },
  paragraph: {
    fontSize: 19,
    marginTop: 10,
  },
  image: {
    marginTop: 10,
  },
  article: {
    top: 30,
  },
  scrollViewContainer: {
    paddingHorizontal: "4%",
    flex: 1,
    marginBottom: 40,
  },
  container: {
    height: "100%",
    backgroundColor: ColorSheet.backgroundColor,
  },
  forNotesText: { fontSize: 21, textAlign: "center", marginVertical: 6 },
  notesContainer: {
    top: 40,
    borderColor: "#cccccc",
    borderRadius: 30,
    borderWidth: 1,
    paddingBottom: 21,
    paddingHorizontal: "4%",
    marginTop: 15,
    marginBottom: 25,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
    fontSize: 19,
  },
  strokesWithCheckBoxContainer: {
    marginTop: 30,
  },
});

const screenWidth = Dimensions.get("window").width;

function StrokeWithCheckBox({
  text,
  onChange = (_value) => {},
  initDataPromise,
}) {
  const styles = StyleSheet.create({
    checkboxContainer: {
      flexDirection: "row",
      marginVertical: 5,
      justifyContent: "space-between",
    },
    text: {
      fontSize: 21,
    },
  });

  const [isChecked, setChecked] = React.useState(null);

  const onClick = () => {
    onChange(!isChecked);
    setChecked(!isChecked);
  };

  React.useEffect(() => {
    let stop = false;
    if (!stop) {
      (async () => {
        let newValue = await initDataPromise;
        if (isChecked == null) {
          setChecked(newValue);
        }
      })();
    }
    return () => {
      stop = true;
    };
  }, []);

  return (
    <View style={styles.checkboxContainer}>
      <Text style={styles.text}>{text}</Text>
      {isChecked == null ? null : (
        <CheckBox
          checkedCheckBoxColor={ColorSheet.primaryColor}
          uncheckedCheckBoxColor={"#666666"}
          isChecked={isChecked}
          onClick={onClick}
        />
      )}
    </View>
  );
}

function ArticleImage({ uri, maxSize, style = {} }) {
  /*
  Image loading for resizing, can take too much time on IOS
  */
  const [size, setSize] = React.useState({
    height: screenWidth,
    width: screenWidth,
  });

  const getSizePromise = new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });

  React.useEffect(() => {
    let stop = false;
    const sideEffect = async () => {
      try {
        const { width, height } = await getSizePromise;

        let resizedWidth, resizedHeight;

        if (width > height) {
          resizedWidth = maxSize;
          resizedHeight = (height / width) * maxSize;
        } else {
          resizedHeight = maxSize;
          resizedWidth = (width / height) * maxSize;
        }

        setSize({
          height: resizedHeight,
          width: resizedWidth,
        });
      } catch (error) {
        if (__DEV__) console.warn(error);
      }
    };

    if (!stop) {
      sideEffect();
    }

    return () => {
      stop = true;
    };
  }, []);

  return <Image style={{ ...style, ...size }} source={{ uri }} />;
}

function Article({
  text,
  images,
  containerStyle,
  paragraphsStyle,
  imagesStyle,
}) {
  let texts = text.split("%i");
  let renderElements = [];

  for (let i = 0; i < texts.length; i++) {
    const paragraph = texts[i];

    if (paragraph) {
      renderElements.push(
        <Text key={i.toString()} style={paragraphsStyle}>
          {paragraph.trim()}
        </Text>
      );
    }

    if (images != null && i < images.length && i < texts.length - 1) {
      renderElements.push(
        <ArticleImage
          style={imagesStyle}
          key={i + "i"}
          uri={"http://holidays-app.github.io/holidays/images/" + images[i]}
          maxSize={screenWidth * 0.92}
        />
      );
    }
  }

  return <View style={containerStyle}>{renderElements}</View>;
}

function holidayScreen({ route }) {
  const { dictinory, language } = React.useContext(LanguageContext);

  const [noteText, setNoteText] = React.useState(null);

  React.useEffect(() => {
    let stop = false;
    if (!stop && noteText === null) {
      (async () => {
        setNoteText(
          await ObjectFormatASDW.getData({
            dataName: "notes",
            key: route.params.holiday.id,
            defaultResult: "",
          })
        );
      })();
    }
    return () => {
      stop = true;
    };
  }, []);

  return (
    /* 
    IOS bug: TextInput doesn't move up when keyboard shows
    */
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.scrollViewContainer}>
          <Text style={styles.name}>{route.params.holiday.name}</Text>
          <Text style={styles.date}>
            {route.params.holiday.date.day +
              " " +
              dictinory.months[route.params.holiday.date.month - 1]}
          </Text>
          <Article
            containerStyle={styles.article}
            paragraphsStyle={styles.paragraph}
            imagesStyle={styles.image}
            text={route.params.holiday.description}
            images={route.params.holiday.images}
          />
          <View style={styles.notesContainer}>
            <Text style={styles.forNotesText}>
              {dictinory.holidayScreen.forNotes}
            </Text>
            <TextInput
              style={styles.notesInput}
              multiline={true}
              value={noteText}
              onChangeText={(text) => {
                setNoteText(text);

                ObjectFormatASDW.setData({
                  dataName: "notes",
                  key: route.params.holiday.id,
                  dataForSave: text,
                  sessionId: "saveNotes",
                  onSuccess: (_isValueChanged) => {
                    setHolidayNotificationAsync(route.params.holiday, language);
                  },
                });
              }}
            />
          </View>
          <View style={styles.strokesWithCheckBoxContainer}>
            <StrokeWithCheckBox
              text={dictinory.holidayScreen.holidayImportanceCheckBox}
              onChange={(isHolidayImportant) => {
                ObjectFormatASDW.setData({
                  dataName: "holidaysImportance",
                  key: route.params.holiday.id,
                  dataForSave: isHolidayImportant,
                  sessionId: "saveHolidaysImportance",
                });
              }}
              initDataPromise={
                new Promise(async (resolve, _reject) => {
                  resolve(
                    await ObjectFormatASDW.getData({
                      dataName: "holidaysImportance",
                      key: route.params.holiday.id,
                      defaultResult: false,
                    })
                  );
                })
              }
            />
            <StrokeWithCheckBox
              text={dictinory.holidayScreen.notificationCheckBox}
              onChange={(isNotify) => {
                ObjectFormatASDW.setData({
                  dataName: "holidaysNotificationsRules",
                  key: route.params.holiday.id,
                  dataForSave: isNotify,
                  sessionId: "saveHolidaysNotificationsRules",
                  onSuccess: (isValueChanged) => {
                    if (isValueChanged) {
                      if (isNotify) {
                        setHolidayNotificationAsync(route.params.holiday);
                      } else {
                        cancelNotificationByTitleIfExist(
                          route.params.holiday.name
                        );
                      }
                    }
                  },
                });
              }}
              initDataPromise={
                new Promise(async (resolve, _reject) => {
                  resolve(
                    await ObjectFormatASDW.getData({
                      dataName: "holidaysNotificationsRules",
                      key: route.params.holiday.id,
                      defaultResult: true,
                    })
                  );
                })
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default holidayScreen;
