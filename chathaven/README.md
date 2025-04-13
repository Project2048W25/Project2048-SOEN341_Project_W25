## Available Scripts

In the project directory, you can run:
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Custom Project Scripts
### `npm run tree-print`
prints the tree of the project in the console
```
npx tree-cli --ignore node_modules --ignore build -l 999
```
**ref**: https://www.npmjs.com/package/tree-cli 

### `npm run tailwindcss-build-watch`
Compiles the tailwindcss styles and watches for changes
```
npx @tailwindcss/cli -i ./src/styles/index.css -o ./styles/tailwind.CSS/tailwind.css --watch
npx npx @tailwindcss/cli -i ./src/styles/root_index.css -o ./styles/tailwind.CSS/tailwind.css --watch

```
Tailwind v4.x ref: https://tailwindcss.com/docs/installation 

### `npm run prod`
Runs the app in production mode on localhost 
```
npm run build && serve -s build
```
ref: https://www.npmjs.com/package/serve

### /chathaven tree (as of 2025-04-13)
```
├── README.md
├── __mocks__
|  └── fileMock.js
├── babel.config.json
├── coverage
|  ├── clover.xml
|  ├── coverage-final.json
|  ├── lcov-report
|  |  ├── Login.jsx.html
|  |  ├── Signup.jsx.html
|  |  ├── base.css
|  |  ├── block-navigation.js
|  |  ├── favicon.png
|  |  ├── index.html
|  |  ├── prettify.css
|  |  ├── prettify.js
|  |  ├── sort-arrow-sprite.png
|  |  ├── sorter.js
|  |  └── src
|  |     ├── App.js.html
|  |     ├── Pages
|  |     |  ├── AdminView.jsx.html
|  |     |  ├── App.jsx.html
|  |     |  ├── ChannelDM.jsx.html
|  |     |  ├── ChannelDashboard.jsx.html
|  |     |  ├── FooterLink.jsx.html
|  |     |  ├── Forgot.jsx.html
|  |     |  ├── ForgotPassword.jsx.html
|  |     |  ├── FormInput.jsx.html
|  |     |  ├── GoogleCallback.jsx.html
|  |     |  ├── Login.jsx.html
|  |     |  ├── MemberDM.jsx.html
|  |     |  ├── MemberView.jsx.html
|  |     |  ├── MembersList.jsx.html
|  |     |  ├── Sidebar.jsx.html
|  |     |  ├── Signup.jsx.html
|  |     |  ├── SocialButton.jsx.html
|  |     |  ├── TeamAdminView.jsx.html
|  |     |  └── index.html
|  |     ├── components
|  |     |  ├── ActiveChatView.jsx.html
|  |     |  ├── Button.jsx.html
|  |     |  ├── ChatHeader.jsx.html
|  |     |  ├── ContextMenu.jsx.html
|  |     |  ├── IncomingMessage.jsx.html
|  |     |  ├── OutgoingMessage.jsx.html
|  |     |  ├── SideBar.jsx.html
|  |     |  ├── TextField.jsx.html
|  |     |  └── index.html
|  |     ├── index.html
|  |     ├── index.js.html
|  |     ├── reportWebVitals.js.html
|  |     ├── services
|  |     |  ├── authService.js.html
|  |     |  ├── index.html
|  |     |  ├── profileService.js.html
|  |     |  └── userService.js.html
|  |     ├── stories
|  |     |  ├── Button.jsx.html
|  |     |  ├── Button.stories.js.html
|  |     |  ├── Header.jsx.html
|  |     |  ├── Header.stories.js.html
|  |     |  ├── Page.jsx.html
|  |     |  ├── Page.stories.js.html
|  |     |  └── index.html
|  |     └── utils
|  |        ├── index.html
|  |        └── supabaseClient.js.html
|  └── lcov.info
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
|  ├── favicon.ico
|  ├── index.html
|  ├── logo.svg
|  ├── logo192.png
|  ├── logo512.png
|  ├── manifest.json
|  ├── robots.txt
|  └── sitemap.xml
├── react-router-dom.js
├── src
|  ├── App.js
|  ├── Pages
|  |  ├── AdminView.jsx
|  |  ├── App.jsx
|  |  ├── ChannelDM.jsx
|  |  ├── ChannelDashboard.jsx
|  |  ├── FooterLink.jsx
|  |  ├── Forgot.jsx
|  |  ├── ForgotPassword.jsx
|  |  ├── FormInput.jsx
|  |  ├── GoogleCallback.jsx
|  |  ├── Login.jsx
|  |  ├── MemberDM.jsx
|  |  ├── MemberView.jsx
|  |  ├── MembersList.jsx
|  |  ├── Sidebar.jsx
|  |  ├── Signup.jsx
|  |  ├── SocialButton.jsx
|  |  └── TeamAdminView.jsx
|  ├── __tests__
|  |  ├── App.test.js
|  |  ├── GoogleLogin.test.js
|  |  ├── JoinGroup.test.js
|  |  ├── Login.test.js
|  |  ├── Message.test.js
|  |  ├── OnlineStatus.test.js
|  |  └── SignUp.test.js
|  ├── assets
|  |  ├── icons
|  |  |  ├── Ellipse 2.svg
|  |  |  ├── bi_github.svg
|  |  |  ├── closed-eye.svg
|  |  |  ├── devicon_google.svg
|  |  |  ├── fluent_checkbox-checked-16-filled.svg
|  |  |  ├── frame-3.svg
|  |  |  ├── line-1.svg
|  |  |  ├── line-2.svg
|  |  |  ├── line-3.svg
|  |  |  ├── logos_facebook.svg
|  |  |  ├── more.svg
|  |  |  ├── pending_message_icon.svg
|  |  |  ├── slice-1.svg
|  |  |  └── trash.svg
|  |  └── logo.svg
|  ├── components
|  |  ├── ActiveChatView.jsx
|  |  ├── Button.jsx
|  |  ├── ChatHeader.jsx
|  |  ├── ContextMenu.jsx
|  |  ├── IncomingMessage.jsx
|  |  ├── OutgoingMessage.jsx
|  |  ├── SideBar.jsx
|  |  └── TextField.jsx
|  ├── index.js
|  ├── reportWebVitals.js
|  ├── services
|  |  ├── authService.js
|  |  ├── profileService.js
|  |  └── userService.js
|  ├── setupTests.js
|  ├── styles
|  |  ├── App.css
|  |  ├── index.css
|  |  ├── root_index.css
|  |  └── tailwind.CSS
|  |     └── tailwind.css
|  └── utils
|     └── supabaseClient.js
├── stylelint.config.js
└── styles
   └── tailwind.CSS
      └── tailwind.css

```
___ 

