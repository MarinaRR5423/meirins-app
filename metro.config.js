const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-health es iOS only — en Android lo reemplazamos por un stub vacío
// para que Gradle no intente compilar su código nativo inexistente.
const healthStub = path.resolve(__dirname, 'src/stubs/react-native-health-stub.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'android' && moduleName === 'react-native-health') {
    return { filePath: healthStub, type: 'sourceFile' };
  }
  // Para todo lo demás, resolución normal
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
