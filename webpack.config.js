const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const getFirebaseConfig = require('./firebaseConfig.web');

const modulesDir = path.resolve(__dirname, 'modules');

module.exports = module.exports = (env, argv) => {
  const target = env.target || 'dev';
  console.info('Bundling for: ', target);
  console.info('');

  const mode = argv.mode;
  const isDevelopment = mode === 'development';

  return {
    mode,
    devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
    target: 'web',
    entry: {
      main: path.resolve(modulesDir, 'web/index.js'),
    },
    output: {
      path: path.resolve(modulesDir, 'firebase/public'),
      publicPath: '/',
      filename: isDevelopment
        ? 'static/js/bundle.js'
        : 'static/js/[name].[contenthash:8].js',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: [
            path.resolve(modulesDir, 'index.web.js'),
            modulesDir,
            path.resolve(__dirname, 'node_modules/react-native-reanimated'),
            path.resolve(
              __dirname,
              'node_modules/react-native-gesture-handler',
            ),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              // Disable reading babel configuration
              babelrc: false,
              configFile: false,
              cacheDirectory: true,
              cacheCompression: false,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    bugfixes: true,
                    useBuiltIns: 'usage',
                    corejs: { version: '3.16' },
                    shippedProposals: true,
                    loose: false,
                  },
                ],
                '@babel/preset-react',
                '@babel/preset-flow',
              ],
              plugins: [
                ['react-native-web', { commonjs: true }],
                isDevelopment && require('react-refresh/babel'),
                'react-native-reanimated/plugin',
              ].filter(Boolean),
              assumptions: {
                arrayLikeIsIterable: true,
                constantReexports: true,
                constantSuper: true,
                enumerableModuleMeta: true,
                ignoreFunctionLength: true,
                ignoreToPrimitiveHint: true,
                mutableTemplateObject: true,
                noClassCalls: true,
                noDocumentAll: true,
                noIncompleteNsImportDetection: true,
                noNewArrows: true,
                privateFieldsAsProperties: true,
                setClassMethods: true,
                setComputedProperties: true,
                setPublicClassFields: true,
              },
              env: {
                production: {
                  plugins: ['react-native-paper/babel'],
                },
              },
            },
          },
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
            },
          ],
        },
        {
          test: /\.(jpg|png|woff|woff2|eot|ttf)$/,
          loader: 'file-loader',
        },
      ],
    },
    resolve: {
      modules: ['node_modules', modulesDir],
      alias: {
        'react-native$': require.resolve('react-native-web'),
        '@appComponents': path.resolve(modulesDir, 'components'),
        '@webComponents': path.resolve(modulesDir, 'web/components'),
        '@mobileComponents': path.resolve(modulesDir, 'mobile/components'),
        '@appFirebase': path.resolve(modulesDir, 'firebase'),
        '@appUtils': path.resolve(modulesDir, 'utils'),
        /* We alias these modules to silence errors coming from react-native-paper
         * We can ignore these errors because we're using our custom icons and not vector-icons */
        'react-native-vector-icons/MaterialCommunityIcons': path.resolve(
          modulesDir,
          'components/theme/Icon.js',
        ),
      },
      extensions: ['.web.js', '.js', '.json'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './modules/web/public/index.html',
        inject: true,
      }),
      new webpack.DefinePlugin({
        __DEV__: isDevelopment,
        process: { env: {} },
        __FIREBASE_CONFIG__: JSON.stringify(getFirebaseConfig(target)),
      }),
      isDevelopment && new ReactRefreshPlugin(),
    ].filter(Boolean),
    devServer: {
      compress: true,
      host: '0.0.0.0',
      port: 9001,
      transportMode: 'ws',
      historyApiFallback: true,
      overlay: true,
      useLocalIp: true,
      contentBase: path.resolve(modulesDir, 'web/public'),
    },
  };
};
