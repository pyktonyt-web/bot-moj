# Hakerski - BOT

Bot Discord dla serwera Hakerski, oparty na Discord Components V2.

## Funkcje
- **Regulamin**: Panel regulaminu serwera Team Hekera z przyciskiem akceptacji.
- **Weryfikacja Captcha**: System weryfikacji z kodem jednorazowym w oknie modalnym.
- **Tickety**: Zgłoszenia Hakerolandia z wyborem kategorii (Pomoc, Pytania, Nagrody).
- **Statystyki**: Automatyczne liczniki na kanałach głosowych (Widzowie, Boty, Bany, Nowy).
- **Self-Role**: Wybór ról powiadomień, platform oraz trybów gier.
- **Powitania i Pożegnania**: Kanały powitalne i pożegnalne z informacjami o użytkowniku.
- **Moderacja**: Pakiet komend `/mod` (panel GUI, ban, kick, timeout, warn, clear, lock, slowmode, czyszczenie botów).

## Wymagania
- Node.js 18 lub nowszy
- Uprawnienia Privileged Gateway Intents w Discord Developer Portal:
  - Server Members Intent
  - Message Content Intent
  - Presence Intent

## Instalacja i uruchomienie

1. Zainstaluj biblioteki:
   ```bash
   npm install
   ```

2. Skonfiguruj plik `.env`:
   ```env
   DISCORD_TOKEN=twoj_token_bota
   CLIENT_ID=1549087705789497454
   ```

3. Uruchom bota:
   ```bash
   npm start
   ```

   Tryb developerski (auto-restart):
   ```bash
   npm run dev
   ```

## Komendy

### Konfiguracja (`/setup`)
- `/setup panel` — Otwiera panel konfiguracyjny ze skrótami do wszystkich modułów.
- `/setup wszystko` — Automatycznie tworzy wszystkie kategorie, kanały i panele na serwerze.
- `/setup weryfikacja` — Wysyła panel weryfikacji na kanał.
- `/setup regulamin` — Wysyła panel regulaminu na kanał.
- `/setup selfrole` — Wysyła menu wyboru ról.
- `/setup statystyki` — Tworzy kategorię i kanały liczników głosowych.
- `/setup ticket` — Wysyła panel zgłoszeniowy.
- `/setup powitania` — Ustawia kanały powitań i pożegnań.
- `/setup logi` — Ustawia kanał logów moderacyjnych.

### Moderacja (`/mod`)
- `/mod panel @uzytkownik` — Pulpit moderacyjny z przyciskami (Mute, Odmute, Warn, Kick, Ban).
- `/mod ban @uzytkownik [powod] [dni_usuniecia]` — Banuje użytkownika.
- `/mod kick @uzytkownik [powod]` — Wyrzuca użytkownika.
- `/mod timeout @uzytkownik <minuty> [powod]` — Wycisza użytkownika na określony czas.
- `/mod unmute @uzytkownik` — Zdejmuje wyciszenie.
- `/mod warn @uzytkownik <powod>` — Nadaje ostrzeżenie.
- `/mod ostrzezenia @uzytkownik` — Wyświetla listę ostrzeżeń użytkownika.
- `/mod czysc_ostrzezenia @uzytkownik` — Czyści listę ostrzeżeń.
- `/mod clear <liczba>` — Masowe usuwanie wiadomości (1-100).
- `/mod lock [kanal]` / `/mod unlock [kanal]` — Blokowanie / odblokowanie kanału.
- `/mod slowmode <sekundy> [kanal]` — Ustawienie trybu powolnego.
- `/mod czysc_boty <ban|kick>` — Usuwa lub banuje inne boty z serwera.

### Informacyjne
- `/pomoc` — Spis komend i opis działania bota.
- `/regulamin` — Wyświetla oficjalny regulamin serwera.
- `/statystyki` — Wyświetla analitykę i dane serwera.
- `/ticket panel` — Wysyła panel ticketów na kanał.
