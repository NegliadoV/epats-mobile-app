// Metro: подключаем общий код сайта (../src/lib) без дублирования.
// Статьи, расчёты бюджета и т.п. — один источник правды для web и mobile.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../src/lib');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];
// Зависимости общих файлов (например, zod) в первую очередь берём из mobile/node_modules
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = config;
