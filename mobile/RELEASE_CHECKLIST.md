# Where I've Been Mobile Release Checklist

## App Identity
- Confirm Android package: `com.dgnlabs.whereivebeen`
- Set production app name, icon, adaptive icon, and splash assets.
- Bump `expo.version`, Android `versionCode`, and Android `versionName` for every release.

## Firebase
- Add the Android app in the existing Firebase project.
- Download `google-services.json` and place it at `mobile/android/app/google-services.json` for native builds.
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Storage uploads are disabled on Spark plan. Use image URLs until the project moves to Blaze.
- Push functions are disabled on Spark plan. Deploy `functions` only after the project moves to Blaze.

## Privacy And Safety
- Verify report review flow in `/admin`.
- Verify block list hides community posts on mobile.
- Verify account deletion requests appear in admin.
- Publish privacy policy URL before Play Store upload.

## QA
- Register a fresh user and confirm the account starts empty.
- Create pins, gallery items, journal entries, collections, posts, likes, comments, and reports.
- Confirm site and mobile see the same `communityPosts`.
- Test offline first open with a previously signed-in account.
- Test push token registration on a real Android device after Blaze/functions are enabled.

## Build
- Only build APK/AAB after final Firebase config and rules are deployed.
- Use Android Studio JBR if Gradle uses the wrong Java version locally.
