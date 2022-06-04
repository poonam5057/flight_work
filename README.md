# FlightWorks

## Quick Start Guide

Install dependencies and run one of the development scrips

```sh
npm install
npx pod-install

npm run start:web
npm run ios
npm run android
```

## Installing packages

Install packages like in any other web project using `npm`
When a native package (like reanimated or navigation) is installed run `npx pod-install`

## Development

Because this is a multi project repository - all the sources that would typically go into `./src`
are split into different directories under `./modules`

- `modules/web` - the web-app project
- `modules/mobile` - the mobile app project
- `modules/components` - general components that can be used in both apps mobile and web

We're using [Flow](https://flow.org) instead of PropTypes. PropTypes can be generated from type definitions
using [babel-plugin-flow-react-proptypes](https://www.npmjs.com/package/babel-plugin-flow-react-proptypes) if necessary
Adding Flow type definitions is optional, but it'll help IDE autocompletion and static analysis. 
It would be best to at least define the prop types in `module/components`

## Deploying

### Web
1. Run the appropriate build command - `build:web:staging` or `build:web:prod`
2. Run `deploy:staging` (or prod) to deploy everything - cloud functions, indexes ...
3. Run `deploy:web:staging` (or prod) to deploy only the js bundle (web app) to hosting

⚠ Deploy scripts would deploy the last thing you've `build` to the selected firebase project

### Native
Manually build the ios app from xCode and publish it

### Note on `.web.js`, `.native.js`

Platform specific code should typically go into each platform directory and not in `module/components`
But sometimes it might be necessary to a file defined with `.web.js`, `.native.js`, `.ios.js` or `.android.js`
which when imported somewhere will load the most specific file for the platform e.g. 
when there are `index.js`, `index.native.js` and `index.ios.js` the bundler will load the `.ios.js` file 
on iPhone, `.native.js` on Android, and only use `index.js` on web

References
- React Native Navigation: https://reactnavigation.org/docs/getting-started/
- React Native Paper: https://callstack.github.io/react-native-paper/index.html
- RN Firebase: https://rnfirebase.io/
- Web Firebase: https://www.npmjs.com/package/firebase
- Flow: https://flow.org/en/docs/
- Using multiple Firebase Project (dev,staging,prod): https://firebase.google.com/docs/projects/multiprojects

### Adding Icons
1. Adding `.svg` icons in [modules/theme/icons](modules/components/theme/icons)
2. Update the [index.js](modules/components/theme/icons/index.js) file with the import and the appropriate name
3. (Automatic) the icon is imported and registered in the theme (see [Icon.js](modules/components/theme/Icon.js))

The icon can now be used through it's _dash-case_ name e.g. `<Icon name="check-circle" />`

Some icons used internally by RN paper need to have specific names.
A warning is logged when such icon is missing, and it will appear as `□` on the screen

There's a `npm run generate-icons` script that can be issued to debug icon issues  
In the future we might use a script like that to generate the React Components ahead of time.

## Commit Convention
We're following https://www.conventionalcommits.org/en/v1.0.0/ with the addition that we append
the ticket ID to the commit message e.g.

```
feat(components/theme): FW-79 create AppThemeProvider
```

Todo: We'll set up the following commit hooks
- pre-commit: Lints the code and checks that the commit message matches our convention
- pre-push: Runs unit tests for the changes between your branch, and our primary PR branch
