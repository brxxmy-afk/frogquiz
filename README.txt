FROGQUIZ STARTER — READ FIRST

This is a learning prototype, not yet a production exam system.

WHAT WORKS
- Sample multiple-choice exam
- Teacher tab can edit questions using JSON
- Local grading and answer review
- Local results table
- Frog sizes based on scores, without showing student names/marks in the forest
- Saves exam/results in this browser
- Service worker for offline caching when hosted over HTTPS or localhost

IMPORTANT LIMITATIONS
- Local results are only stored in the same browser/device. They do NOT automatically reach the teacher's device.
- The teacher tab is not protected by a real login.
- Correct answers are included in the app, so this prototype is not secure against a student who inspects the files.
- No real exam deadlines, anti-cheating controls, cross-device sync, or server database yet.
- For a first test, use dummy names and sample data only.

FIRST TEST
1. Extract the ZIP into a folder called FrogQuiz-Starter.
2. Open index.html in Chrome on your computer.
3. Try the sample exam with a dummy name and submit it.
4. Click Teacher to view the local score.
5. To test true offline caching, the app must later be hosted on HTTPS (such as GitHub Pages), opened once while online, and then tested offline.
6. Do not rely on file:// mode for service-worker offline testing.

NEXT DEVELOPMENT STEPS
1. Publish this static prototype on free hosting.
2. Add install icons and proper PWA setup.
3. Separate teacher publishing from student exam-taking.
4. Add exam-package download and result-file import/export.
5. Add teacher-only secure authentication and a database only if needed.
