# Skill Menu

Today this app does one small thing well. It gives skill menus a home on Base. A user can listing a useful ability, and the result is a skill card instead of a vague promise.

I kept the identity trail visible:

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a097e421b76c7abf6d06a94` |
| Builder Wallet | `0xbd51A371f11f79618a1CE652fD9e0995B1f6B133` |
| Builder Code | `bc_2b1psw7k` |
| Live Demo | https://skill-menu.vercel.app |
| GitHub Repository | https://github.com/tigrehouse/skill-menu-base-dapp |
| Network | Base |
| Deployment | Vercel |

The app can be run with:

```bash
npm install
npm run dev
```

Built using React app router, wallet hooks, Base network config, Vercel deployment.

Note to future maintainers: Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.
