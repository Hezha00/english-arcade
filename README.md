# English Arcade

**English Arcade** is a modern, full-featured educational platform for English language learning, designed for teachers, students, and independent self-learners. It features interactive games, classroom management, analytics, and a flexible licensing/subscription system. Built with React, Vite, Supabase, and Material UI.

---

## 🚀 Features

### For Students
- **Login with username/password** (provided by teacher or self-signup for self-learners)
- **Dashboard**: Track progress, access assignments, and view results
- **Interactive Games**:
  - **Word Matching**: Match English words to their Persian meanings
  - **Memory Puzzle**: Flip cards to find matching pairs
  - **Sentence Structure**: Arrange words to form correct sentences
  - **Quiz/Test**: Answer questions based on vocabulary and grammar
  - **Flashcards**: Learn and review vocabulary with TTS (Text-to-Speech)
- **Independent Learning**: Self-learners can subscribe and access all content without a teacher

### For Teachers
- **Teacher Dashboard**: Manage classrooms, students, and assignments
- **Add Students**: Create student accounts and assign to classes
- **Create & Assign Games**: Build custom games or use templates, assign to classes
- **Game Repository & Store**: Download, customize, and share educational games
- **Analytics**: View student performance, export results to Excel
- **License Management**: Administer licenses for teachers and students

### For Admins
- **Admin Dashboard**: Manage all licenses, plans, and users
- **Create & View Licenses**: Generate and track license usage for both teachers and self-learners

### Security & Anti-Bot
- **Time-based anti-bot protection**: Forms require a minimum time to submit, blocking instant (bot) submissions

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, Material UI, AOS (animations)
- **Backend/DB**: Supabase (Postgres, Auth, Storage)
- **State Management**: React hooks, localStorage
- **Other**: XLSX (Excel export), file-saver, dayjs/moment (dates), recharts (charts)

---

## 📝 Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/hezha00/english-arcade.git
cd english-arcade
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure Supabase**
- Create a `.env` file in the root:
  ```
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```
- Set up your Supabase project with the required tables and RLS policies (see `supabase_fixes.sql`).

### 4. **Run the App Locally**
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 5. **Build for Production**
```bash
npm run build
```

### 6. **Deploy**
- Static hosting (e.g., Vercel, Netlify, GitHub Pages) is supported.
- Make sure the `public/games/` directory is served at `/games/` for static game files.

---

## 👤 User Roles & Flows

### Students
- **Login**: `/student-login`
- **Dashboard**: `/student-dashboard`
- **Games**: `/student-games`, `/student-quiz/:gameId`, `/memory-puzzle/:gameId`, `/sentence-structure/:gameId`
- **Results**: `/student-results`, `/student-results-history`

### Teachers
- **Login**: `/teacher-login`
- **Dashboard**: `/dashboard`
- **Add Students**: `/teacher-add-student`
- **Create Games**: `/create-game`, `/create-word-matching`, `/create-memory-puzzle`, `/create-sentence-structure`
- **Game Store**: `/game-store`, `/game-repository`
- **Analytics**: `/teacher-analytics`, `/results-dashboard`, `/export-results`

### Self-Learners
- **Auth Choice**: `/self-learner-auth`
- **Signup**: `/self-learner-signup`
- **Login**: `/self-learner-login`
- **Subscription**: `/self-learner-subscription`
- **Dashboard**: `/student-dashboard` (with independent features)

### Admins
- **Dashboard**: `/admin-dashboard`
- **Create License**: `/admin-create-license`
- **License List**: `/admin-license-list`

---

## 🎮 Game Types

- **Word Matching**: Match English words to Persian meanings
- **Memory Puzzle**: Flip and match pairs
- **Sentence Structure**: Arrange words to form correct sentences
- **Quiz/Test**: Multiple choice and fill-in-the-blank
- **Flashcards**: Learn vocabulary with TTS

---

## 🔒 Security

- **Time-based anti-bot**: All login and signup forms require a minimum time before submission to block bots.
- **Supabase RLS**: All sensitive data is protected with Row Level Security.

---

## 📦 Static Game Templates

Game templates are stored in `public/games/` and loaded dynamically. You can add your own JSON templates for new games.

---

## 📊 Analytics & Export

- Teachers can view student results and export them to Excel.
- Admins can view and manage all licenses and subscriptions.

---

## 🛠️ Customization

- **Add new games**: Use the game creation pages or add new templates to `public/games/`.
- **Change branding**: Edit `index.html`, `App.css`, and Material UI theme.
- **Localization**: The app is RTL-friendly and supports Persian out of the box.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com/)
- [Material UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [AOS](https://michalsnik.github.io/aos/)
- [XLSX](https://github.com/SheetJS/sheetjs)

---

**For more details, see the code and comments in each page/component.**
