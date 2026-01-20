This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## API REST (Lobby)

### POST /api/create-lobby
- Kod: [app/api/create-lobby/route.ts](app/api/create-lobby/route.ts#L1-L44)
- Cel: utworzenie lobby i ustawienie bieżącego użytkownika jako hosta.
- Body (JSON):
	```json
	{ "playlistId": "string|null", "rounds": 3 }
	```
- Odpowiedzi: 200 `{ "lobbyId": "<id>" }`; 401 `Unauthorized`/`User not found`; 500 `Internal Error`.
- REST: POST do kolekcji lobby (tworzenie zasobu); kod 200.


### POST /api/join-lobby
- Kod: [app/api/join-lobby/route.ts](app/api/join-lobby/route.ts#L1-L39)
- Cel: dołączenie bieżącego użytkownika do istniejącego lobby.
- Body (JSON):
	```json
	{ "lobbyId": "<id>" }
	```
- Odpowiedzi: 200 `{ "lobbyId": "<id>" }`; 401 `Unauthorized`/`No lobby`; 500 `Internal Error`.
- REST: POST jako akcja tworząca relację user–lobby.

### GET /api/get-lobbyid
- Kod: [app/api/get-lobbyid/route.ts](app/api/get-lobbyid/route.ts#L1-L29)
- Cel: sprawdzenie, do którego lobby jest przypięty bieżący użytkownik.
- Odpowiedzi: 200 `{ "lobbyId": "<id|null>" }`; 401 `Unauthorized`/`user not found`; 500 `Internal Error`.
- REST: GET do odczytu powiązanego zasobu.

### POST /api/webhooks
- Kod: [app/api/webhooks/route.ts](app/api/webhooks/route.ts#L1-L116)
- Cel: odbiór webhooków Clerk (`user.created`, `session.created`) i synchronizacja użytkowników w bazie.
- Odpowiedzi: 200 `Webhook received`; 400 `Error verifying webhook`.
- REST: techniczny endpoint integracyjny (POST na zdarzenia z systemu zewnętrznego).

### Zgodność z REST (skrót)
- Metody: GET do pobierania, POST do tworzenia/akcji – zgodne z semantyką REST powyższych zasobów.
- Kody: 200 sukces, 401 brak autoryzacji lub brak zasobu (rozważ 404 dla braku lobby/użytkownika), 500/400 dla błędów serwera/weryfikacji.
