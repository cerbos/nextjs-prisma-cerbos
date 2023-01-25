# nextjs-prisma-cerbos

A demo integrating [Cerbos](https://cerbos.dev) with a [Next.js](https://expressjs.com/) app using [Prisma](https://prisma.io/) as the ORM. This demo consists of the following:

- A SQLite database with a seeding script to pre-populate with user and contacts data.
- Authentication via a mock Identity Provider (IdP), consisting of a static structure stored in memory ([TODO: LINK ME]()) and Passport.js for session management.
- Protected pages for listing and accessing contacts for the actively authenticated user. Using server-side rendering (via `getServerSideProps`) to retrieve protected resources by generating a query plan from [Cerbos' PlanResources API](https://docs.cerbos.dev/cerbos/latest/api/index.html#resources-query-plan) and using it to retrieve the contacts from the database, using Prisma.
- Various utilities, hooks and APIs to demo different approaches that could be used when integrating Cerbos with Next.js.

## Dependencies

- Node.js
- Docker for running the [Cerbos Policy Decision Point (PDP)](https://docs.cerbos.dev/cerbos/installation/container.html)

## Getting Started

1. Start up the Cerbos PDP instance docker container. This will be called by the express app to check authorization.

```bash
cd cerbos
./start.sh
```

2. Install node dependencies

```bash
npm install
```

3. Setup Prisma and seed the database

```
npx prisma migrate dev --name init
npx prisma db seed
```

4. Start the development server

```bash
npm run dev
```

## Policies

This example has a simple CRUD policy in place for a resource kind of `contact` - like a CRM system would have. The policy file can be found in the `cerbos/policies` folder [here](https://github.com/cerbos/nextjs-prisma-cerbos/blob/main/cerbos/policies/contact.yaml).

Should you wish to experiment with this policy, you can <a href="https://play.cerbos.dev/p/ygW612cc9c9xXOsOZjI40ovY2LZvXf43" target="_blank">try it in the Cerbos Playground</a>.

<a href="https://play.cerbos.dev/p/ygW612cc9c9xXOsOZjI40ovY2LZvXf43" target="_blank"><img src="docs/launch.jpg" height="48" /></a>

The [policy](./cerbos/policies/contact.yaml) expects one of two roles to be set on the principal - `admin` and `user` and an attribute which defines their department as either `IT`, `Sales` or `Marketing`.

These roles are authorized as follows:

| Action   | Role: User                                  | Role: Admin |
| -------- | ------------------------------------------- | ----------- |
| `read`   | Only if department is `Sales`               | Y           |
| `create` | Only if department is `Sales`               | Y           |
| `update` | Only if they own the contact being accessed | Y           |
| `delete` | Only if they own the contact being accessed | Y           |

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
