# Corn Grader Frontend

This project is a Vue 3 application that uploads an image of corn kernels to a
backend service for analysis and grading. The backend should accept `POST`
requests at the root path and return HTML describing the analysis results.

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and adjust `VITE_API_URL` to point at your
   backend server.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Building for Production

Run `npm run build` to create the static files in the `dist` directory. Deploy
the contents of `dist` to any static host. Ensure the `VITE_API_URL` environment
variable is set at build time so the frontend knows where to send uploads.
