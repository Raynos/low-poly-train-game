export const PHRASES = {
  "train": [
    "Train.",
    "Little train.",
    "Here is the train."
  ],
  "go": [
    "Go!",
    "Train goes.",
    "Go, little train!"
  ],
  "stop": [
    "Stop.",
    "Train stops.",
    "The train has stopped."
  ],
  "tree": [
    "Tree.",
    "Green tree.",
    "A big green tree."
  ],
  "river": [
    "Water.",
    "Blue water.",
    "The water flows."
  ],
  "sheep": [
    "Sheep.",
    "Hello, sheep.",
    "The sheep says baa."
  ],
  "bridge": [
    "Bridge.",
    "Over the bridge.",
    "We cross the bridge."
  ],
  "station": [
    "Station.",
    "At the station.",
    "Hello! Come aboard."
  ],
  "orchard": [
    "Apple.",
    "Pick an apple.",
    "Put the apple in."
  ],
  "passenger": [
    "Hello!",
    "Hello, friend.",
    "Where will you sit?"
  ],
  "seat": [
    "In.",
    "Sit down.",
    "Sit in the train."
  ],
  "full": [
    "Full.",
    "All aboard!",
    "Our train is full."
  ],
  "apples": [
    "Apples.",
    "Three apples.",
    "Our basket is full."
  ],
  "please": [
    "Please.",
    "Apple, please.",
    "An apple, please."
  ],
  "thanks": [
    "Thanks.",
    "Thank you.",
    "Thank you for helping."
  ],
  "help": [
    "Help.",
    "Help, please.",
    "Can you help me?"
  ],
  "more": [
    "More.",
    "More, please.",
    "More apples, please."
  ],
  "sorry": [
    "Sorry.",
    "Sorry, teddy.",
    "Sorry. I can help."
  ],
  "turn": [
    "Turn.",
    "My turn.",
    "Now it is your turn."
  ],
  "bye": [
    "Bye!",
    "Bye, friends.",
    "See you next time."
  ]
} as const;
export type Word = keyof typeof PHRASES;
