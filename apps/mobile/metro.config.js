const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch workspace root so Metro can see packages/*
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  '@aroham/shared-types': path.resolve(workspaceRoot, 'packages/shared-types/src'),
  '@aroham/shared-config': path.resolve(workspaceRoot, 'packages/shared-config/src'),
  '@aroham/shared-utils': path.resolve(workspaceRoot, 'packages/shared-utils/src'),
  '@aroham/shared-services': path.resolve(workspaceRoot, 'packages/shared-services/src'),
  '@aroham/shared-api': path.resolve(workspaceRoot, 'packages/shared-api/src'),
  '@aroham/shared-auth': path.resolve(workspaceRoot, 'packages/shared-auth/src'),
  '@aroham/shared-state': path.resolve(workspaceRoot, 'packages/shared-state/src'),
  '@aroham/shared-hooks': path.resolve(workspaceRoot, 'packages/shared-hooks/src'),
  '@aroham/shared-validation': path.resolve(workspaceRoot, 'packages/shared-validation/src'),
  '@': path.resolve(projectRoot, 'src'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

// Intercept resolution for react and react-native modules to enforce single instance from mobile-app/node_modules
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName.startsWith('react/') ||
    moduleName === 'react-native' ||
    moduleName.startsWith('react-native/') ||
    moduleName === 'react-dom' ||
    moduleName === 'scheduler'
  ) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.resolve(projectRoot, 'App.tsx'),
      },
      moduleName,
      platform
    );
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
