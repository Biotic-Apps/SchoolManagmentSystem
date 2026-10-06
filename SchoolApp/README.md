# eSchool Android (SchoolApp)

Kotlin + Jetpack Compose, multi-module (`build-logic` convention plugins, `:core:*`, `:feature:*`, `:app`).
See `../docs/architecture.md` §9 for the module layout and threading rules.

## Build and test

```bash
gradlew.bat assembleDebug testDebugUnitTest      # Windows
./gradlew assembleDebug testDebugUnitTest         # macOS / Linux / Git Bash
```

Install on a connected device (USB or wireless adb):

```bash
set ANDROID_SERIAL=192.168.100.52:38087          # adb devices shows the serial
gradlew.bat :app:installDebug
```

## Pointing the app at the API

The base URL is a Gradle property per build type (default shown):

| Property | Default | Used by |
|---|---|---|
| `schoolapp.apiBaseUrl.debug` | `http://10.0.2.2:3000/api/v1/` (emulator → host PC) | debug builds |
| `schoolapp.apiBaseUrl.release` | `https://api.example.com/api/v1/` | release builds |

A **real phone** cannot reach `10.0.2.2`. Use the PC's LAN address instead:

1. Find the PC's IPv4 address: `ipconfig` (look under the active Wi-Fi/Ethernet adapter, e.g. `192.168.100.67`).
   Phone and PC must be on the same network.
2. Start the API (`../SchoolApi`, port 3000). Allow inbound TCP 3000 in Windows Firewall if the phone cannot connect.
3. Set the property **outside version control**, either in your user-level file
   `%USERPROFILE%\.gradle\gradle.properties` (recommended), or for one build on the command line:

   ```properties
   # %USERPROFILE%\.gradle\gradle.properties
   schoolapp.apiBaseUrl.debug=http://192.168.100.67:3000/api/v1/
   ```

   ```bash
   gradlew.bat :app:installDebug -Pschoolapp.apiBaseUrl.debug=http://192.168.100.67:3000/api/v1/
   ```

   Do not commit a personal IP to `SchoolApp/gradle.properties`.
4. Rebuild and reinstall the debug app.

Cleartext HTTP is allowed **only in debug builds and only to** `10.0.2.2`, `localhost`, `127.0.0.1` and the host of
`schoolapp.apiBaseUrl.debug`: the task `generateDebugNetworkSecurityConfig` writes
`network_security_config_debug.xml` from that property. Release builds use HTTPS only.

Seeded demo accounts (dev API only): `admin@eschool.local`, `principal@eschool.local`, `coordinator@eschool.local`,
`teacher@eschool.local`, `accountant@eschool.local`, `parent@eschool.local`, `teacherparent@eschool.local`
— password `Demo@1234`.

## Debug-only role preview

Debug builds show **Preview a role** under the login form. It opens the role shell with local sample data (no server),
including a custom role ("Front Desk") whose menu is built from its permissions. Release builds do not contain it
(`app/src/debug`).

## Auth behaviour (contract `../docs/api/phase1-contract.md`)

- Login sends `platform: ANDROID` and the device model; tokens are stored with DataStore encrypted by an Android
  Keystore AES-GCM key.
- 401 → one shared refresh (`/auth/refresh`, rotated tokens). A rejected refresh (revoked, reused, disabled account)
  clears tokens and the local database and returns to login.
- `/me` is reloaded after login and every time the app comes to the foreground, so role/permission changes apply
  without signing out. Role switching sends `X-Active-Role` and reloads `/me`.
- `mustChangePassword` shows a forced Change Password screen before anything else.

## Push notifications (FCM)
Push is optional. The app registers a device token with `POST /devices` after sign-in through
`DeviceRegistrar`, using the `PushTokenProvider` bound in `:core:data` (`PushModule`). Until a Firebase
project is configured the binding is `NoOpPushTokenProvider` (no token, nothing is sent; in-app
notifications still work). To enable push: add `app/google-services.json` and the google-services Gradle
plugin, add `firebase-messaging`, implement `PushTokenProvider` with `FirebaseMessaging.getInstance().token`,
bind it instead of the no-op, and add a `FirebaseMessagingService` that re-registers on `onNewToken`.

## Offline daily work
Attendance marks are saved in Room before any network call; draft saves and submits that cannot reach
the server are queued in the outbox with a `clientRequestId` (also sent as `Idempotency-Key`) and replayed
in order by `SyncWorker`. A queued register rejected by the server (e.g. `409 ALREADY_SUBMITTED`) is shown
as "needs review" on the register screen. Diary saves/publishes queue the same way; a publish of an entry
created offline references the queued save through an outbox ref (`{ref:<clientRequestId>}`).
