# BulkMail

BulkMail is a React frontend and Express/MongoDB backend.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to the connection string from MongoDB Atlas.
2. Run `npm install` in `frontend` and `backend`.
3. Start the backend with `node backend/index.js`.
4. Start the frontend with `npm start` from `frontend`.

The frontend uses `http://localhost:5000` by default. Set `REACT_APP_API_URL` to override it.

## Deploying on Vercel

Create two Vercel projects from this repository:

- **Frontend:** set Root Directory to `frontend`. Set `REACT_APP_API_URL` to the deployed backend URL (without a trailing slash).
- **Backend:** set Root Directory to `backend`. Set `MONGODB_URI` to the MongoDB Atlas connection string and allow the deployment to access the cluster in Atlas Network Access.

Do not commit `.env` files. Configure production secrets in Vercel's project environment variables.
