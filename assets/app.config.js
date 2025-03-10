module.exports = {
  expo: {
    name: "Billor-Driver-app",
    slug: "Billor-Driver-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "br.com.billor.driver",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      "package": "br.com.billor.driver"
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "e7abb556-fcaa-449d-a377-20ea138e82b8",
      },
    },
    plugins: ["expo-router", "expo-build-properties"],
    scheme: "billor-driver-app",
  },
};
