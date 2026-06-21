import "dotenv/config";
import { db, pool } from "./db.js";
import {
  lessonsTable, lessonContentTable, shortcutsTable,
  practiceTextsTable, achievementsTable, homepageContentTable,
} from "./schema.js";

async function seed() {
  console.log("🌱 Seeding TypeFlow database...\n");

  // ─── Wipe ───────────────────────────────────────────────────────────────────
  await db.delete(lessonContentTable);
  await db.delete(lessonsTable);
  await db.delete(shortcutsTable);
  await db.delete(practiceTextsTable);
  await db.delete(achievementsTable);
  await db.delete(homepageContentTable);

  // ─── Lessons ─────────────────────────────────────────────────────────────────
  const lessonDefs = [
    {
      level: 1, title: "Home Row Mastery", category: "fundamentals", difficulty: "beginner" as const,
      estimatedMinutes: 15, description: "Build the foundation of touch typing with the home row keys A S D F J K L.",
      instructions: "Place your fingers on the home row keys. Left hand: A S D F. Right hand: J K L ;. Type each key without looking at the keyboard.",
      content: [
        "asdf jkl; asdf jkl; asdf jkl; asdf jkl;",
        "aaa sss ddd fff jjj kkk lll ;;;",
        "ask dad fall glad half jack lake mall",
        "all fall sad glad lads ask all fall sad",
        "flask salad flask salad flask salad flask",
      ],
    },
    {
      level: 2, title: "Top Row Keys", category: "fundamentals", difficulty: "beginner" as const,
      estimatedMinutes: 20, description: "Extend your reach to the Q W E R T Y U I O P keys.",
      instructions: "Stretch your fingers upward from the home row to reach the top row. Return to home row after each keystroke.",
      content: [
        "qwer tyui op qwer tyui op qwer tyui op",
        "quiet write every route type your unit",
        "power quiet tower queen wrote tower power",
        "your quite tower write every power quiet",
        "report tower unique power write quiet your",
      ],
    },
    {
      level: 3, title: "Bottom Row Keys", category: "fundamentals", difficulty: "beginner" as const,
      estimatedMinutes: 20, description: "Master the Z X C V B N M keys in the bottom row.",
      instructions: "Curl your fingers downward from the home row to reach the bottom row. Keep wrists flat.",
      content: [
        "zxcv bnm zxcv bnm zxcv bnm zxcv bnm",
        "zinc exact copy valve brown name menu",
        "born exam move novel blank xenon maze",
        "common bronze magic cabin zinc exact copy",
        "number brave excel cabin bomb name move",
      ],
    },
    {
      level: 4, title: "Common Words Sprint", category: "speed", difficulty: "intermediate" as const,
      estimatedMinutes: 25, description: "Type the 100 most common English words at increasing speed.",
      instructions: "Focus on accuracy first. Speed will come naturally as patterns become familiar.",
      content: [
        "the and a to of is in that it he was for on are as with his they I at be this from or one had by",
        "not but what all were we when your can said there use an each which she do how their if will up other",
        "about out many then them these so some her would make like him into time has look two more write",
        "go see number no way could people my than first water been call who oil its now find long down day",
        "did get come made may part over new sound take only little work know place year live me back give",
      ],
    },
    {
      level: 5, title: "Punctuation & Symbols", category: "punctuation", difficulty: "intermediate" as const,
      estimatedMinutes: 30, description: "Master periods, commas, apostrophes, and other common punctuation.",
      instructions: "Punctuation is critical for real-world typing. Practice reaching for each symbol without looking.",
      content: [
        "Hello, world. How are you? I'm fine, thanks.",
        "We can't stop here; this is bat country.",
        "Don't worry about it. It's just practice.",
        "He said, \"I'll be there at 3:00 PM.\"",
        "Items: apples, bananas, oranges, and grapes.",
      ],
    },
    {
      level: 6, title: "Numbers Row Mastery", category: "numbers", difficulty: "intermediate" as const,
      estimatedMinutes: 25, description: "Build speed and accuracy typing numbers and mixed content.",
      instructions: "Reach up from the top row to type numbers. Use the correct finger for each number key.",
      content: [
        "1234 5678 90 1234 5678 90 1234 5678 90",
        "Call 555-1234 or email us before 5:00 PM.",
        "The package weighs 3.7 kg and costs $12.50.",
        "Order #48291 shipped on 2024-03-15 at 09:47.",
        "Mix: 42 items, $3.99 each = $167.58 total.",
      ],
    },
    {
      level: 7, title: "Code Typing Fundamentals", category: "code", difficulty: "advanced" as const,
      estimatedMinutes: 35, description: "Build speed with common programming patterns and syntax.",
      instructions: "Programming uses many special characters. Practice each bracket, brace, and operator.",
      content: [
        "const x = 42; let y = 'hello'; var z = true;",
        "function greet(name) { return `Hello, ${name}!`; }",
        "if (x > 0 && y !== null) { console.log(x + y); }",
        "const arr = [1, 2, 3]; arr.map((n) => n * 2);",
        "import { useState, useEffect } from 'react';",
      ],
    },
    {
      level: 8, title: "Speed Burst Training", category: "speed", difficulty: "expert" as const,
      estimatedMinutes: 40, description: "Push your WPM ceiling with burst-mode typing challenges.",
      instructions: "Type as fast as you can while maintaining at least 95% accuracy. Aim for short high-intensity bursts.",
      content: [
        "quick brown fox jumps over the lazy dog sphinx of black quartz judge my vow",
        "pack my box with five dozen liquor jugs how vexingly quick daft zebras jump",
        "the five boxing wizards jump quickly amazingly few discotheques provide jukeboxes",
        "jackdaws love my big sphinx of quartz five or six big jet planes zoomed quickly",
        "crazy Frederick purchased many very exquisite opal jewels blowzy night frumps vex",
      ],
    },
  ];

  for (const lesson of lessonDefs) {
    const { content, ...meta } = lesson;
    const [inserted] = await db.insert(lessonsTable).values(meta).returning();
    for (let i = 0; i < content.length; i++) {
      await db.insert(lessonContentTable).values({
        lessonId: inserted.id, content: content[i], position: i,
      });
    }
    console.log(`  ✓ Lesson ${inserted.level}: ${inserted.title}`);
  }

  // ─── Shortcuts ───────────────────────────────────────────────────────────────
  const shortcutDefs = [
    { keys: ["Ctrl", "C"], name: "Copy", purpose: "Copy selected text", explanation: "Places the selected content onto the clipboard without removing it from its original location.", category: "editing" },
    { keys: ["Ctrl", "X"], name: "Cut", purpose: "Cut selected text", explanation: "Removes the selected content and places it on the clipboard.", category: "editing" },
    { keys: ["Ctrl", "V"], name: "Paste", purpose: "Paste from clipboard", explanation: "Inserts the clipboard content at the cursor position.", category: "editing" },
    { keys: ["Ctrl", "Z"], name: "Undo", purpose: "Undo last action", explanation: "Reverses the most recent action. Press multiple times to undo more.", category: "editing" },
    { keys: ["Ctrl", "Y"], name: "Redo", purpose: "Redo last undone action", explanation: "Re-applies the most recently undone action.", category: "editing" },
    { keys: ["Ctrl", "A"], name: "Select All", purpose: "Select all content", explanation: "Selects all text or items in the current document or field.", category: "editing" },
    { keys: ["Ctrl", "S"], name: "Save", purpose: "Save the current file", explanation: "Writes the current document state to disk.", category: "file" },
    { keys: ["Ctrl", "N"], name: "New", purpose: "Open a new document", explanation: "Creates a fresh document or window in the current application.", category: "file" },
    { keys: ["Ctrl", "O"], name: "Open", purpose: "Open a file", explanation: "Shows a file picker dialog to open an existing document.", category: "file" },
    { keys: ["Ctrl", "W"], name: "Close Tab", purpose: "Close the current tab", explanation: "Closes the current tab or window in most applications.", category: "navigation" },
    { keys: ["Ctrl", "T"], name: "New Tab", purpose: "Open a new browser tab", explanation: "Opens a blank new tab in your browser.", category: "navigation" },
    { keys: ["Ctrl", "F"], name: "Find", purpose: "Find text on the page", explanation: "Opens the find bar to search for text within the current document.", category: "navigation" },
    { keys: ["Alt", "Tab"], name: "Switch Windows", purpose: "Switch between open windows", explanation: "Cycles through open applications. Hold Alt and tap Tab to select.", category: "system" },
    { keys: ["Ctrl", "Alt", "Del"], name: "Task Manager", purpose: "Open task manager", explanation: "Opens system options including Task Manager for force-quitting apps.", category: "system" },
    { keys: ["Win", "D"], name: "Show Desktop", purpose: "Minimize all windows", explanation: "Minimizes all open windows to show the desktop. Press again to restore.", category: "system" },
  ];

  for (const shortcut of shortcutDefs) {
    await db.insert(shortcutsTable).values(shortcut);
  }
  console.log(`  ✓ ${shortcutDefs.length} shortcuts seeded`);

  // ─── Practice Texts ──────────────────────────────────────────────────────────
  const practiceTexts = [
    { mode: "words", text: "the and a to of is in that it he was for on are as with his they I at be this from or one had by not but what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write" },
    { mode: "words", text: "go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after things our just name good sentence man think say great where help through much before line right too means old any same tell boy follow came want show also around form three small set put end does another well large need large often hand high place hold" },
    { mode: "paragraphs", text: "Touch typing is the practice of typing without looking at the keyboard. It relies on muscle memory to locate keys, allowing typists to focus entirely on the content they are creating rather than the mechanical act of finding letters." },
    { mode: "paragraphs", text: "The keyboard layout most people use today, QWERTY, was designed in the 1870s for mechanical typewriters. The layout was arranged to prevent jamming of the typebars by separating commonly used letter pairs. Despite this historical quirk, QWERTY remains the dominant layout worldwide." },
    { mode: "paragraphs", text: "Building typing speed is a gradual process. Beginners should focus on accuracy rather than speed. As muscle memory develops and correct habits form, speed naturally increases. Most experts recommend practicing for at least 15 to 20 minutes daily for consistent improvement." },
    { mode: "quotes", text: "The secret of getting ahead is getting started. Mark Twain" },
    { mode: "quotes", text: "It always seems impossible until it's done. Nelson Mandela" },
    { mode: "quotes", text: "Do what you can, with what you have, where you are. Theodore Roosevelt" },
    { mode: "quotes", text: "Success is the sum of small efforts repeated day in and day out. Robert Collier" },
    { mode: "quotes", text: "Whether you think you can or you think you can't, you're right. Henry Ford" },
    { mode: "code", text: "const greet = (name) => { return `Hello, ${name}! Welcome to TypeFlow.`; };" },
    { mode: "code", text: "function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }" },
    { mode: "code", text: "const users = data.filter(u => u.active).map(u => ({ id: u.id, name: u.name }));" },
    { mode: "code", text: "import { useState, useEffect } from 'react'; const [count, setCount] = useState(0);" },
    { mode: "code", text: "SELECT id, username, email FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10;" },
    { mode: "code", text: "async function fetchData(url) { const res = await fetch(url); return res.json(); }" },
    { mode: "code", text: "class Rectangle { constructor(w, h) { this.width = w; this.height = h; } area() { return this.width * this.height; } }" },
    { mode: "code", text: "const sorted = arr.sort((a, b) => a.score - b.score).slice(0, 10);" },
    { mode: "code", text: "try { const data = JSON.parse(input); } catch (err) { console.error('Parse failed:', err.message); }" },
    { mode: "code", text: "export default function Component({ title, children }) { return <div className='container'><h1>{title}</h1>{children}</div>; }" },
  ];

  for (const pt of practiceTexts) {
    await db.insert(practiceTextsTable).values(pt);
  }
  console.log(`  ✓ ${practiceTexts.length} practice texts seeded`);

  // ─── Achievements ─────────────────────────────────────────────────────────────
  const achievementDefs = [
    { title: "First Keystroke", description: "Complete your very first lesson", xpValue: 10, requirement: "lessons_completed", requirementValue: 1, icon: "star" },
    { title: "On a Roll", description: "Complete 5 lessons", xpValue: 50, requirement: "lessons_completed", requirementValue: 5, icon: "flame" },
    { title: "Committed", description: "Complete 10 lessons", xpValue: 100, requirement: "lessons_completed", requirementValue: 10, icon: "zap" },
    { title: "Halfway Hero", description: "Finish half the lesson catalog", xpValue: 200, requirement: "lessons_completed", requirementValue: 25, icon: "award" },
    { title: "Completion", description: "Complete the full lesson catalog", xpValue: 500, requirement: "lessons_completed", requirementValue: 50, icon: "trophy" },
    { title: "Apprentice Typist", description: "Reach 30 WPM in a practice session", xpValue: 25, requirement: "wpm_reached", requirementValue: 30, icon: "keyboard" },
    { title: "Amateur Typist", description: "Reach 50 WPM in a practice session", xpValue: 75, requirement: "wpm_reached", requirementValue: 50, icon: "zap" },
    { title: "Proficient Typist", description: "Reach 70 WPM in a practice session", xpValue: 150, requirement: "wpm_reached", requirementValue: 70, icon: "bolt" },
    { title: "Expert Typist", description: "Reach 90 WPM in a practice session", xpValue: 300, requirement: "wpm_reached", requirementValue: 90, icon: "crown" },
    { title: "Speed Demon", description: "Reach 120 WPM in a practice session", xpValue: 1000, requirement: "wpm_reached", requirementValue: 120, icon: "rocket" },
    { title: "Accuracy Novice", description: "Achieve 90% accuracy in a session", xpValue: 20, requirement: "accuracy_reached", requirementValue: 90, icon: "target" },
    { title: "Sharpshooter", description: "Achieve 95% accuracy in a session", xpValue: 75, requirement: "accuracy_reached", requirementValue: 95, icon: "bullseye" },
    { title: "Perfectionist", description: "Achieve 99% accuracy in a session", xpValue: 250, requirement: "accuracy_reached", requirementValue: 99, icon: "gem" },
    { title: "Daily Habit", description: "Complete a practice session for 7 days straight", xpValue: 100, requirement: "streak_days", requirementValue: 7, icon: "calendar" },
    { title: "Two Weeks Strong", description: "Maintain a 14-day practice streak", xpValue: 300, requirement: "streak_days", requirementValue: 14, icon: "fire" },
    { title: "Shortcut Curious", description: "Browse the shortcuts reference page", xpValue: 5, requirement: "shortcuts_viewed", requirementValue: 1, icon: "command" },
    { title: "Shortcut Learner", description: "Study 10 keyboard shortcuts", xpValue: 30, requirement: "shortcuts_viewed", requirementValue: 10, icon: "keyboard" },
    { title: "Shortcut Master", description: "Study all keyboard shortcuts", xpValue: 150, requirement: "shortcuts_viewed", requirementValue: 15, icon: "medal" },
    { title: "Session Starter", description: "Complete 10 total practice sessions", xpValue: 20, requirement: "sessions_completed", requirementValue: 10, icon: "play" },
    { title: "Dedicated Practitioner", description: "Complete 50 total practice sessions", xpValue: 200, requirement: "sessions_completed", requirementValue: 50, icon: "heart" },
  ];

  for (const ach of achievementDefs) {
    await db.insert(achievementsTable).values(ach);
  }
  console.log(`  ✓ ${achievementDefs.length} achievements seeded`);

  // ─── Homepage Content ─────────────────────────────────────────────────────────
  const homepageDefs = [
    { key: "hero_title", value: "Learn. Practice.\nMaster Typing." },
    { key: "hero_subtitle", value: "Master typing and keyboard productivity skills through structured learning. Track your progress, analyze your weak spots, and reach typing mastery." },
    { key: "features_title", value: "Everything you need to reach typing mastery" },
    { key: "features_subtitle", value: "A complete toolkit for serious typists. No bloat, no distractions." },
    { key: "faq_title", value: "Frequently Asked Questions" },
    { key: "footer_text", value: "All progress stored locally in your browser." },
    { key: "cta_title", value: "Ready to become a faster typist?" },
    { key: "cta_subtitle", value: "Start with the home row. Everything else follows." },
  ];

  for (const hp of homepageDefs) {
    await db.insert(homepageContentTable).values(hp);
  }
  console.log(`  ✓ ${homepageDefs.length} homepage content items seeded`);

  await pool.end();
  console.log("\n✅ Seed complete!");
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
