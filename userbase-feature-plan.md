New Feature: User Login

I want to add a user login feature to the project that includes a favorites function. 

I want to set up a Supabase-powered auth setup that allows users to log in via a standard social login or by making an account with an email and password. 

I'll need you to set up the SQL statements for creating the database tables we need for this feature. I'll also need your help with adding the required pages, components, and functions to our project to support this new user login feature. When building the new components and pages, make sure to split things up into smaller reusable components, following DRY development principles. And when building the business logic for the login/logout, favorites, and other functions, make sure you use an 'orchestrator' style of software architecture, also keeping things efficient and DRY in this part of the code as well.

I'm planning on using Supabase's Node.js integration, so according to the documentation, we'll need to run `pnpm install postgres` and add a file named `db.js` with the following code:

```js
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql
```

Do some research and check if this is the correct or best way to integrate Supabase with an Astro project. Please also keep in mind that I will be using the free tier of Supabase, and we should expect other users who download this template to use the free tier as well.

We'll add our required API keys and secrets to our `.env` file. Make sure our project is configured to properly use these api keys and secrets without exposing them to the frontend where they can be stolen. Review our project's configuration around using API keys correctly, and do some research on using Astro and Netlify and keeping API keys used via ENV variables secure to make sure we're following best practices.

Since this project is intended to be a template for others to download and use, I want to make the user login feature optional and able to be turned on/off via a boolean variable in the `.env` file, next to the Supabase variables. Turning this setting off should cleanly disable and bypass any login-related features in the project.

Additionally, since this is a template project for others to easily re-use - I want you to keep the files we build to set up our Supabase tables and configs, update our CLAUDE.md file with instructions for setting them up via Claude Code, and add instructions to the README file telling the user how to get started with setting up a free Supabase account.

Supabase data:
- DATABASE_URL=postgresql://postgres.cblnaybfbeonjwkblbgv:AB8WmwgrwbQSYhuc@aws-0-us-east-2.pooler.supabase.com:6543/postgres
- DATABASE_PASSWORD=AB8WmwgrwbQSYhuc