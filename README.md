# commune-app

### Apps and Packages

- `commune-page`: a [Next.js](https://nextjs.org/) for the landing page
- `commune-governance`: a [Next.js](https://nextjs.org/) for the community governance application

- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) shared through `apps` applications
- `@commune-ts/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@commune-ts/tsconfig`: `tsconfig.json`s used throughout the monorepo
- `@commune-ts/providers`: a stub package that exports the `PolkadotProvider` and `ToastProvider`

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
yarn dev
```

## Useful Links

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
