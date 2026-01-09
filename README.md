# Compilex 🚀

**Compilex** is a modern, high-performance coding platform designed to provide a seamless competitive programming and problem-solving experience. Developed with the latest web technologies, it offers a robust environment for developers to hone their skills.

> [!IMPORTANT]
> **Work in Progress:** This project is currently under active development. Many features are being implemented and refined. Stay tuned for frequent updates! 🏗️

---

## ✨ Features

- **🔐 Secure Authentication:** Integrated with Clerk for seamless and secure user management.
- **🚀 Onboarding Flow:** Automated user onboarding and database synchronization.
- **🎨 Modern UI/UX:** Built with Tailwind CSS 4 and Shadcn/UI for a beautiful, responsive, and accessible interface.
- **🌓 Dark Mode:** Built-in theme switching support.
- **📱 Responsive Navbar:** Sleek, glassmorphism-inspired navigation.
- **🛠️ Role-Based Access:** ADMIN and USER roles for specialized access (Admin dashboard under construction).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Language:** JavaScript / React

---

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- PostgreSQL database, Prisma ORM
- Clerk Account (for Auth keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd compilex
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the necessary keys (Database URL, Clerk keys, etc.).

4. **Run Database Migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛤️ Roadmap

- [x] Base Project Setup & Auth
- [x] User Onboarding
- [x] Responsive Navbar & Theme Toggle
- [x] Role Based Authentication
- [x] Local Deploy the Judge0 API for Code Execution
- [x] Handled the create Problem API and Problem Schema
- [ ] Problem List Page
- [ ] Individual Problem Solving Dashboard
- [ ] Code Execution Engine
- [ ] Admin Dashboard for Problem Creation
- [ ] User Profiles & Statistics

---


*Made with ❤️ by Alpit Kumar*
