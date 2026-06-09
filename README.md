# StudyMart 📚

Bangladesh's student marketplace for buying and selling books, notes, calculators, and study materials.

---

## Tech Stack

| Layer      | Tech                                |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (jsonwebtoken + bcryptjs)       |
| Realtime   | Socket.io                           |
| Storage    | Local uploads (Cloudinary-ready)    |

---

## Project Structure

```
studymart/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route handlers
│   ├── middleware/     # Auth, error, upload middleware
│   ├── utils/          # JWT helper, socket init, seed script
│   ├── uploads/        # Local file storage
│   ├── server.js       # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ # Navbar, ListingCard
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # All page components
│   │   └── utils/      # API client, helpers
│   └── vite.config.js
└── README.md
```

---

## Quick Start

### 1. Clone & install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running locally on port 27017, or set `MONGO_URI` in `.env` to your Atlas connection string.

### 3. Seed sample data (optional)

```bash
cd backend
npm run seed
```

This creates 3 test users and 6 sample listings.

**Test credentials:**
- `rafi@test.com` / `password123`
- `nadia@test.com` / `password123`
- `tanvir@test.com` / `password123`

### 4. Run development servers

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## API Endpoints

### Auth
| Method | Route               | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Create account     |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/me        | Get current user   |

### Listings
| Method | Route                    | Description            |
|--------|--------------------------|------------------------|
| GET    | /api/listings            | Browse with filters    |
| GET    | /api/listings/:id        | Get listing detail     |
| POST   | /api/listings            | Create listing (auth)  |
| PUT    | /api/listings/:id        | Update listing (auth)  |
| DELETE | /api/listings/:id        | Delete listing (auth)  |
| PATCH  | /api/listings/:id/sold   | Mark as sold (auth)    |

### Notes
| Method | Route                    | Description            |
|--------|--------------------------|------------------------|
| GET    | /api/notes               | Browse notes           |
| GET    | /api/notes/:id           | Get note detail        |
| POST   | /api/notes               | Upload note (auth)     |
| PATCH  | /api/notes/:id/download  | Increment download     |
| DELETE | /api/notes/:id           | Delete note (auth)     |

### Chat
| Method | Route                                  | Description              |
|--------|----------------------------------------|--------------------------|
| GET    | /api/chat/conversations                | Get user conversations   |
| POST   | /api/chat/conversations                | Start conversation       |
| GET    | /api/chat/conversations/:id/messages   | Get messages             |
| POST   | /api/chat/conversations/:id/messages   | Send message (REST)      |

### Users
| Method | Route             | Description          |
|--------|-------------------|----------------------|
| GET    | /api/users/:id    | Public profile       |
| PUT    | /api/users/profile| Update own profile   |

---

## Socket.io Events

| Event            | Direction      | Payload                              |
|------------------|----------------|--------------------------------------|
| joinConversation | client → server| conversationId                       |
| sendMessage      | client → server| { conversationId, senderId, text }   |
| newMessage       | server → client| Message object                       |
| typing           | client → server| { conversationId, userId }           |
| stopTyping       | client → server| { conversationId }                   |
| userTyping       | server → client| { userId }                           |
| userStoppedTyping| server → client| —                                    |
| onlineUsers      | server → client| [userId, ...]                        |

---

## Database Models

- **User** — profile, auth, subscription (future)
- **Listing** — item details, images, seller ref, featured boost (future)
- **Note** — PDF file, subject, class, downloads
- **Conversation** — participants, linked listing, last message
- **Message** — text, sender, read status
- **Transaction** — buyer/seller/amount, payment method (future)
- **Subscription** — plan, dates, features (future)

---

## Monetization Structure (Future-Ready)

Database schemas are already designed for:
- **Premium subscriptions** — monthly/yearly plans
- **Featured listing boost** — paid visibility
- **Verified seller badge** — trust signal
- **Transaction fee tracking** — platform revenue
- **Payment methods** — bKash, Nagad, Rocket, cash

---

## Deployment

### Backend (Railway / Render)
1. Set environment variables from `.env.example`
2. Use MongoDB Atlas for the database
3. Run `npm start`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` if not using proxy
2. Run `npm run build`
3. Deploy `dist/` folder

---

## Pages

| Route           | Page              |
|-----------------|-------------------|
| `/`             | Home (marketplace feed) |
| `/listings`     | Browse all listings |
| `/listings/:id` | Item detail page |
| `/sell`         | Create listing |
| `/notes`        | Browse notes |
| `/notes/upload` | Upload PDF notes |
| `/login`        | Login |
| `/register`     | Register |
| `/profile`      | Dashboard & my listings |
| `/chat`         | Messaging inbox |
| `/chat/:id`     | Specific conversation |
