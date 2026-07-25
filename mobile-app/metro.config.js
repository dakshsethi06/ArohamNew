const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch parent folder to enable accessing frontend/logic
config.watchFolders = [workspaceRoot];

// Force Metro to resolve modules from mobile-app/node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Configure alias resolution & force single React instance to prevent "useState of null"
config.resolver.extraNodeModules = {
  '@logic': path.resolve(workspaceRoot, 'frontend/logic'),
  '@': path.resolve(projectRoot, 'src'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

module.exports = config;
