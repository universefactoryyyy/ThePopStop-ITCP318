# The Pop Stop (MERN) - Setup Guide

Folder layout:

```
ThePopStop-ITCP318/
  backend/    Express + Mongoose API (port 4001)
  frontend/   React + Vite app (port 5173)
  SETUP.md
```

Everything below uses **placeholders**. Replace each one with your own value. Never commit `.env` files or the Firebase service-account JSON (both are already in `.gitignore`).

Prerequisites: Node.js 20 or newer, npm, and free accounts on MongoDB Atlas, Cloudinary, Mailtrap and Firebase.

---

## 1. MongoDB Atlas

1. Sign in at https://cloud.mongodb.com and create a project, then **Create a cluster** (the free M0 tier is fine).
2. **Security > Database Access > Add New Database User**. Choose "Password", set a username and password, and give it the "Read and write to any database" role. If the password has special characters (`@ : / ?`), URL-encode them.
3. **Security > Network Access > Add IP Address**. Use "Add current IP address". For quick testing you can use `0.0.0.0/0`, but do not leave that on in production.
4. **Database > Connect > Drivers**. Copy the connection string and use it as `DB_URI`. Put the database name `popstop` before the `?`:

   ```
   DB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-host>.mongodb.net/popstop?retryWrites=true&w=majority
   ```

## 2. Cloudinary

1. Sign in at https://cloudinary.com/console.
2. On the dashboard (**Programs and Keys / API Keys**), copy the **Cloud name**, **API Key** and **API Secret**.
3. Put them into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.

Product photos go into the `popstop/products` folder and profile photos into `popstop/avatars`. The seed script uploads the 66 local images in `backend/scripts/images/` to the same account.

## 3. Mailtrap (order emails)

1. Sign in at https://mailtrap.io and open **Email Testing > Inboxes** (use "My Inbox" or create one).
2. Open the inbox, go to **SMTP Settings**, and choose the "Nodemailer" integration (or just copy the credentials).
3. Copy the host, port, username and password into the `SMTP_*` variables below. The sandbox host is normally `sandbox.smtp.mailtrap.io` and the port `2525`.
4. `SMTP_FROM_EMAIL` can be any address, for example `noreply@popstop.com`.

Each time an admin changes an order's status, the customer gets an email (items, subtotals, discount and grand total) with a PDF receipt attached. You will see them in the Mailtrap inbox.

## 4. Firebase (Authentication)

1. Go to https://console.firebase.google.com and click **Add project** (Analytics is optional).
2. **Build > Authentication > Get started > Sign-in method**:
   - Enable **Email/Password**.
   - Enable **Google**. Choose a project support email and save.
   - Enable **Facebook** (optional but shown on the login/register pages). Create an app at https://developers.facebook.com, copy the App ID and App Secret into Firebase, and add `https://<your-project-id>.firebaseapp.com/__/auth/handler` as a Valid OAuth Redirect URI in the Facebook app. The backend endpoint `/api/v1/login/social` accepts any Firebase provider.
3. **Authentication > Settings > Authorized domains**. `localhost` is there by default. Add your deployed domain later when you publish.
4. **Project settings (gear icon) > General > Your apps > Web (`</>`)**. Register an app (any nickname). Copy the config values into the frontend `.env` (`VITE_FIREBASE_*`, see section 6).
5. **Project settings > Service accounts > Generate new private key**. A JSON file downloads.
   - Save it as `backend/config/firebase-service-account.json` (this path is already ignored by git), **or**
   - Skip the file and copy `project_id`, `client_email` and `private_key` from the JSON into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (keep the `\n` escapes inside the quotes) and comment out `FIREBASE_SERVICE_ACCOUNT_PATH`.

How login works: the browser signs in with Firebase, sends the ID token to the backend, the backend verifies it with firebase-admin and issues its own JWT cookie. User roles (`admin` / `user`) live in MongoDB, not in Firebase.

## 5. Backend `.env`

Create `backend/.env` (copy from `backend/.env.example`):

```env
# ----- Server -----
PORT=4001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TIMEZONE=Asia/Manila

# ----- MongoDB Atlas -----
DB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-host>.mongodb.net/popstop?retryWrites=true&w=majority

# ----- Session (JWT cookie) -----
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7
COOKIE_SAMESITE=lax

# ----- Cloudinary -----
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ----- Mailtrap (SMTP) -----
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
SMTP_FROM_NAME=The Pop Stop
SMTP_FROM_EMAIL=noreply@popstop.com

# ----- Firebase Admin -----
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
# or, instead of the path above:
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Generate a JWT secret:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Notes:
- `FRONTEND_URL` is the CORS origin. Use a comma-separated list for several origins.
- `COOKIE_SAMESITE=lax` is right for localhost. If the frontend and API are on different domains over https, use `none`.

## 6. Frontend `.env`

Create `frontend/.env` (copy from `frontend/.env.example`):

```env
VITE_API=http://localhost:4001/api/v1

VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Restart `npm run dev` after editing it, since Vite reads `.env` only at startup.

## 7. Install, seed and run

Open two terminals.

Terminal 1 - backend:

```
cd backend
npm install
npm run seed
npm run dev
```

Terminal 2 - frontend:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

What `npm run seed` does:
- uploads the local product images to Cloudinary,
- inserts the 24 products with all their photos, the discounts `POPSTOP10`, `SAVE100`, `WELCOME50` and the admin user into MongoDB,
- creates the admin in Firebase Authentication if Firebase Admin is configured.

Seed commands:
- `npm run seed` adds data that does not exist yet and is safe to run again.
- `npm run seed:reset` clears the seeded collections first, then seeds.
- `npm run seed:dry` parses the data and checks the images without touching Cloudinary or MongoDB.

Default admin account: `admin@popstop.com` / `password`. Change the password after the first login.

Backend commands: `npm start` (production), `npm run dev` (nodemon), `npm test` (28 smoke checks using an in-memory MongoDB, no credentials needed).
Frontend commands: `npm run build`, `npm run preview`.

## 8. Try it without any credentials (optional demo)

`backend/tests/ui-harness.js` starts an in-memory MongoDB, seeds it with stubbed Cloudinary, Firebase and SMTP, and exposes a `/dev-login` shortcut. It is a development tool only.

```
cd backend
node tests/ui-harness.js
```

In another terminal run the frontend (`npm run dev`), then visit `http://localhost:4001/dev-login?role=admin` (or `role=customer`) and open http://localhost:5173. Email sends are printed to the harness console. The Firebase forms will show "Firebase is not configured", which is expected.

## 9. Where each requirement lives

| Area | Main files |
| --- | --- |
| Products CRUD, multi-photo upload | `backend/controllers/product.js`, `frontend/src/Components/Admin/{ProductsList,ProductForm}.jsx` |
| Admin DataGrid (search, sort, pagination, bulk delete) | `frontend/src/Components/Admin/ProductsList.jsx` |
| Auth (Firebase, Google + Facebook, profile photo) | `backend/controllers/auth.js`, `frontend/src/Components/User/*`, `frontend/src/firebase.js` |
| Form validation | Formik + Yup on product CRUD and login; React Hook Form + Yup on update profile (`frontend/src/Utils/validation.js`) |
| Reviews, bad-word masking | `backend/controllers/review.js` + `backend/utils/filterProfanity.js`, `frontend/src/Components/Review/*` |
| Orders, status emails, PDF receipt | `backend/controllers/order.js`, `backend/utils/{sendEmail,emailTemplates,generatePDF}.js` |
| Filters (price, category, ratings, reviews) and infinite scroll | `frontend/src/Components/Product/{ProductCatalog,ProductFilters}.jsx` |
| Charts (monthly + date range) | `frontend/src/Components/Admin/{Dashboard,Reports}.jsx` |
| Theme (pastel green and beige, MUI + Bootstrap) | `frontend/src/theme.js`, `frontend/src/index.css` |

## 10. Troubleshooting

- **`querySrv ECONNREFUSED`**: Node's DNS resolver is using `127.0.0.1` and nothing is listening there. `backend/config/env.js` switches that lookup to public DNS before connecting. The Atlas username, password, and cluster host can still be correct.
- **`MongooseServerSelectionError`**: your IP is not allowed in Atlas Network Access, or the username/password in `DB_URI` is wrong or not URL-encoded.
- **Login says "Firebase is not configured"**: the `VITE_FIREBASE_*` values are missing, or you did not restart Vite.
- **Login returns 401 or "invalid token"**: the service account belongs to a different Firebase project than the web config.
- **Google popup blocked or "unauthorized domain"**: add the domain under Firebase > Authentication > Settings > Authorized domains.
- **Images fail to upload**: check the three Cloudinary values and that the file is JPG, PNG or WebP up to 5 MB (max 10 files per upload).
- **No emails**: check the Mailtrap credentials. The sandbox only shows messages in the Mailtrap inbox, not in a real mailbox.
- **CORS or cookie errors**: `FRONTEND_URL` must exactly match the browser origin (scheme, host and port).
