# Just for Fun Gaming — Website

Website for [Just for Fun Gaming](https://justforfungamingstore.com), a board game and tabletop RPG store at 130 Federal Road, Danbury, CT.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home page |
| `login.html` | Member signup / login |
| `reserve.html` | Table reservation calendar |
| `admin.html` | Toby's admin dashboard |
| `blog.html` | The Gamer's Corner blog |
| `css/style.css` | Shared stylesheet |
| `js/main.js` | Shared JavaScript + mock data |

## Demo Logins (for presentation)

On the Login page, use the **Demo Shortcuts**:
- **Member login** — logs in as Evan (regular member), shows reservation calendar
- **Admin login** — logs in as Toby, shows admin dashboard with reservations, members, newsletter list

## Tech Stack

- **Hosting:** GitHub Pages (free)
- **Images:** Cloudinary (same account as thebrodies.com)
- **Auth + Database (production):** Supabase (free tier)
- **Domain:** justforfungamingstore.com

## Deploying to GitHub Pages

1. Create repo at `github.com/3crotonlake/justforfungaming`
2. Push all files
3. Go to Settings → Pages → Source: Deploy from branch `main`, folder `/root`
4. Site live at `https://3crotonlake.github.io/justforfungaming/`
5. Point custom domain when ready

## Roadmap

- [ ] Wire up Supabase auth (replace localStorage mock)
- [ ] Wire up Supabase database (replace MockData)
- [ ] Add Cloudinary images (store photos, game photos)
- [ ] Add Games page with full inventory
- [ ] Add Events/Calendar page
- [ ] Add newsletter sending (SendGrid or Mailchimp API)
- [ ] Custom domain setup
- [ ] Cancel Wix subscription
