// Metro config para monorepo (Expo + npm workspaces).
// Permite ao mobile resolver o pacote @pulsepass/shared na raiz do repo.
// Doc: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Observa a raiz do workspace (onde vive packages/shared).
config.watchFolders = [workspaceRoot];

// 2. Resolve módulos tanto no app quanto na raiz.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Habilita "package exports" (campo exports do @pulsepass/shared).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
