# Aarambh Pre-Primary School

![Aarambh School Logo](public/img/schoollogo_transparent.png)

A modern, fully responsive, full-stack application for a pre-primary school. Built with a focus on clean aesthetics, joyful micro-interactions, and a powerful custom admin dashboard for content management.

## 🌟 Live Website
**Public Site:** [https://arambh-bpuc.onrender.com/](https://arambh-bpuc.onrender.com/)  
**Admin Panel:** [https://arambh-bpuc.onrender.com/admin.html](https://arambh-bpuc.onrender.com/admin.html)

## 🛠️ Technology Stack

### Frontend (Public Site & Admin Panel)
- **HTML5 & CSS3:** Custom-designed UI with glassmorphism and vibrant, child-friendly color palettes (No external CSS frameworks used).
- **Vanilla JavaScript (ES6):** Powers all interactive animations, mobile navigation, and dynamic gallery filtering via Fetch API.
- **Fonts & Icons:** FontAwesome (Icons), Google Fonts (Nunito, Outfit).

### Backend (API Server)
- **Node.js & Express.js:** Handles routing, API endpoints, and serves the static frontend.
- **JWT & Bcryptjs:** Enterprise-grade security for the Admin Panel authentication.
- **Multer:** Middleware for processing multipart/form-data (image uploads).

### Database & Storage
- **Supabase (PostgreSQL):** Cloud database storing gallery metadata, announcements, and admin credentials.
- **Cloudinary:** Cloud media server for fast, optimized image hosting.

### Hosting & Deployment
- **Render.com:** Hosts the Node.js server and handles automatic deployments.
- **GitHub:** Version control and CI/CD source.

## 🚀 Features
- **Dynamic Image Gallery:** Upload, delete, and categorize images via the Admin Panel. Images are stored in Cloudinary and instantly reflect on the public site.
- **Real-time Announcements:** Pin important announcements to the top of the homepage using the Admin dashboard.
- **Secure Admin Dashboard:** Protected by JWT authentication and password encryption.
- **Fully Responsive:** Adapts flawlessly to mobile phones, tablets, and desktop displays using modern CSS Flexbox and Grid.

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/irfanpc/arambh.git
   cd arambh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   PORT=5000
   DATABASE_URL=your_supabase_postgresql_url
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5000`

---
&copy; 2026 Aarambh Pre-Primary School. All Rights Reserved.
