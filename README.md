# StudyOS

A minimal study planner for Android and the web, built with Expo and React Native.

## Current features
- Daily task list with subject and due-date labels
- Mark tasks complete or remove them
- Syllabus progress tracker for Tamil, English, Mathematics, Physics, Chemistry, and Computer Science
- Light/dark theme toggle
- Local persistence on the device/browser

## Run locally
```bash
npm install
npx expo start
```

Press `w` for the web version. Scan the QR code with Expo Go for Android.

## Next milestones
1. Add calendar-based deadlines and local notifications.
2. Add Supabase authentication and cloud sync (requires a Supabase project URL and anon key).
3. Add chapter-level syllabus editing, weekly timetable, and revision planner.

Cloud sync is not enabled yet; the current version saves locally. Never commit private API keys.
