/**
 * French language curriculum data for basicfrench.org
 * Comprehensive beginner foundation: Alphabet & Phonetics, Essential Phrases,
 * Numbers (0–1,000), Telling Time, and High-Frequency Vocabulary.
 */
import { AlphabetItem, PhraseItem, AppData } from '../types/index';

const alphabet: AlphabetItem[] = [
  {
    "letter": "A",
    "pronunciation": "/ɑ/",
    "example": "as in father / calm",
    "word": "Ami",
    "meaning": "Friend",
    "icon": "🧑‍🤝‍🧑"
  },
  {
    "letter": "B",
    "pronunciation": "/be/",
    "example": "as in boy / book",
    "word": "Bonjour",
    "meaning": "Hello / Good morning",
    "icon": "👋"
  },
  {
    "letter": "C",
    "pronunciation": "/se/",
    "example": "as in cat (hard c) or cinema (soft c)",
    "word": "Café",
    "meaning": "Coffee",
    "icon": "☕"
  },
  {
    "letter": "D",
    "pronunciation": "/de/",
    "example": "as in door / day",
    "word": "Demain",
    "meaning": "Tomorrow",
    "icon": "🌅"
  },
  {
    "letter": "E",
    "pronunciation": "/ə/",
    "example": "as in the / her (neutral vowel /ə/)",
    "word": "Eau",
    "meaning": "Water",
    "icon": "💧"
  },
  {
    "letter": "F",
    "pronunciation": "/ɛf/",
    "example": "as in fox / family",
    "word": "Famille",
    "meaning": "Family",
    "icon": "👨‍👩‍👧"
  },
  {
    "letter": "G",
    "pronunciation": "/ʒe/",
    "example": "as in measure (/ʒ/ before e/i), go before a/o/u",
    "word": "Gare",
    "meaning": "Train Station",
    "icon": "🚉"
  },
  {
    "letter": "H",
    "pronunciation": "/aʃ/ (muet)",
    "example": "silent (as in hour / honor)",
    "word": "Hôtel",
    "meaning": "Hotel",
    "icon": "🏨"
  },
  {
    "letter": "I",
    "pronunciation": "/i/",
    "example": "as in see / machine",
    "word": "Idée",
    "meaning": "Idea",
    "icon": "💡"
  },
  {
    "letter": "J",
    "pronunciation": "/ʒi/",
    "example": "as in measure / vision (soft zh)",
    "word": "Jour",
    "meaning": "Day",
    "icon": "☀️"
  },
  {
    "letter": "K",
    "pronunciation": "/ka/",
    "example": "as in kite / kilo",
    "word": "Kilo",
    "meaning": "Kilogram",
    "icon": "⚖️"
  },
  {
    "letter": "L",
    "pronunciation": "/ɛl/",
    "example": "as in lamp / light",
    "word": "Livre",
    "meaning": "Book",
    "icon": "📖"
  },
  {
    "letter": "M",
    "pronunciation": "/ɛm/",
    "example": "as in moon / mother",
    "word": "Maison",
    "meaning": "House",
    "icon": "🏠"
  },
  {
    "letter": "N",
    "pronunciation": "/ɛn/",
    "example": "as in nest / night",
    "word": "Nuit",
    "meaning": "Night",
    "icon": "🌙"
  },
  {
    "letter": "O",
    "pronunciation": "/o/",
    "example": "as in boat / open",
    "word": "Oui",
    "meaning": "Yes",
    "icon": "✅"
  },
  {
    "letter": "P",
    "pronunciation": "/pe/",
    "example": "as in pen / park",
    "word": "Pain",
    "meaning": "Bread",
    "icon": "🥖"
  },
  {
    "letter": "Q",
    "pronunciation": "/ky/",
    "example": "as in keep / kite (k sound)",
    "word": "Question",
    "meaning": "Question",
    "icon": "❓"
  },
  {
    "letter": "R",
    "pronunciation": "/ɛʁ/",
    "example": "as in run (guttural French throat r)",
    "word": "Rue",
    "meaning": "Street",
    "icon": "🛣️"
  },
  {
    "letter": "S",
    "pronunciation": "/ɛs/",
    "example": "as in sun / sea",
    "word": "Soleil",
    "meaning": "Sun",
    "icon": "☀️"
  },
  {
    "letter": "T",
    "pronunciation": "/te/",
    "example": "as in tea / table",
    "word": "Travail",
    "meaning": "Work",
    "icon": "💼"
  },
  {
    "letter": "U",
    "pronunciation": "/y/",
    "example": "as in cute / French rounded u",
    "word": "Un",
    "meaning": "One",
    "icon": "1️⃣"
  },
  {
    "letter": "V",
    "pronunciation": "/ve/",
    "example": "as in voice / vine",
    "word": "Ville",
    "meaning": "City",
    "icon": "🏙️"
  },
  {
    "letter": "W",
    "pronunciation": "/dubləve/",
    "example": "as in wagon / voice (v sound)",
    "word": "Wagon",
    "meaning": "Wagon / Car",
    "icon": "🚃"
  },
  {
    "letter": "X",
    "pronunciation": "/iks/",
    "example": "as in box / extra",
    "word": "Exemple",
    "meaning": "Example",
    "icon": "📝"
  },
  {
    "letter": "Y",
    "pronunciation": "/iɡʁɛk/",
    "example": "as in see / yes",
    "word": "Yeux",
    "meaning": "Eyes",
    "icon": "👀"
  },
  {
    "letter": "Z",
    "pronunciation": "/zɛd/",
    "example": "as in zoo / zero",
    "word": "Zéro",
    "meaning": "Zero",
    "icon": "0️⃣"
  }
];

const basicPhrases: PhraseItem[] = [
  {
    "phrase": "Bonjour",
    "translation": "Hello / Good morning",
    "pronunciation": "bohn-ZHOOR",
    "category": "Greetings",
    "icon": "👋"
  },
  {
    "phrase": "Bonsoir",
    "translation": "Good evening",
    "pronunciation": "bohn-SWAHR",
    "category": "Greetings",
    "icon": "🌆"
  },
  {
    "phrase": "Salut",
    "translation": "Hi / Bye (informal)",
    "pronunciation": "sah-LOO",
    "category": "Greetings",
    "icon": "🤙"
  },
  {
    "phrase": "Comment allez-vous ?",
    "translation": "How are you? (formal)",
    "pronunciation": "koh-mahn tah-lay VOO",
    "category": "Conversation",
    "icon": "👔"
  },
  {
    "phrase": "Ça va ?",
    "translation": "How are you? / Doing okay? (informal)",
    "pronunciation": "sah VAH",
    "category": "Conversation",
    "icon": "❓"
  },
  {
    "phrase": "Ça va bien, merci",
    "translation": "I am doing well, thank you",
    "pronunciation": "sah vah BYAHN, mair-SEE",
    "category": "Conversation",
    "icon": "😊"
  },
  {
    "phrase": "Et vous ?",
    "translation": "And you? (formal)",
    "pronunciation": "ay VOO",
    "category": "Conversation",
    "icon": "👉"
  },
  {
    "phrase": "S'il vous plaît",
    "translation": "Please (formal)",
    "pronunciation": "seel voo PLEH",
    "category": "Politeness",
    "icon": "🙏"
  },
  {
    "phrase": "Merci beaucoup",
    "translation": "Thank you very much",
    "pronunciation": "mair-SEE boh-KOO",
    "category": "Politeness",
    "icon": "✨"
  },
  {
    "phrase": "De rien / Je vous en prie",
    "translation": "You are welcome",
    "pronunciation": "duh RYEHN / zhuh voo zahn PREE",
    "category": "Politeness",
    "icon": "👍"
  },
  {
    "phrase": "Excusez-moi / Pardon",
    "translation": "Excuse me / Sorry",
    "pronunciation": "ex-kew-zay MWAH / pahr-DOHN",
    "category": "Politeness",
    "icon": "🙇"
  },
  {
    "phrase": "Comment vous appelez-vous ?",
    "translation": "What is your name? (formal)",
    "pronunciation": "koh-mahn voo zah-play VOO",
    "category": "Introductions",
    "icon": "🏷️"
  },
  {
    "phrase": "Je m'appelle...",
    "translation": "My name is...",
    "pronunciation": "zhuh mah-PELL...",
    "category": "Introductions",
    "icon": "🙋"
  },
  {
    "phrase": "Enchanté(e)",
    "translation": "Pleased to meet you",
    "pronunciation": "ahn-shahn-TAY",
    "category": "Introductions",
    "icon": "🤝"
  },
  {
    "phrase": "Où sont les toilettes ?",
    "translation": "Where are the restrooms?",
    "pronunciation": "oo sohn lay twah-LETT",
    "category": "Travel",
    "icon": "🚻"
  },
  {
    "phrase": "Combien ça coûte ?",
    "translation": "How much does it cost?",
    "pronunciation": "kohm-BYEHN sah KOOT",
    "category": "Shopping",
    "icon": "💰"
  },
  {
    "phrase": "L'addition, s'il vous plaît",
    "translation": "The bill / check, please",
    "pronunciation": "lah-dee-SYOHN seel voo PLEH",
    "category": "Dining",
    "icon": "🧾"
  },
  {
    "phrase": "Parlez-vous anglais ?",
    "translation": "Do you speak English?",
    "pronunciation": "pahr-lay voo zahn-GLEH",
    "category": "Conversation",
    "icon": "🗣️"
  },
  {
    "phrase": "Je ne comprends pas",
    "translation": "I do not understand",
    "pronunciation": "zhuh nuh kohm-PRAHN pah",
    "category": "Conversation",
    "icon": "🤔"
  },
  {
    "phrase": "Pouvez-vous répéter ?",
    "translation": "Can you repeat?",
    "pronunciation": "poo-vay voo ray-pay-TAY",
    "category": "Conversation",
    "icon": "🔄"
  },
  {
    "phrase": "À bientôt",
    "translation": "See you soon",
    "pronunciation": "ah byehn-TOH",
    "category": "Farewells",
    "icon": "👋"
  },
  {
    "phrase": "Au revoir",
    "translation": "Goodbye",
    "pronunciation": "oh ruh-VWAHR",
    "category": "Farewells",
    "icon": "🚪"
  },
  {
    "phrase": "Vous m'entendez ?",
    "translation": "Can you hear me?",
    "pronunciation": "voo mahn-tahn-DAY",
    "category": "Tech",
    "icon": "🎧"
  },
  {
    "phrase": "Voyez-vous mon écran ?",
    "translation": "Can you see my screen?",
    "pronunciation": "vwah-yay voo mohn ay-KRAHN",
    "category": "Tech",
    "icon": "🖥️"
  },
  {
    "phrase": "Quel est le mot de passe du Wi-Fi ?",
    "translation": "What is the Wi-Fi password?",
    "pronunciation": "kehl eh luh moh duh pahs dew wee-fee",
    "category": "Tech",
    "icon": "📶"
  },
  {
    "phrase": "Planifions une réunion",
    "translation": "Let's schedule a meeting",
    "pronunciation": "plah-nee-FYOHN ewn ray-ew-NYOHN",
    "category": "Business",
    "icon": "📅"
  },
  {
    "phrase": "Je vous enverrai un courriel",
    "translation": "I will send you an email",
    "pronunciation": "zhuh voo zahn-veh-RAY ahn koo-RYEL",
    "category": "Business",
    "icon": "📧"
  },
  {
    "phrase": "Quelle est la date limite ?",
    "translation": "When is the deadline?",
    "pronunciation": "kehl eh lah daht lee-MEET",
    "category": "Business",
    "icon": "⏳"
  },
  {
    "phrase": "J'ai besoin d'un médecin",
    "translation": "I need a doctor",
    "pronunciation": "zhay buh-ZWAN dahn mayd-SAHN",
    "category": "Health",
    "icon": "🩺"
  },
  {
    "phrase": "Où est la pharmacie la plus proche ?",
    "translation": "Where is the nearest pharmacy?",
    "pronunciation": "oo eh lah fahr-mah-SEE lah plew PROHSH",
    "category": "Health",
    "icon": "💊"
  },
  {
    "phrase": "Je suis allergique aux noix",
    "translation": "I am allergic to nuts",
    "pronunciation": "zhuh swee zah-lehr-ZHEEK oh NWAH",
    "category": "Health",
    "icon": "⚠️"
  },
  {
    "phrase": "J'ai une réservation",
    "translation": "I have a reservation",
    "pronunciation": "zhay ewn ray-zehr-vah-SYOHN",
    "category": "Travel",
    "icon": "🛎️"
  },
  {
    "phrase": "Où est la gare ?",
    "translation": "Where is the train station?",
    "pronunciation": "oo eh lah GAHR",
    "category": "Travel",
    "icon": "🚉"
  },
  {
    "phrase": "J'ai besoin d'un taxi",
    "translation": "I need a taxi",
    "pronunciation": "zhay buh-ZWAN dahn tahk-SEE",
    "category": "Travel",
    "icon": "🚕"
  },
  {
    "phrase": "Une table pour deux, s'il vous plaît",
    "translation": "A table for two, please",
    "pronunciation": "ewn TAH-bluh poor duh seel voo PLEH",
    "category": "Dining",
    "icon": "🍽️"
  },
  {
    "phrase": "La carte, s'il vous plaît",
    "translation": "The menu, please",
    "pronunciation": "lah KAHRT seel voo PLEH",
    "category": "Dining",
    "icon": "📖"
  },
  {
    "phrase": "Acceptez-vous les cartes bancaires ?",
    "translation": "Do you accept credit cards?",
    "pronunciation": "ahk-sehp-tay voo lay kahrt bahn-KEHR",
    "category": "Shopping",
    "icon": "💳"
  },
  {
    "phrase": "C'est trop cher",
    "translation": "It is too expensive",
    "pronunciation": "seh troh SHEHR",
    "category": "Shopping",
    "icon": "💸"
  }
];

const numbers: PhraseItem[] = [
  {
    "phrase": "Zéro",
    "translation": "0 (Zero)",
    "pronunciation": "zay-ROH",
    "category": "Numbers 0-10",
    "icon": "0️⃣"
  },
  {
    "phrase": "Un",
    "translation": "1 (One)",
    "pronunciation": "ahn",
    "category": "Numbers 0-10",
    "icon": "1️⃣"
  },
  {
    "phrase": "Deux",
    "translation": "2 (Two)",
    "pronunciation": "duh",
    "category": "Numbers 0-10",
    "icon": "2️⃣"
  },
  {
    "phrase": "Trois",
    "translation": "3 (Three)",
    "pronunciation": "trwah",
    "category": "Numbers 0-10",
    "icon": "3️⃣"
  },
  {
    "phrase": "Quatre",
    "translation": "4 (Four)",
    "pronunciation": "KAT-ruh",
    "category": "Numbers 0-10",
    "icon": "4️⃣"
  },
  {
    "phrase": "Cinq",
    "translation": "5 (Five)",
    "pronunciation": "sank",
    "category": "Numbers 0-10",
    "icon": "5️⃣"
  },
  {
    "phrase": "Six",
    "translation": "6 (Six)",
    "pronunciation": "sees",
    "category": "Numbers 0-10",
    "icon": "6️⃣"
  },
  {
    "phrase": "Sept",
    "translation": "7 (Seven)",
    "pronunciation": "set",
    "category": "Numbers 0-10",
    "icon": "7️⃣"
  },
  {
    "phrase": "Huit",
    "translation": "8 (Eight)",
    "pronunciation": "weet",
    "category": "Numbers 0-10",
    "icon": "8️⃣"
  },
  {
    "phrase": "Neuf",
    "translation": "9 (Nine)",
    "pronunciation": "nuf",
    "category": "Numbers 0-10",
    "icon": "9️⃣"
  },
  {
    "phrase": "Dix",
    "translation": "10 (Ten)",
    "pronunciation": "dees",
    "category": "Numbers 0-10",
    "icon": "🔟"
  },
  {
    "phrase": "Onze",
    "translation": "11 (Eleven)",
    "pronunciation": "ohnz",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Douze",
    "translation": "12 (Twelve)",
    "pronunciation": "dooz",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Treize",
    "translation": "13 (Thirteen)",
    "pronunciation": "trehz",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Quatorze",
    "translation": "14 (Fourteen)",
    "pronunciation": "kah-TOHRZ",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Quinze",
    "translation": "15 (Fifteen)",
    "pronunciation": "kanz",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Seize",
    "translation": "16 (Sixteen)",
    "pronunciation": "sehz",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Dix-sept",
    "translation": "17 (Seventeen)",
    "pronunciation": "dee-SET",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Dix-huit",
    "translation": "18 (Eighteen)",
    "pronunciation": "deez-WEET",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Dix-neuf",
    "translation": "19 (Nineteen)",
    "pronunciation": "deez-NUF",
    "category": "Numbers 11-20",
    "icon": "🔢"
  },
  {
    "phrase": "Vingt",
    "translation": "20 (Twenty)",
    "pronunciation": "vahn",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Trente",
    "translation": "30 (Thirty)",
    "pronunciation": "trahnt",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Quarante",
    "translation": "40 (Forty)",
    "pronunciation": "kah-RAHNT",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Cinquante",
    "translation": "50 (Fifty)",
    "pronunciation": "san-KAHNT",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Soixante",
    "translation": "60 (Sixty)",
    "pronunciation": "swah-SAHNT",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Soixante-dix",
    "translation": "70 (Seventy)",
    "pronunciation": "swah-sahnt-DEES",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Quatre-vingts",
    "translation": "80 (Eighty)",
    "pronunciation": "kat-ruh-VAHN",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Quatre-vingt-dix",
    "translation": "90 (Ninety)",
    "pronunciation": "kat-ruh-vahn-DEES",
    "category": "Tens",
    "icon": "🔢"
  },
  {
    "phrase": "Cent",
    "translation": "100 (One Hundred)",
    "pronunciation": "sahn",
    "category": "Hundreds",
    "icon": "💯"
  },
  {
    "phrase": "Mille",
    "translation": "1,000 (One Thousand)",
    "pronunciation": "meel",
    "category": "Thousands",
    "icon": "🏆"
  }
];

const time: PhraseItem[] = [
  {
    "phrase": "Quelle heure est-il ?",
    "translation": "What time is it?",
    "pronunciation": "kell er eh-teel",
    "category": "Questions",
    "icon": "⌚"
  },
  {
    "phrase": "Il est une heure pile",
    "translation": "It is one o'clock on the dot",
    "pronunciation": "eel eh oon er peel",
    "category": "Hour",
    "icon": "🕐"
  },
  {
    "phrase": "Il est deux heures",
    "translation": "It is two o'clock",
    "pronunciation": "eel eh duh zer",
    "category": "Hour",
    "icon": "🕑"
  },
  {
    "phrase": "Il est trois heures et demie",
    "translation": "It is 3:30 (half past three)",
    "pronunciation": "eel eh trwah zer ay duh-MEE",
    "category": "Minutes",
    "icon": "🕞"
  },
  {
    "phrase": "Il est quatre heures et quart",
    "translation": "It is 4:15 (quarter past four)",
    "pronunciation": "eel eh kat-rer ay KAR",
    "category": "Minutes",
    "icon": "🕓"
  },
  {
    "phrase": "Il est cinq heures moins le quart",
    "translation": "It is 4:45 (quarter to five)",
    "pronunciation": "eel eh san-ker mwan luh KAR",
    "category": "Minutes",
    "icon": "🕟"
  },
  {
    "phrase": "Midi",
    "translation": "Noon / Midday",
    "pronunciation": "mee-DEE",
    "category": "Special",
    "icon": "🕛"
  },
  {
    "phrase": "Minuit",
    "translation": "Midnight",
    "pronunciation": "mee-NWEE",
    "category": "Special",
    "icon": "🌙"
  }
];

const commonWords: PhraseItem[] = [
  {
    "phrase": "Oui",
    "translation": "Yes",
    "pronunciation": "wee",
    "category": "Essentials",
    "icon": "✅"
  },
  {
    "phrase": "Non",
    "translation": "No",
    "pronunciation": "nohn",
    "category": "Essentials",
    "icon": "❌"
  },
  {
    "phrase": "Eau",
    "translation": "Water",
    "pronunciation": "oh",
    "category": "Food & Drink",
    "icon": "💧"
  },
  {
    "phrase": "Nourriture",
    "translation": "Food",
    "pronunciation": "noo-ree-TYOOR",
    "category": "Food & Drink",
    "icon": "🍲"
  },
  {
    "phrase": "Café",
    "translation": "Coffee",
    "pronunciation": "kah-FAY",
    "category": "Food & Drink",
    "icon": "☕"
  },
  {
    "phrase": "Temps",
    "translation": "Time / Weather",
    "pronunciation": "tahn",
    "category": "Time",
    "icon": "⏱️"
  },
  {
    "phrase": "Aujourd'hui",
    "translation": "Today",
    "pronunciation": "oh-zhoor-DWEE",
    "category": "Time",
    "icon": "📅"
  },
  {
    "phrase": "Demain",
    "translation": "Tomorrow",
    "pronunciation": "duh-MAHN",
    "category": "Time",
    "icon": "🌅"
  },
  {
    "phrase": "Hier",
    "translation": "Yesterday",
    "pronunciation": "yehr",
    "category": "Time",
    "icon": "⏮️"
  },
  {
    "phrase": "Travail",
    "translation": "Work / Job",
    "pronunciation": "trah-VAHY",
    "category": "Work",
    "icon": "💼"
  },
  {
    "phrase": "Bureau",
    "translation": "Office / Desk",
    "pronunciation": "bew-ROH",
    "category": "Work",
    "icon": "🏢"
  },
  {
    "phrase": "Argent",
    "translation": "Money / Silver",
    "pronunciation": "ahr-ZHAHN",
    "category": "Finance",
    "icon": "💵"
  },
  {
    "phrase": "Aide",
    "translation": "Help",
    "pronunciation": "ehd",
    "category": "Essentials",
    "icon": "🆘"
  },
  {
    "phrase": "Ami",
    "translation": "Friend",
    "pronunciation": "ah-MEE",
    "category": "People",
    "icon": "🧑‍🤝‍🧑"
  },
  {
    "phrase": "Famille",
    "translation": "Family",
    "pronunciation": "fah-MEE-yuh",
    "category": "People",
    "icon": "👨‍👩‍👧"
  },
  {
    "phrase": "Maison",
    "translation": "House / Home",
    "pronunciation": "meh-ZOHN",
    "category": "Places",
    "icon": "🏠"
  },
  {
    "phrase": "Ville",
    "translation": "City",
    "pronunciation": "veel",
    "category": "Places",
    "icon": "🏙️"
  },
  {
    "phrase": "Pays",
    "translation": "Country",
    "pronunciation": "pay-EE",
    "category": "Places",
    "icon": "🗺️"
  },
  {
    "phrase": "Voiture",
    "translation": "Car",
    "pronunciation": "vwah-TYOOR",
    "category": "Transport",
    "icon": "🚗"
  },
  {
    "phrase": "Train",
    "translation": "Train",
    "pronunciation": "trahn",
    "category": "Transport",
    "icon": "🚆"
  },
  {
    "phrase": "Rouge",
    "translation": "Red",
    "pronunciation": "roozh",
    "category": "Colors",
    "icon": "🔴"
  },
  {
    "phrase": "Bleu",
    "translation": "Blue",
    "pronunciation": "bluh",
    "category": "Colors",
    "icon": "🔵"
  },
  {
    "phrase": "Vert",
    "translation": "Green",
    "pronunciation": "vehr",
    "category": "Colors",
    "icon": "🟢"
  },
  {
    "phrase": "Jaune",
    "translation": "Yellow",
    "pronunciation": "zhohn",
    "category": "Colors",
    "icon": "🟡"
  },
  {
    "phrase": "Noir",
    "translation": "Black",
    "pronunciation": "nwahr",
    "category": "Colors",
    "icon": "⚫"
  },
  {
    "phrase": "Blanc",
    "translation": "White",
    "pronunciation": "blahn",
    "category": "Colors",
    "icon": "⚪"
  },
  {
    "phrase": "Grand",
    "translation": "Big",
    "pronunciation": "grahn",
    "category": "Descriptions",
    "icon": "🐘"
  },
  {
    "phrase": "Petit",
    "translation": "Small",
    "pronunciation": "puh-TEE",
    "category": "Descriptions",
    "icon": "🐁"
  },
  {
    "phrase": "Nouveau",
    "translation": "New",
    "pronunciation": "noo-VOH",
    "category": "Descriptions",
    "icon": "✨"
  },
  {
    "phrase": "Vieux",
    "translation": "Old",
    "pronunciation": "vyuh",
    "category": "Descriptions",
    "icon": "🕰️"
  },
  {
    "phrase": "Soleil",
    "translation": "Sun",
    "pronunciation": "soh-LAY",
    "category": "Weather",
    "icon": "☀️"
  },
  {
    "phrase": "Pluie",
    "translation": "Rain",
    "pronunciation": "plwee",
    "category": "Weather",
    "icon": "🌧️"
  },
  {
    "phrase": "Neige",
    "translation": "Snow",
    "pronunciation": "nehzh",
    "category": "Weather",
    "icon": "❄️"
  },
  {
    "phrase": "Vent",
    "translation": "Wind",
    "pronunciation": "vahn",
    "category": "Weather",
    "icon": "💨"
  },
  {
    "phrase": "Nuage",
    "translation": "Cloud",
    "pronunciation": "new-AZH",
    "category": "Weather",
    "icon": "☁️"
  },
  {
    "phrase": "Orage",
    "translation": "Storm",
    "pronunciation": "oh-RAZH",
    "category": "Weather",
    "icon": "⛈️"
  },
  {
    "phrase": "Chaud",
    "translation": "Hot",
    "pronunciation": "shoh",
    "category": "Weather",
    "icon": "🔥"
  },
  {
    "phrase": "Froid",
    "translation": "Cold",
    "pronunciation": "frwah",
    "category": "Weather",
    "icon": "🥶"
  },
  {
    "phrase": "Ordinateur",
    "translation": "Computer",
    "pronunciation": "ohr-dee-nah-TER",
    "category": "Tech",
    "icon": "💻"
  },
  {
    "phrase": "Téléphone",
    "translation": "Phone",
    "pronunciation": "tay-lay-FOHN",
    "category": "Tech",
    "icon": "📱"
  },
  {
    "phrase": "Internet",
    "translation": "Internet",
    "pronunciation": "ahn-tehr-NET",
    "category": "Tech",
    "icon": "🌐"
  },
  {
    "phrase": "Mot de passe",
    "translation": "Password",
    "pronunciation": "moh duh PAHS",
    "category": "Tech",
    "icon": "🔐"
  },
  {
    "phrase": "Courriel",
    "translation": "Email",
    "pronunciation": "koo-RYEL",
    "category": "Tech",
    "icon": "📧"
  },
  {
    "phrase": "Écran",
    "translation": "Screen",
    "pronunciation": "ay-KRAHN",
    "category": "Tech",
    "icon": "🖥️"
  },
  {
    "phrase": "Réunion",
    "translation": "Meeting",
    "pronunciation": "ray-ew-NYOHN",
    "category": "Tech",
    "icon": "📅"
  },
  {
    "phrase": "Fichier",
    "translation": "File",
    "pronunciation": "fee-SHYAY",
    "category": "Tech",
    "icon": "📁"
  },
  {
    "phrase": "Lien",
    "translation": "Link",
    "pronunciation": "lyahn",
    "category": "Tech",
    "icon": "🔗"
  },
  {
    "phrase": "Code",
    "translation": "Code",
    "pronunciation": "kohd",
    "category": "Tech",
    "icon": "🧑‍💻"
  },
  {
    "phrase": "Erreur",
    "translation": "Error",
    "pronunciation": "eh-RER",
    "category": "Tech",
    "icon": "🐛"
  },
  {
    "phrase": "Batterie",
    "translation": "Battery",
    "pronunciation": "bah-TREE",
    "category": "Tech",
    "icon": "🔋"
  },
  {
    "phrase": "Projet",
    "translation": "Project",
    "pronunciation": "proh-ZHEH",
    "category": "Business",
    "icon": "📊"
  },
  {
    "phrase": "Client",
    "translation": "Client",
    "pronunciation": "klee-YAHN",
    "category": "Business",
    "icon": "🤝"
  },
  {
    "phrase": "Équipe",
    "translation": "Team",
    "pronunciation": "ay-KEEP",
    "category": "Business",
    "icon": "👥"
  },
  {
    "phrase": "Directeur",
    "translation": "Manager",
    "pronunciation": "dee-rehk-TER",
    "category": "Business",
    "icon": "👔"
  },
  {
    "phrase": "Entreprise",
    "translation": "Company",
    "pronunciation": "ahn-truh-PREEZ",
    "category": "Business",
    "icon": "🏢"
  },
  {
    "phrase": "Contrat",
    "translation": "Contract",
    "pronunciation": "kohn-TRAH",
    "category": "Business",
    "icon": "📝"
  },
  {
    "phrase": "Horaire",
    "translation": "Schedule",
    "pronunciation": "oh-REHR",
    "category": "Business",
    "icon": "🗓️"
  },
  {
    "phrase": "Date limite",
    "translation": "Deadline",
    "pronunciation": "daht lee-MEET",
    "category": "Business",
    "icon": "⏳"
  },
  {
    "phrase": "Facture",
    "translation": "Invoice",
    "pronunciation": "fahk-TYOOR",
    "category": "Business",
    "icon": "🧾"
  },
  {
    "phrase": "Salaire",
    "translation": "Salary",
    "pronunciation": "sah-LEHR",
    "category": "Business",
    "icon": "💵"
  },
  {
    "phrase": "Médecin",
    "translation": "Doctor",
    "pronunciation": "mayd-SAHN",
    "category": "Health",
    "icon": "🩺"
  },
  {
    "phrase": "Médicament",
    "translation": "Medicine",
    "pronunciation": "may-dee-kah-MAHN",
    "category": "Health",
    "icon": "💊"
  },
  {
    "phrase": "Douleur",
    "translation": "Pain",
    "pronunciation": "doo-LER",
    "category": "Health",
    "icon": "🤕"
  },
  {
    "phrase": "Fièvre",
    "translation": "Fever",
    "pronunciation": "fyeh-vruh",
    "category": "Health",
    "icon": "🤒"
  },
  {
    "phrase": "Allergie",
    "translation": "Allergy",
    "pronunciation": "ah-lehr-ZHEE",
    "category": "Health",
    "icon": "⚠️"
  },
  {
    "phrase": "Mal de tête",
    "translation": "Headache",
    "pronunciation": "mahl duh TEHT",
    "category": "Health",
    "icon": "🧠"
  },
  {
    "phrase": "Urgence",
    "translation": "Emergency",
    "pronunciation": "ewr-ZHAHNS",
    "category": "Health",
    "icon": "🚑"
  },
  {
    "phrase": "Ordonnance",
    "translation": "Prescription",
    "pronunciation": "ohr-doh-NAHNS",
    "category": "Health",
    "icon": "📋"
  },
  {
    "phrase": "Pansement",
    "translation": "Bandage",
    "pronunciation": "pahn-suh-MAHN",
    "category": "Health",
    "icon": "🩹"
  },
  {
    "phrase": "Santé",
    "translation": "Health",
    "pronunciation": "sahn-TAY",
    "category": "Health",
    "icon": "❤️"
  },
  {
    "phrase": "Vol",
    "translation": "Flight",
    "pronunciation": "vohl",
    "category": "Travel",
    "icon": "🛫"
  },
  {
    "phrase": "Bagage",
    "translation": "Luggage",
    "pronunciation": "bah-GAHZH",
    "category": "Travel",
    "icon": "🧳"
  },
  {
    "phrase": "Réservation",
    "translation": "Reservation",
    "pronunciation": "ray-zehr-vah-SYOHN",
    "category": "Travel",
    "icon": "🛎️"
  },
  {
    "phrase": "Clé",
    "translation": "Key",
    "pronunciation": "klay",
    "category": "Travel",
    "icon": "🔑"
  },
  {
    "phrase": "Chambre",
    "translation": "Room",
    "pronunciation": "shahm-bruh",
    "category": "Travel",
    "icon": "🛏️"
  },
  {
    "phrase": "Porte d'embarquement",
    "translation": "Gate",
    "pronunciation": "pohrt dahm-bahr-kuh-MAHN",
    "category": "Travel",
    "icon": "🚪"
  },
  {
    "phrase": "Plan",
    "translation": "Map",
    "pronunciation": "plahn",
    "category": "Travel",
    "icon": "🗺️"
  },
  {
    "phrase": "Entrée",
    "translation": "Entrance",
    "pronunciation": "ahn-TRAY",
    "category": "Travel",
    "icon": "➡️"
  },
  {
    "phrase": "Sortie",
    "translation": "Exit",
    "pronunciation": "sohr-TEE",
    "category": "Travel",
    "icon": "⬅️"
  },
  {
    "phrase": "Douane",
    "translation": "Customs",
    "pronunciation": "dwahn",
    "category": "Travel",
    "icon": "🛂"
  },
  {
    "phrase": "Carte bancaire",
    "translation": "Credit card",
    "pronunciation": "kahrt bahn-KEHR",
    "category": "Shopping",
    "icon": "💳"
  },
  {
    "phrase": "Espèces",
    "translation": "Cash",
    "pronunciation": "ehs-PEHS",
    "category": "Shopping",
    "icon": "💵"
  },
  {
    "phrase": "Prix",
    "translation": "Price",
    "pronunciation": "pree",
    "category": "Shopping",
    "icon": "🏷️"
  },
  {
    "phrase": "Pas cher",
    "translation": "Cheap",
    "pronunciation": "pah SHEHR",
    "category": "Shopping",
    "icon": "👇"
  },
  {
    "phrase": "Cher",
    "translation": "Expensive",
    "pronunciation": "shehr",
    "category": "Shopping",
    "icon": "💎"
  },
  {
    "phrase": "Réduction",
    "translation": "Discount",
    "pronunciation": "ray-dewk-SYOHN",
    "category": "Shopping",
    "icon": "🏷️"
  },
  {
    "phrase": "Ordinateur portable",
    "translation": "Laptop",
    "pronunciation": "ohr-dee-nah-TUHR pohr-TAH-bluh",
    "category": "Tech",
    "icon": "💻"
  },
  {
    "phrase": "Tablette",
    "translation": "Tablet",
    "pronunciation": "tah-BLEHT",
    "category": "Tech",
    "icon": "📱"
  },
  {
    "phrase": "Clavier",
    "translation": "Keyboard",
    "pronunciation": "klah-VYAY",
    "category": "Tech",
    "icon": "⌨️"
  },
  {
    "phrase": "Souris",
    "translation": "Mouse",
    "pronunciation": "soo-REE",
    "category": "Tech",
    "icon": "🖱️"
  },
  {
    "phrase": "Chargeur",
    "translation": "Charger",
    "pronunciation": "shahr-ZHUHR",
    "category": "Tech",
    "icon": "🔌"
  },
  {
    "phrase": "Câble",
    "translation": "Cable",
    "pronunciation": "KAH-bluh",
    "category": "Tech",
    "icon": "🔌"
  },
  {
    "phrase": "Wi-Fi",
    "translation": "Wi-Fi",
    "pronunciation": "wee-FEE",
    "category": "Tech",
    "icon": "📶"
  },
  {
    "phrase": "E-mail",
    "translation": "Email",
    "pronunciation": "ee-MAYL",
    "category": "Tech",
    "icon": "📧"
  },
  {
    "phrase": "Message",
    "translation": "Message",
    "pronunciation": "meh-SAHZH",
    "category": "Tech",
    "icon": "💬"
  },
  {
    "phrase": "Site web",
    "translation": "Website",
    "pronunciation": "seet WEHB",
    "category": "Tech",
    "icon": "🌐"
  },
  {
    "phrase": "Application",
    "translation": "Application / App",
    "pronunciation": "ah-plee-kah-SYOHN",
    "category": "Tech",
    "icon": "📱"
  },
  {
    "phrase": "Dossier",
    "translation": "Folder",
    "pronunciation": "doh-SYAY",
    "category": "Tech",
    "icon": "📁"
  },
  {
    "phrase": "Caméra",
    "translation": "Camera",
    "pronunciation": "kah-may-RAH",
    "category": "Tech",
    "icon": "📷"
  },
  {
    "phrase": "Microphone",
    "translation": "Microphone",
    "pronunciation": "mee-kroh-FOHN",
    "category": "Tech",
    "icon": "🎙️"
  },
  {
    "phrase": "Écouteurs",
    "translation": "Headphones",
    "pronunciation": "ay-koo-TUHR",
    "category": "Tech",
    "icon": "🎧"
  },
  {
    "phrase": "Imprimante",
    "translation": "Printer",
    "pronunciation": "eem-pree-MAHNT",
    "category": "Tech",
    "icon": "🖨️"
  },
  {
    "phrase": "Rechercher",
    "translation": "Search",
    "pronunciation": "ruh-shehr-SHAY",
    "category": "Tech",
    "icon": "🔍"
  },
  {
    "phrase": "Enregistrer",
    "translation": "Save",
    "pronunciation": "ahn-ruh-zhee-STRAY",
    "category": "Tech",
    "icon": "💾"
  },
  {
    "phrase": "Supprimer",
    "translation": "Delete",
    "pronunciation": "soo-pree-MAY",
    "category": "Tech",
    "icon": "🗑️"
  },
  {
    "phrase": "Envoyer",
    "translation": "Send",
    "pronunciation": "ahn-vwah-YAY",
    "category": "Tech",
    "icon": "📤"
  },
  {
    "phrase": "Télécharger",
    "translation": "Download",
    "pronunciation": "tay-lay-shahr-ZHAY",
    "category": "Tech",
    "icon": "📥"
  },
  {
    "phrase": "Téléverser",
    "translation": "Upload",
    "pronunciation": "tay-lay-vehr-SAY",
    "category": "Tech",
    "icon": "📤"
  },
  {
    "phrase": "En ligne",
    "translation": "Online",
    "pronunciation": "ahn LEEN-yuh",
    "category": "Tech",
    "icon": "🟢"
  },
  {
    "phrase": "Hors ligne",
    "translation": "Offline",
    "pronunciation": "ohr LEEN-yuh",
    "category": "Tech",
    "icon": "⚪"
  },
  {
    "phrase": "Magasin",
    "translation": "Store / Shop",
    "pronunciation": "mah-gah-ZEHN",
    "category": "Shopping",
    "icon": "🏪"
  },
  {
    "phrase": "Acheter",
    "translation": "Buy",
    "pronunciation": "ahsh-TAY",
    "category": "Shopping",
    "icon": "🛍️"
  },
  {
    "phrase": "Vendre",
    "translation": "Sell",
    "pronunciation": "VAHN-druh",
    "category": "Shopping",
    "icon": "🏷️"
  },
  {
    "phrase": "Payer",
    "translation": "Pay",
    "pronunciation": "peh-YAY",
    "category": "Shopping",
    "icon": "💳"
  },
  {
    "phrase": "Carte de crédit",
    "translation": "Credit card",
    "pronunciation": "kahrt duh kray-DEE",
    "category": "Shopping",
    "icon": "💳"
  },
  {
    "phrase": "Bon marché",
    "translation": "Cheap",
    "pronunciation": "bohn mahr-SHAY",
    "category": "Shopping",
    "icon": "🏷️"
  },
  {
    "phrase": "Reçu",
    "translation": "Receipt",
    "pronunciation": "ruh-SOO",
    "category": "Shopping",
    "icon": "🧾"
  },
  {
    "phrase": "Assistance",
    "translation": "Support / Help Desk",
    "pronunciation": "ah-sees-TAHNS",
    "category": "Tech",
    "icon": "💁"
  },
  {
    "phrase": "Ouvrir",
    "translation": "Open",
    "pronunciation": "oo-VREER",
    "category": "Tech",
    "icon": "📂"
  },
  {
    "phrase": "Fermer",
    "translation": "Close",
    "pronunciation": "fehr-MAY",
    "category": "Tech",
    "icon": "✖️"
  },
  {
    "phrase": "Mettre à jour",
    "translation": "Update",
    "pronunciation": "MEH-truh ah zhoor",
    "category": "Tech",
    "icon": "🔄"
  },
  {
    "phrase": "Homme",
    "translation": "Man",
    "pronunciation": "UHM",
    "category": "People",
    "icon": "👨"
  },
  {
    "phrase": "Femme",
    "translation": "Woman",
    "pronunciation": "FAHM",
    "category": "People",
    "icon": "👩"
  },
  {
    "phrase": "Enfant",
    "translation": "Child",
    "pronunciation": "ahn-FAHN",
    "category": "People",
    "icon": "🧒"
  },
  {
    "phrase": "Garçon",
    "translation": "Boy",
    "pronunciation": "gahr-SOHN",
    "category": "People",
    "icon": "👦"
  },
  {
    "phrase": "Fille",
    "translation": "Girl",
    "pronunciation": "FEEY",
    "category": "People",
    "icon": "👧"
  },
  {
    "phrase": "Père",
    "translation": "Father",
    "pronunciation": "PEHR",
    "category": "Family",
    "icon": "👨"
  },
  {
    "phrase": "Mère",
    "translation": "Mother",
    "pronunciation": "MEHR",
    "category": "Family",
    "icon": "👩"
  },
  {
    "phrase": "Lait",
    "translation": "Milk",
    "pronunciation": "LEH",
    "category": "Food",
    "icon": "🥛"
  },
  {
    "phrase": "Viande",
    "translation": "Meat",
    "pronunciation": "vee-AHND",
    "category": "Food",
    "icon": "🥩"
  },
  {
    "phrase": "Poisson",
    "translation": "Fish",
    "pronunciation": "pwah-SOHN",
    "category": "Food",
    "icon": "🐟"
  },
  {
    "phrase": "Légumes",
    "translation": "Vegetables",
    "pronunciation": "lay-GOOM",
    "category": "Food",
    "icon": "🥦"
  },
  {
    "phrase": "Fruits",
    "translation": "Fruits",
    "pronunciation": "FRWEE",
    "category": "Food",
    "icon": "🍎"
  },
  {
    "phrase": "Riz",
    "translation": "Rice",
    "pronunciation": "REE",
    "category": "Food",
    "icon": "🍚"
  },
  {
    "phrase": "Thé",
    "translation": "Tea",
    "pronunciation": "TAY",
    "category": "Food",
    "icon": "🍵"
  },
  {
    "phrase": "Bière",
    "translation": "Beer",
    "pronunciation": "BYEHR",
    "category": "Food",
    "icon": "🍺"
  },
  {
    "phrase": "Vin",
    "translation": "Wine",
    "pronunciation": "VAN",
    "category": "Food",
    "icon": "🍷"
  },
  {
    "phrase": "Sel",
    "translation": "Salt",
    "pronunciation": "SEHL",
    "category": "Food",
    "icon": "🧂"
  },
  {
    "phrase": "Œuf",
    "translation": "Egg",
    "pronunciation": "UHF",
    "category": "Food",
    "icon": "🥚"
  },
  {
    "phrase": "Jus",
    "translation": "Juice",
    "pronunciation": "ZHOO",
    "category": "Food",
    "icon": "🧃"
  },
  {
    "phrase": "Fromage",
    "translation": "Cheese",
    "pronunciation": "froh-MAHZH",
    "category": "Food",
    "icon": "🧀"
  },
  {
    "phrase": "Pomme",
    "translation": "Apple",
    "pronunciation": "PUHM",
    "category": "Food",
    "icon": "🍏"
  },
  {
    "phrase": "Restaurant",
    "translation": "Restaurant",
    "pronunciation": "rehs-toh-RAHN",
    "category": "Places",
    "icon": "🍽️"
  },
  {
    "phrase": "Gare / Station",
    "translation": "Station",
    "pronunciation": "GAHR / stah-SYOHN",
    "category": "Places",
    "icon": "🚉"
  },
  {
    "phrase": "Aéroport",
    "translation": "Airport",
    "pronunciation": "ah-ay-roh-POHR",
    "category": "Places",
    "icon": "✈️"
  },
  {
    "phrase": "Parc",
    "translation": "Park",
    "pronunciation": "PAHRK",
    "category": "Places",
    "icon": "🌳"
  },
  {
    "phrase": "Mer",
    "translation": "Sea",
    "pronunciation": "MEHR",
    "category": "Places",
    "icon": "🌊"
  },
  {
    "phrase": "Route / Chemin",
    "translation": "Road",
    "pronunciation": "ROOT / shuh-MAN",
    "category": "Places",
    "icon": "🛤️"
  },
  {
    "phrase": "Bus",
    "translation": "Bus",
    "pronunciation": "BOOS",
    "category": "Travel",
    "icon": "🚌"
  },
  {
    "phrase": "Taxi",
    "translation": "Taxi",
    "pronunciation": "tahk-SEE",
    "category": "Travel",
    "icon": "🚕"
  },
  {
    "phrase": "Avion",
    "translation": "Airplane",
    "pronunciation": "ah-vee-OHN",
    "category": "Travel",
    "icon": "✈️"
  },
  {
    "phrase": "Billet",
    "translation": "Ticket",
    "pronunciation": "bee-YEH",
    "category": "Travel",
    "icon": "🎫"
  },
  {
    "phrase": "Passeport",
    "translation": "Passport",
    "pronunciation": "pahs-POHR",
    "category": "Travel",
    "icon": "🛂"
  },
  {
    "phrase": "Bateau",
    "translation": "Boat",
    "pronunciation": "bah-TOH",
    "category": "Travel",
    "icon": "⛵"
  },
  {
    "phrase": "Table",
    "translation": "Table",
    "pronunciation": "TAH-bluh",
    "category": "Home",
    "icon": "svg:table"
  },
  {
    "phrase": "Chaise",
    "translation": "Chair",
    "pronunciation": "SHEHZ",
    "category": "Home",
    "icon": "🪑"
  },
  {
    "phrase": "Porte",
    "translation": "Door",
    "pronunciation": "POHRT",
    "category": "Home",
    "icon": "🚪"
  },
  {
    "phrase": "Fenêtre",
    "translation": "Window",
    "pronunciation": "fuh-NEH-truh",
    "category": "Home",
    "icon": "🪟"
  },
  {
    "phrase": "Sac",
    "translation": "Bag",
    "pronunciation": "SAHK",
    "category": "Home",
    "icon": "👜"
  },
  {
    "phrase": "Vêtements",
    "translation": "Clothes",
    "pronunciation": "veht-MAHN",
    "category": "Home",
    "icon": "👕"
  },
  {
    "phrase": "Chaussures",
    "translation": "Shoes",
    "pronunciation": "shoh-SYOOR",
    "category": "Home",
    "icon": "👟"
  },
  {
    "phrase": "Parapluie",
    "translation": "Umbrella",
    "pronunciation": "pah-rah-PLWEE",
    "category": "Home",
    "icon": "☂️"
  },
  {
    "phrase": "Photo",
    "translation": "Photo",
    "pronunciation": "foh-TOH",
    "category": "Home",
    "icon": "📷"
  },
  {
    "phrase": "Carte",
    "translation": "Card",
    "pronunciation": "KAHRT",
    "category": "Shopping",
    "icon": "💳"
  },
  {
    "phrase": "Chien",
    "translation": "Dog",
    "pronunciation": "SHYAN",
    "category": "Nature",
    "icon": "🐶"
  },
  {
    "phrase": "Chat",
    "translation": "Cat",
    "pronunciation": "SHAH",
    "category": "Nature",
    "icon": "🐱"
  },
  {
    "phrase": "Oiseau",
    "translation": "Bird",
    "pronunciation": "wah-ZOH",
    "category": "Nature",
    "icon": "🐦"
  },
  {
    "phrase": "Lune",
    "translation": "Moon",
    "pronunciation": "LOON",
    "category": "Nature",
    "icon": "🌙"
  },
  {
    "phrase": "Étoile",
    "translation": "Star",
    "pronunciation": "ay-TWAHL",
    "category": "Nature",
    "icon": "⭐"
  },
  {
    "phrase": "Fleur",
    "translation": "Flower",
    "pronunciation": "FLUHR",
    "category": "Nature",
    "icon": "🌸"
  },
  {
    "phrase": "Arbre",
    "translation": "Tree",
    "pronunciation": "AHR-bruh",
    "category": "Nature",
    "icon": "🌲"
  },
  {
    "phrase": "Bon",
    "translation": "Good",
    "pronunciation": "BOHN",
    "category": "Descriptions",
    "icon": "👍"
  },
  {
    "phrase": "Mauvais",
    "translation": "Bad",
    "pronunciation": "moh-VEH",
    "category": "Descriptions",
    "icon": "👎"
  },
  {
    "phrase": "Rapide",
    "translation": "Fast / Quick",
    "pronunciation": "rah-PEED",
    "category": "Descriptions",
    "icon": "⚡"
  },
  {
    "phrase": "Lent",
    "translation": "Slow",
    "pronunciation": "LAHN",
    "category": "Descriptions",
    "icon": "🐢"
  },
  {
    "phrase": "Heureux",
    "translation": "Happy",
    "pronunciation": "uh-RUH",
    "category": "Descriptions",
    "icon": "😊"
  },
  {
    "phrase": "Prêt",
    "translation": "Ready",
    "pronunciation": "PREH",
    "category": "Descriptions",
    "icon": "✅"
  },
  {
    "phrase": "Ouvert",
    "translation": "Open",
    "pronunciation": "oo-VEHR",
    "category": "Descriptions",
    "icon": "🟢"
  },
  {
    "phrase": "Fermé",
    "translation": "Closed",
    "pronunciation": "fehr-MAY",
    "category": "Descriptions",
    "icon": "🔴"
  },
  {
    "phrase": "Lundi",
    "translation": "Monday",
    "pronunciation": "luhn-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Mardi",
    "translation": "Tuesday",
    "pronunciation": "mahr-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Mercredi",
    "translation": "Wednesday",
    "pronunciation": "mehr-kruh-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Jeudi",
    "translation": "Thursday",
    "pronunciation": "zhuh-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Vendredi",
    "translation": "Friday",
    "pronunciation": "vahn-druh-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Samedi",
    "translation": "Saturday",
    "pronunciation": "sahm-DEE",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Dimanche",
    "translation": "Sunday",
    "pronunciation": "dee-MAHNSH",
    "category": "Calendar",
    "icon": "📅"
  },
  {
    "phrase": "Semaine",
    "translation": "Week",
    "pronunciation": "suh-MEHN",
    "category": "Calendar",
    "icon": "🗓️"
  },
  {
    "phrase": "Mois",
    "translation": "Month",
    "pronunciation": "MWAH",
    "category": "Calendar",
    "icon": "📆"
  },
  {
    "phrase": "An / Année",
    "translation": "Year",
    "pronunciation": "AHN / ah-NAY",
    "category": "Calendar",
    "icon": "🎆"
  },
  {
    "phrase": "Frère",
    "translation": "Brother",
    "pronunciation": "FREHR",
    "category": "Family",
    "icon": "👦"
  },
  {
    "phrase": "Sœur",
    "translation": "Sister",
    "pronunciation": "SUHR",
    "category": "Family",
    "icon": "👧"
  },
  {
    "phrase": "Œil",
    "translation": "Eye",
    "pronunciation": "UHY",
    "category": "Health",
    "icon": "👁️"
  },
  {
    "phrase": "Nez",
    "translation": "Nose",
    "pronunciation": "NAY",
    "category": "Health",
    "icon": "👃"
  },
  {
    "phrase": "Joue",
    "translation": "Cheek",
    "pronunciation": "ZHOO",
    "category": "Health",
    "icon": "😊"
  },
  {
    "phrase": "Cœur",
    "translation": "Heart",
    "pronunciation": "KUHR",
    "category": "Health",
    "icon": "❤️"
  },
  {
    "phrase": "Voix",
    "translation": "Voice",
    "pronunciation": "VWAH",
    "category": "Health",
    "icon": "🗣️"
  },
  {
    "phrase": "Tasse",
    "translation": "Cup",
    "pronunciation": "TAHS",
    "category": "Food",
    "icon": "☕"
  },
  {
    "phrase": "Verre",
    "translation": "Glass (cup)",
    "pronunciation": "VEHR",
    "category": "Food",
    "icon": "🥛"
  },
  {
    "phrase": "Bouilloire",
    "translation": "Kettle",
    "pronunciation": "boo-YWAHR",
    "category": "Food",
    "icon": "🫖"
  },
  {
    "phrase": "Huile",
    "translation": "Oil",
    "pronunciation": "WEEL",
    "category": "Food",
    "icon": "🫒"
  },
  {
    "phrase": "Citron",
    "translation": "Lemon",
    "pronunciation": "see-TROHN",
    "category": "Food",
    "icon": "🍋"
  },
  {
    "phrase": "Orange",
    "translation": "Orange",
    "pronunciation": "oh-RAHNZH",
    "category": "Food",
    "icon": "🍊"
  },
  {
    "phrase": "Yaourt",
    "translation": "Yogurt",
    "pronunciation": "yah-OORT",
    "category": "Food",
    "icon": "🥣"
  },
  {
    "phrase": "Glace",
    "translation": "Ice",
    "pronunciation": "GLAHS",
    "category": "Food",
    "icon": "🧊"
  },
  {
    "phrase": "Amour",
    "translation": "Love",
    "pronunciation": "ah-MOOR",
    "category": "Essentials",
    "icon": "❤️"
  },
  {
    "phrase": "Nom",
    "translation": "Name",
    "pronunciation": "NOHN",
    "category": "Essentials",
    "icon": "🏷️"
  },
  {
    "phrase": "Silencieux / Calme",
    "translation": "Quiet",
    "pronunciation": "see-lahn-SYUH / KAHM",
    "category": "Essentials",
    "icon": "🤫"
  },
  {
    "phrase": "Lumière",
    "translation": "Light",
    "pronunciation": "loo-MYEHR",
    "category": "Essentials",
    "icon": "💡"
  },
  {
    "phrase": "Île",
    "translation": "Island",
    "pronunciation": "EEL",
    "category": "Travel",
    "icon": "🏝️"
  },
  {
    "phrase": "Qui",
    "translation": "Who",
    "pronunciation": "KEE",
    "category": "Questions",
    "icon": "❓"
  },
  {
    "phrase": "Quoi",
    "translation": "What",
    "pronunciation": "KWAH",
    "category": "Questions",
    "icon": "❓"
  },
  {
    "phrase": "Où",
    "translation": "Where",
    "pronunciation": "OO",
    "category": "Questions",
    "icon": "📍"
  },
  {
    "phrase": "Quand",
    "translation": "When",
    "pronunciation": "KAHN",
    "category": "Questions",
    "icon": "🕒"
  },
  {
    "phrase": "Pourquoi",
    "translation": "Why",
    "pronunciation": "poor-KWAH",
    "category": "Questions",
    "icon": "💡"
  },
  {
    "phrase": "Comment",
    "translation": "How",
    "pronunciation": "kuh-MAHN",
    "category": "Questions",
    "icon": "⚙️"
  },
  {
    "phrase": "Combien",
    "translation": "How much / How many",
    "pronunciation": "kohm-BYEHN",
    "category": "Questions",
    "icon": "💰"
  },
  {
    "phrase": "Métro",
    "translation": "Subway / Metro",
    "pronunciation": "meh-TROH",
    "category": "Travel",
    "icon": "🚇"
  },
  {
    "phrase": "Place",
    "translation": "Square / Plaza",
    "pronunciation": "PLAHS",
    "category": "Places",
    "icon": "🏛️"
  },
  {
    "phrase": "Bureau de poste",
    "translation": "Post office",
    "pronunciation": "byoo-ROH duh POHST",
    "category": "Places",
    "icon": "🏤"
  },
  {
    "phrase": "Police",
    "translation": "Police",
    "pronunciation": "poh-LEES",
    "category": "Places",
    "icon": "👮"
  },
  {
    "phrase": "Nous",
    "translation": "We",
    "pronunciation": "NOO",
    "category": "People",
    "icon": "👥"
  },
  {
    "phrase": "Visa",
    "translation": "Visa",
    "pronunciation": "vee-ZAH",
    "category": "Travel",
    "icon": "🛂"
  },
  {
    "phrase": "Chaussure",
    "translation": "Shoe / Shoes",
    "pronunciation": "shoh-SYOOR",
    "category": "Essentials",
    "icon": "👞"
  },
  {
    "phrase": "Fruit",
    "translation": "Fruit",
    "pronunciation": "FRWEE",
    "category": "Food",
    "icon": "🍎"
  },
  {
    "phrase": "Horloge",
    "translation": "Clock / Watch",
    "pronunciation": "ohr-LOHZH",
    "category": "Essentials",
    "icon": "⏰"
  },
  {
    "phrase": "Raisin",
    "translation": "Grape",
    "pronunciation": "reh-ZAN",
    "category": "Food",
    "icon": "🍇"
  },
  {
    "phrase": "Heure",
    "translation": "Hour",
    "pronunciation": "UHR",
    "category": "Time",
    "icon": "⏳"
  },
  {
    "phrase": "Minute",
    "translation": "Minute",
    "pronunciation": "mee-NOOT",
    "category": "Time",
    "icon": "⏱️"
  },
  {
    "phrase": "Seconde",
    "translation": "Second",
    "pronunciation": "suh-GOHND",
    "category": "Time",
    "icon": "⚡"
  },
  {
    "phrase": "Tôt",
    "translation": "Early",
    "pronunciation": "TOH",
    "category": "Time",
    "icon": "🌅"
  },
  {
    "phrase": "En retard",
    "translation": "Late",
    "pronunciation": "ahn ruh-TAHR",
    "category": "Time",
    "icon": "🌙"
  },
  {
    "phrase": "Maintenant",
    "translation": "Now",
    "pronunciation": "man-tuh-NAHN",
    "category": "Time",
    "icon": "⏰"
  },
  {
    "phrase": "Violet",
    "translation": "Purple",
    "pronunciation": "vyoh-LEH",
    "category": "Colors",
    "icon": "🟣"
  },
  {
    "phrase": "Rose",
    "translation": "Pink",
    "pronunciation": "ROHZ",
    "category": "Colors",
    "icon": "🌸"
  },
  {
    "phrase": "Gris",
    "translation": "Gray",
    "pronunciation": "GREE",
    "category": "Colors",
    "icon": "🔘"
  },
  {
    "phrase": "Apprendre",
    "translation": "To learn",
    "pronunciation": "ah-PRAHN-druh",
    "category": "Verbs",
    "icon": "📚"
  },
  {
    "phrase": "Parler",
    "translation": "To speak",
    "pronunciation": "pahr-LAY",
    "category": "Verbs",
    "icon": "🗣️"
  },
  {
    "phrase": "Manger",
    "translation": "To eat",
    "pronunciation": "mahn-ZHAY",
    "category": "Verbs",
    "icon": "🍽️"
  },
  {
    "phrase": "Boire",
    "translation": "To drink",
    "pronunciation": "BWAHR",
    "category": "Verbs",
    "icon": "🥤"
  },
  {
    "phrase": "Aller",
    "translation": "To go",
    "pronunciation": "ah-LAY",
    "category": "Verbs",
    "icon": "🚶"
  },
  {
    "phrase": "Venir",
    "translation": "To come",
    "pronunciation": "vuh-NEER",
    "category": "Verbs",
    "icon": "🚶‍♂️"
  },
  {
    "phrase": "Comprendre",
    "translation": "To understand",
    "pronunciation": "kohm-PRAHN-druh",
    "category": "Verbs",
    "icon": "💡"
  },
  {
    "phrase": "Savoir",
    "translation": "To know",
    "pronunciation": "sah-VWAHR",
    "category": "Verbs",
    "icon": "🧠"
  },
  {
    "phrase": "Aider",
    "translation": "To help",
    "pronunciation": "ay-DAY",
    "category": "Verbs",
    "icon": "🤝"
  },
  {
    "phrase": "Travailler",
    "translation": "To work",
    "pronunciation": "trah-vah-YAY",
    "category": "Verbs",
    "icon": "💼"
  },
  {
    "phrase": "Vouloir",
    "translation": "To want",
    "pronunciation": "voo-LWAHR",
    "category": "Verbs",
    "icon": "💭"
  }
];

const frenchData: AppData = {
  alphabet,
  basicPhrases,
  numbers,
  time,
  commonWords,
};

export default frenchData;
