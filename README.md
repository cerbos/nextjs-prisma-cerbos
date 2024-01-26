# nextjs-prisma-cerbos

A demo integrating [Cerbos](https://cerbos.dev) with a [Next.js](https://nextjs.org/) application using [Prisma](https://prisma.io/) as the ORM. Consisting of the following:

- A SQLite database with a seeding script to pre-populate with user and contacts data.
- Authentication via a mock Identity Provider (IdP) (which for demo purposes, is simply a static structure stored in memory [here](./lib/idp.ts)) and Passport.js for session management.
- Protected pages for listing and accessing contacts for the actively authenticated user. Using server-side rendering (via `getServerSideProps`) to retrieve protected resources by generating a query plan from [Cerbos' PlanResources API](https://docs.cerbos.dev/cerbos/latest/api/index.html#resources-query-plan) and using it to retrieve the contacts from the database, using Prisma.
- Various utilities and APIs to demo different approaches that could be used when integrating Cerbos with Next.js.

## Dependencies

- Node.js
- Docker for running the [Cerbos Policy Decision Point (PDP)](https://docs.cerbos.dev/cerbos/latest/installation/container.html)

## Getting Started

1. Start up the Cerbos PDP instance docker container. This will be called by the next.js app to check authorization.

```bash
./cerbos/start.sh
```

2. Install node dependencies

```bash
npm install
```

3. Setup Prisma and seed the database

```
npx prisma migrate dev --name init
# This might fail on SQLite
npx prisma db seed
```

4. Start the development server

```bash
npm run dev
```

5. Load up [the app](http://localhost:3000/)

## Policies

This example has a simple CRUD policy in place for a resource kind of `contact` - like a CRM system would have. The policy file can be found in the `cerbos/policies` folder [here](./cerbos/policies/contact.yaml).

The [policy](./cerbos/policies/contact.yaml) expects one of two roles to be set on the principal - `admin` and `user` and an attribute which defines their department as either `IT`, `Sales` or `Marketing`. A derived role is generated which applies to principals who created the contact in question. The contact resource can have attributes specifying `active` and `marketingOptIn` booleans.

These roles are authorized as follows:

| Action   | Role: Admin | Derived Role: Owner| Role: User (if not Owner)                                                                                                 |
| -------- | ----------- | -------------------| ------------------------------------------------------------------------------------------------------------------------- |
| `read`   | Y           | Y                  | Only if the resource is active AND (the department is `Sales` OR (`Marketing` AND the resource is opted in to marketing)) |
| `create` | Y           | N                  | Only if department is `Sales`                                                                                             |
| `update` | Y           | Y                  | N                                                                                                                         |
| `delete` | Y           | Y                  | N                                                                                                                         |

## Trying it out

When logging in, you can assume any of the following users. These map to users (and contacts) created in the database during the `seed` step.

| ID  | Username | Password     | Role  | Department |
| --- | -------- | ------------ | ----- | ---------- |
| 1   | alice    | supersecret  | Admin | IT         |
| 2   | john     | password1234 | User  | Sales      |
| 3   | sarah    | asdfghjkl    | User  | Sales      |
| 4   | geri     | pwd123       | User  | Marketing  |

After login, you'll be able to retrieve the contacts available to the given user by following the link to `/contacts`, and then zoom in further to the detail view at `/contacts/[id]`.

Try logging in with different users, and notice which contacts are available to each. Try accessing a URL for an ID not listed in the list view, and notice how Cerbos prevents the user from accessing the data!

## Deploying to Vercel

First things first, you'll need to [create an account](https://vercel.com/docs/concepts/get-started#sign-up) on Vercel (if you haven't already) and [connect your project to a git provider](https://vercel.com/docs/concepts/get-started#connect-to-a-git-provider).

Once you've done that, we can make a couple of small adaptions to our code and use some handy tooling to enable us to host our streamlined demo on Vercel with no other hosted deployments required! NOTE: The outcome won't be suitable for production deployments, but the process will show you the general approach to follow.

### Database

The demo currently uses SQLite. Vercel offers ephemeral compute primitives without persistent storage ([see here](https://vercel.com/guides/using-databases-with-vercel#compute-options)), so deploying the app as-is won't work.

In production, it's likely that you'd separately provision your database and then point your app at it, but for this demo, we can provision one locally and then use [ngrok](https://ngrok.com/) to expose that database to the public internet! At the time of writing, they offer a free tier allowing you to proxy a single service on a randomly generated URL at any one time.

The following steps will show you how to configure a local instance of PostgreSQL and adapt the code to talk to this DB instance via `ngrok`.

1. Install and configure Postgres (instructions can be found [here](https://www.postgresql.org/download/)), and then start an instance

2. Install and configure [ngrok](https://ngrok.com/docs/getting-started)

3. Expose your locally running Postgres instance with ngrok: `ngrok tcp 5432` (change the port if necessary)

4. Connect to the Postgres server (with `psql`) and create a Postgres user and database:

```sql
CREATE USER test_user WITH PASSWORD 'password123' CREATEDB;
CREATE DATABASE cerbos;
```

5. Update `datasource db` in `schema.prisma` to point to Postgres via an environment variable:

```
datasource db {
  provider = "postgres"
  url      = env("DATABASE_URL")
}
```

6. Instantiate the Prisma client with the new database (note: if you previously did this with SQLite, you'll need to delete the `prisma/migrations/` folder prior to running the following):

```sh
npx prisma migrate dev --name init
npx prisma db seed
```

7. Go to the "Environment Variables" section of the project settings in the Vercel dashboard, and set `DATABASE_URL` to the appropriate connection string in the format: `postgresql://{user}:{password}@{ngrok_url}:{ngrok_port}/{db_name}`. E.g. if the ngrok "forwarding" output was `tcp://4.tcp.eu.ngrok.io:12348 -> localhost:5432`, then (assuming the parameters in the example SQL above) the connection string would be `postgresql://some_user:password1234@4.tcp.eu.ngrok.io:12348/cerbos`.

### Cerbos PDP

We also need access to an instance of the Cerbos PDP. Again, in production, you'd manage your Cerbos deployments separately, but for this demo we can rely on the [Cerbos playground](https://play.cerbos.dev/) to store and serve our policies. For convenience, we've created a playground instance with the required policies which you can use [here](https://play.cerbos.dev/p/urL7ZEEA63d943b1SULSYmYsRSpiuvX8).

To point to this PDP instance, back in the Vercel project settings, set the environment variable `CERBOS_URL` to "demo-pdp.cerbos.cloud". You can optionally set `CERBOS_PLAYGROUND_INSTANCE` as well, but if you don't, it'll default to the provided instance.

### Deploy to Vercel

Deploy the preview to Vercel (running `vercel` in the project root will trigger this), and load it up. You should now have a Vercel hosted deployment, using an instance of Postgres on your local machine and a public instance of the Cerbos PDP running in the playground!
