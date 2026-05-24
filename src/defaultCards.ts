import { AACCard, Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'quick', englishName: 'Quick & Social', hindiName: 'आम बातचीत', color: 'bg-pink-100 text-pink-900 border-pink-200', emoji: '💬' },
  { id: 'verbs', englishName: 'Actions', hindiName: 'काम / क्रियाएँ', color: 'bg-green-100 text-green-900 border-green-200', emoji: '🏃' },
  { id: 'nouns', englishName: 'Things & Food', hindiName: 'चीज़ें और भोजन', color: 'bg-orange-100 text-orange-900 border-orange-200', emoji: '🍎' },
  { id: 'feelings', englishName: 'Feelings & Body', hindiName: 'भावनाएँ और शरीर', color: 'bg-blue-100 text-blue-900 border-blue-200', emoji: '😊' },
  { id: 'people', englishName: 'People', hindiName: 'लोग', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', emoji: '👨‍👩‍👧' },
  { id: 'places', englishName: 'Places', hindiName: 'जगहें', color: 'bg-teal-100 text-teal-900 border-teal-200', emoji: '🏠' },
];

export const DEFAULT_CARDS: AACCard[] = [
  // --- QUICK & SOCIAL (Pink, standard ID format 'q-*') ---
  {
    id: 'q-yes',
    englishLabel: 'Yes',
    hindiLabel: 'हाँ',
    englishSpeech: 'Yes',
    hindiSpeech: 'हाँ',
    emoji: '👍',
    category: 'quick',
    color: '#FBCFE8', // bg-pink-200
    isVisible: true
  },
  {
    id: 'q-no',
    englishLabel: 'No',
    hindiLabel: 'नहीं',
    englishSpeech: 'No',
    hindiSpeech: 'नहीं',
    emoji: '👎',
    category: 'quick',
    color: '#FBCFE8',
    isVisible: true
  },
  {
    id: 'q-help',
    englishLabel: 'Help',
    hindiLabel: 'मदद',
    englishSpeech: 'Please help me',
    hindiSpeech: 'कृपया मेरी मदद कीजिए',
    emoji: '🆘',
    category: 'quick',
    color: '#F9A8D4', // darker pink for high urgency
    isVisible: true
  },
  {
    id: 'q-stop',
    englishLabel: 'Stop',
    hindiLabel: 'रुकिए',
    englishSpeech: 'Stop',
    hindiSpeech: 'रुक जाइए',
    emoji: '🛑',
    category: 'quick',
    color: '#FBCFE8',
    isVisible: true
  },
  {
    id: 'q-more',
    englishLabel: 'More',
    hindiLabel: 'और',
    englishSpeech: 'More',
    hindiSpeech: 'मुझे और चाहिए',
    emoji: '➕',
    category: 'quick',
    color: '#FBCFE8',
    isVisible: true
  },
  {
    id: 'q-thankyou',
    englishLabel: 'Thank you',
    hindiLabel: 'धन्यवाद',
    englishSpeech: 'Thank you',
    hindiSpeech: 'धन्यवाद',
    emoji: '🙏',
    category: 'quick',
    color: '#FBCFE8',
    isVisible: true
  },
  {
    id: 'q-please',
    englishLabel: 'Please',
    hindiLabel: 'कृपया',
    englishSpeech: 'Please',
    hindiSpeech: 'कृपया',
    emoji: '🥺',
    category: 'quick',
    color: '#FBCFE8',
    isVisible: true
  },

  // --- ACTIONS/VERBS (Green, standard ID format 'v-*') ---
  {
    id: 'v-eat',
    englishLabel: 'Eat',
    hindiLabel: 'खाना',
    englishSpeech: 'I want to eat',
    hindiSpeech: 'मुझे खाना खाना है',
    emoji: '🍕',
    category: 'verbs',
    color: '#BBF7D0', // bg-green-200
    isVisible: true
  },
  {
    id: 'v-drink',
    englishLabel: 'Drink',
    hindiLabel: 'पीना',
    englishSpeech: 'I want to drink water',
    hindiSpeech: 'मुझे पानी पीना है',
    emoji: '🥤',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-play',
    englishLabel: 'Play',
    hindiLabel: 'खेलना',
    englishSpeech: 'I want to play',
    hindiSpeech: 'मुझे खेलना है',
    emoji: '🧸',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-sleep',
    englishLabel: 'Sleep',
    hindiLabel: 'सोना',
    englishSpeech: 'I feel sleepy',
    hindiSpeech: 'मुझे सोना है',
    emoji: '🛌',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-toilet',
    englishLabel: 'Go Toilet',
    hindiLabel: 'टॉयलेट',
    englishSpeech: 'I need to go to the toilet',
    hindiSpeech: 'मुझे टॉयलेट जाना है',
    emoji: '🚽',
    category: 'verbs',
    color: '#86EFAC', // slightly more vibrant green for biological urgency
    isVisible: true
  },
  {
    id: 'v-wash',
    englishLabel: 'Wash Hands',
    hindiLabel: 'हाथ धोना',
    englishSpeech: 'I want to wash my hands',
    hindiSpeech: 'मुझे हाथ धोना है',
    emoji: '🧼',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-bath',
    englishLabel: 'Bath',
    hindiLabel: 'नहाना',
    englishSpeech: 'I want to take a bath',
    hindiSpeech: 'मुझे नहाना है',
    emoji: '🛁',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-tv',
    englishLabel: 'Watch TV',
    hindiLabel: 'टीवी देखना',
    englishSpeech: 'I want to watch television',
    hindiSpeech: 'मुझे टीवी देखना है',
    emoji: '📺',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },
  {
    id: 'v-music',
    englishLabel: 'Music',
    hindiLabel: 'गाना सुनना',
    englishSpeech: 'I want to listen to music',
    hindiSpeech: 'मुझे गाना सुनना है',
    emoji: '🎵',
    category: 'verbs',
    color: '#BBF7D0',
    isVisible: true
  },

  // --- THINGS & FOOD/NOUNS (Orange, standard ID format 'n-*') ---
  {
    id: 'n-water',
    englishLabel: 'Water',
    hindiLabel: 'पानी',
    englishSpeech: 'Water',
    hindiSpeech: 'पानी',
    emoji: '💧',
    category: 'nouns',
    color: '#FED7AA', // bg-orange-200
    isVisible: true
  },
  {
    id: 'n-milk',
    englishLabel: 'Milk',
    hindiLabel: 'दूध',
    englishSpeech: 'Milk',
    hindiSpeech: 'दूध',
    emoji: '🥛',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-roti',
    englishLabel: 'Roti',
    hindiLabel: 'रोटी',
    englishSpeech: 'Roti',
    hindiSpeech: 'रोटी',
    emoji: '🫓',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-apple',
    englishLabel: 'Apple',
    hindiLabel: 'सेब',
    englishSpeech: 'Apple',
    hindiSpeech: 'सेब',
    emoji: '🍎',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-banana',
    englishLabel: 'Banana',
    hindiLabel: 'केला',
    englishSpeech: 'Banana',
    hindiSpeech: 'केला',
    emoji: '🍌',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-toy',
    englishLabel: 'Toy Car',
    hindiLabel: 'गाड़ी',
    englishSpeech: 'Toy car',
    hindiSpeech: 'गाड़ी',
    emoji: '🚗',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-book',
    englishLabel: 'Book',
    hindiLabel: 'किताब',
    englishSpeech: 'Book',
    hindiSpeech: 'किताब पढ़ना है',
    emoji: '📖',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-ball',
    englishLabel: 'Ball',
    hindiLabel: 'गेंद',
    englishSpeech: 'Ball',
    hindiSpeech: 'गेंद से खेलना है',
    emoji: '⚽',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },
  {
    id: 'n-tablet',
    englishLabel: 'Tablet',
    hindiLabel: 'टैबलेट',
    englishSpeech: 'Tablet',
    hindiSpeech: 'टैबलेट चाहिए',
    emoji: '📱',
    category: 'nouns',
    color: '#FED7AA',
    isVisible: true
  },

  // --- FEELINGS/STATES (Blue, standard ID format 'f-*') ---
  {
    id: 'f-happy',
    englishLabel: 'Happy',
    hindiLabel: 'खुश',
    englishSpeech: 'I am happy',
    hindiSpeech: 'मैं खुश हूँ',
    emoji: '😊',
    category: 'feelings',
    color: '#BAE6FD', // bg-sky-200
    isVisible: true
  },
  {
    id: 'f-sad',
    englishLabel: 'Sad',
    hindiLabel: 'उदास',
    englishSpeech: 'I feel sad',
    hindiSpeech: 'मुझे उदासी महसूस हो रही है',
    emoji: '😢',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },
  {
    id: 'f-hungry',
    englishLabel: 'Hungry',
    hindiLabel: 'भूख',
    englishSpeech: 'I am hungry',
    hindiSpeech: 'मुझे भूख लगी है',
    emoji: '🤤',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },
  {
    id: 'f-thirsty',
    englishLabel: 'Thirsty',
    hindiLabel: 'प्यास',
    englishSpeech: 'I am thirsty',
    hindiSpeech: 'मुझे प्यास लगी है',
    emoji: '🥵',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },
  {
    id: 'f-tired',
    englishLabel: 'Tired',
    hindiLabel: 'थका हुआ',
    englishSpeech: 'I am tired',
    hindiSpeech: 'मैं थक गया हूँ',
    emoji: '🥱',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },
  {
    id: 'f-angry',
    englishLabel: 'Angry',
    hindiLabel: 'गुस्सा',
    englishSpeech: 'I am angry',
    hindiSpeech: 'मुझे गुस्सा आ रहा है',
    emoji: '😡',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },
  {
    id: 'f-pain',
    englishLabel: 'Pain',
    hindiLabel: 'दर्द',
    englishSpeech: 'Something hurts',
    hindiSpeech: 'मुझे दर्द हो रहा है',
    emoji: '🤕',
    category: 'feelings',
    color: '#FECDD3', // soft distress red
    isVisible: true
  },
  {
    id: 'f-scared',
    englishLabel: 'Scared',
    hindiLabel: 'डर',
    englishSpeech: 'I am scared',
    hindiSpeech: 'मुझे डर लग रहा है',
    emoji: '😨',
    category: 'feelings',
    color: '#BAE6FD',
    isVisible: true
  },

  // --- PEOPLE (Yellow, standard ID format 'p-*') ---
  {
    id: 'p-mummy',
    englishLabel: 'Mummy',
    hindiLabel: 'मम्मी',
    englishSpeech: 'Mummy',
    hindiSpeech: 'मम्मी',
    emoji: '👩',
    category: 'people',
    color: '#FEF08A', // bg-yellow-200
    isVisible: true
  },
  {
    id: 'p-papa',
    englishLabel: 'Papa',
    hindiLabel: 'पापा',
    englishSpeech: 'Papa',
    hindiSpeech: 'पापा',
    emoji: '👨',
    category: 'people',
    color: '#FEF08A',
    isVisible: true
  },
  {
    id: 'p-me',
    englishLabel: 'Me',
    hindiLabel: 'मैं',
    englishSpeech: 'Me',
    hindiSpeech: 'मैं खुद',
    emoji: '🧒',
    category: 'people',
    color: '#FEF08A',
    isVisible: true
  },
  {
    id: 'p-teacher',
    englishLabel: 'Teacher',
    hindiLabel: 'टीचर',
    englishSpeech: 'Teacher',
    hindiSpeech: 'टीचर',
    emoji: '👩‍🏫',
    category: 'people',
    color: '#FEF08A',
    isVisible: true
  },
  {
    id: 'p-friend',
    englishLabel: 'Friend',
    hindiLabel: 'दोस्त',
    englishSpeech: 'Friend',
    hindiSpeech: 'दोस्त',
    emoji: '🧑‍🤝‍🧑',
    category: 'people',
    color: '#FEF08A',
    isVisible: true
  },

  // --- PLACES (Teal, standard ID format 'l-*') ---
  {
    id: 'l-home',
    englishLabel: 'Home',
    hindiLabel: 'घर',
    englishSpeech: 'Let us go home',
    hindiSpeech: 'घर चलना है',
    emoji: '🏠',
    category: 'places',
    color: '#99F6E4', // bg-teal-200
    isVisible: true
  },
  {
    id: 'l-school',
    englishLabel: 'School',
    hindiLabel: 'स्कूल',
    englishSpeech: 'School',
    hindiSpeech: 'स्कूल',
    emoji: '🏫',
    category: 'places',
    color: '#99F6E4',
    isVisible: true
  },
  {
    id: 'l-park',
    englishLabel: 'Park',
    hindiLabel: 'पार्क',
    englishSpeech: 'Let us go to the park',
    hindiSpeech: 'पार्क चलना है',
    emoji: '🛝',
    category: 'places',
    color: '#99F6E4',
    isVisible: true
  },
  {
    id: 'l-toilet-place',
    englishLabel: 'Toilet Washroom',
    hindiLabel: 'बाथरूम',
    englishSpeech: 'Washroom',
    hindiSpeech: 'बाथरूम',
    emoji: '🚽',
    category: 'places',
    color: '#99F6E4',
    isVisible: true
  },
];
