# BulkMail

BulkMail is a React frontend and Express/MongoDB backend.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to the connection string from MongoDB Atlas.
2. Run `npm install` in `frontend` and `backend`.
3. Start the backend with `node backend/index.js`.
4. Start the frontend with `npm start` from `frontend`.

The frontend calls `/api/sendemail`; Create React App proxies that path to the local backend during development.

## Deploying on Vercel

Deploy this repository as one Vercel project from the repository root. The root `vercel.json` builds the frontend and backend as separate services, routes `/api/*` to the backend, and sends other paths to the frontend.

Set `MONGODB_URI` in the Vercel project environment variables to the MongoDB Atlas connection string. Allow the deployment to access the cluster in Atlas Network Access.

Do not commit `.env` files. Configure production secrets in Vercel's project environment variables.
