# Service Request Form

A professional form application built with Next.js 15 and Zod validation.

## Features

- ✅ Modern, responsive UI with gradient design
- ✅ Form validation using Zod schema
- ✅ Integration with external API endpoint
- ✅ All required fields: name, phone, email, notes, price, service, start_date, end_date
- ✅ Client-side and server-side validation
- ✅ Professional error handling and user feedback

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
API_ENDPOINT_URL="https://your-api-endpoint.com/api/submit"
```

Or if you need to use it on the client side:

```env
NEXT_PUBLIC_API_ENDPOINT_URL="https://your-api-endpoint.com/api/submit"
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the form.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **React Hook Form** - Form state management

## Project Structure

```
├── app/
│   ├── api/
│   │   └── submit/
│   │       └── route.ts      # API route that validates and forwards to external endpoint
│   ├── components/
│   │   └── Form.tsx          # Main form component
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
└── lib/
    └── schema.ts             # Zod validation schema
```

## Form Fields

- **Name** (required) - Full name
- **Phone** (required) - Phone number (min 10 characters)
- **Email** (required) - Valid email address
- **Service** (required) - Service name
- **Price** (required) - Positive number
- **Start Date** (required) - Start date
- **End Date** (required) - Must be after or equal to start date
- **Notes** (optional) - Additional notes

## API Integration

The form validates data on both client and server side, then forwards the validated data to your external endpoint. The endpoint URL is configured via the `API_ENDPOINT_URL` or `NEXT_PUBLIC_API_ENDPOINT_URL` environment variable.

The form data sent to your endpoint will be in the following format:

```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "notes": "string | null",
  "price": number,
  "service": "string",
  "start_date": "string",
  "end_date": "string"
}
```

## Production Deployment

1. Set `API_ENDPOINT_URL` or `NEXT_PUBLIC_API_ENDPOINT_URL` in your environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

