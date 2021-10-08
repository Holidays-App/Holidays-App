import * as React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";

import { LanguageContext } from "../../App";

const styles = StyleSheet.create({
  name: {
    fontSize: 26,
    top: 20,
  },
  date: {
    fontSize: 22,
    color: "#666666",
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
    paddingLeft: "4%",
    paddingRight: "4%",
    flex: 1,
    marginBottom: 40,
  },
  container: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
});

const screenWidth = Dimensions.get("window").width;

function ArticleImage({ uri, maxSize, style = {} }) {
  const [size, setSize] = React.useState({
    height: screenWidth,
    width: screenWidth,
  });

  Image.getSize(uri, (width, height) => {
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
  });

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
        <Text key={i} style={paragraphsStyle}>
          {paragraph.trim()}
        </Text>
      );
    }

    if (images != null && i < images.length && i < texts.length - 1) {
      renderElements.push(
        <ArticleImage
          style={imagesStyle}
          key={i + "i"}
          uri={images[i]}
          maxSize={screenWidth * 0.92}
        />
      );
    }
  }

  return <View style={containerStyle}>{renderElements}</View>;
}

function holidayScreen({ route }) {
  const { dictinory } = React.useContext(LanguageContext);

  return (
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default holidayScreen;
