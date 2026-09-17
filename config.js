require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '1537479129832759326',
  botName: 'Hakerski Bot',
  brandName: 'Hakerski™',
  systemFooter: '© 2026 Hakerski Bot',

  colors: {
    primary: 0x00FF41,
    secondary: 0x10B981,
    accent: 0x00E5FF,
    danger: 0xFF003C,
    warning: 0xF59E0B,
    dark: 0x0B0F19
  },

  status: {
    type: 'Watching',
    text: 'Nowi widzowie'
  },

  assets: {
    logoPath: './assets/logo.png',
    logoAttachmentName: 'hakerski_logo.png'
  },

  rulesHeader: '📜┃REGULAMIN SERWERA',
  rulesIntro: 'Hejka! 💬\nZanim zaczniesz działać — przeczytaj to uważnie. Dołączając, akceptujesz te zasady. 😎',
  rulesOutro: '✅ Akceptując zasady – dołączasz do Teamu Hekera! 💥\n🎉 Baw się dobrze i nagrywaj z klasą!',
  rules: [
    {
      number: 1,
      emoji: '💠',
      title: 'SZACUNEK',
      points: [
        '💬 Szanuj innych — bez wyzywania i kłótni.',
        '🚫 Zero rasizmu, seksizmu, homofobii i toksyczności.',
        '😎 Zachowuj kulturę – baw się, nie spinaj.'
      ]
    },
    {
      number: 2,
      emoji: '🛡️',
      title: 'ADMINI I MODZI',
      points: [
        '👑 Decyzje administracji są ostateczne.',
        '🧩 Nie dyskutuj publicznie – napisz na priv.',
        '🤝 Szanuj ekipę, a ekipa uszanuje Ciebie.'
      ]
    },
    {
      number: 3,
      emoji: '💬',
      title: 'CZAT I KANAŁY',
      points: [
        '🧠 Pisz na odpowiednich kanałach.',
        '🚫 Zakaz spamu, floodu i nadużywania @everyone.',
        '🧹 Bez reklam, łańcuszków i dziwnych linków.'
      ]
    },
    {
      number: 4,
      emoji: '🎥',
      title: 'TREŚCI',
      points: [
        '🎮 Serwer o Robloxie i nagrywkach – trzymajmy się tematu.',
        '🎶 Używaj tylko legalnych materiałów.',
        '🙈 Bez NSFW, drastycznych lub obraźliwych treści.'
      ]
    },
    {
      number: 5,
      emoji: '🚫',
      title: 'ZAKAZY',
      points: [
        '🔒 Nie podawaj danych – swoich ani cudzych.',
        '👻 Nie podszywaj się pod innych.',
        '🐍 Nie wysyłaj podejrzanych linków.',
        '🚫 Nie wolno przeklinać.',
        '🔒 Zakaz wysyłania cheatów.'
      ]
    },
    {
      number: 6,
      emoji: '⚙️',
      title: 'KARY',
      points: [
        '⚠️ Ostrzeżenie → Mute → Kick → Ban.',
        '🚪 Omijanie bana = perm ban.',
        '🔧 Admin decyduje o karze.'
      ]
    }
  ],

  selfRoleCategories: [
    {
      id: 'notifications',
      name: 'Powiadomienia',
      placeholder: '🔔 | Wybierz powiadomienia...',
      options: [
        {
          label: 'Ogłoszenia Serwera',
          description: 'Informacje i komunikaty serwerowe',
          value: 'role_notif_announcements',
          emoji: '📢'
        },
        {
          label: 'Konkursy & Giveaways',
          description: 'Dropy i konkursy',
          value: 'role_notif_giveaways',
          emoji: '🎉'
        },
        {
          label: 'Aktualizacje',
          description: 'Prace techniczne i nowości',
          value: 'role_notif_updates',
          emoji: '🚀'
        }
      ]
    },
    {
      id: 'platforms',
      name: 'Platforma',
      placeholder: '💻 | Wybierz platformy...',
      options: [
        {
          label: 'Komputer (PC)',
          description: 'Grasz na PC / laptopie',
          value: 'role_plat_pc',
          emoji: '💻'
        },
        {
          label: 'Konsola',
          description: 'PlayStation / Xbox / Switch',
          value: 'role_plat_console',
          emoji: '🎮'
        },
        {
          label: 'Mobile',
          description: 'Telefon lub tablet',
          value: 'role_plat_mobile',
          emoji: '📱'
        }
      ]
    }
  ],

  tickets: {
    panelTitle: '🏷️ HAKEROLANDIA — POMOC I TICKET',
    panelDescription: 'Wybierz odpowiednią kategorię z menu poniżej, aby otworzyć zgłoszenie.',
    placeholder: 'Wybierz kategorię zgłoszenia...',
    categories: [
      {
        value: 'ticket_support',
        label: 'Pomoc & Wsparcie',
        description: 'Problemy techniczne, zgłoszenia i pomoc',
        emoji: '🛠️',
        channelPrefix: 'pomoc'
      },
      {
        value: 'ticket_questions',
        label: 'Pytania Ogólne',
        description: 'Ogólne pytania i informacje o serwerze',
        emoji: '❓',
        channelPrefix: 'pytania'
      },
      {
        value: 'ticket_reward',
        label: 'Odebranie Nagrody',
        description: 'Odbierz swoją nagrodę z konkursu lub eventu',
        emoji: '🎁',
        channelPrefix: 'nagroda'
      }
    ]
  },

  statsLayout: {
    categoryName: '📈 | ----statystyki----',
    prefixMembers: 'Widzowie 🧒 : ',
    prefixBots: 'Boty 🤖 : ',
    prefixBans: 'Bany 🔨 : ',
    prefixNewest: 'Nowy ✨ : '
  }
};
