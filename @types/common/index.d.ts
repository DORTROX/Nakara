interface DecodedToken {
  user_id: number;
  eth_address: string;
  edu_username: string;
  iss: string;
  iat: number;
  exp: number;
  aud: string;
  [key: string]: any;
}


interface MetadataContentRequest {
  Name: string;
  StoryName: string;
  "Manga Inspiration": string;
  image: string,
}

interface MetadataContent {
  Theme: string;
  Style: string;
}

interface StoryContent {
  content: string;
  title: string;
  bet?: {
    question: string;
    options: BetOption[];
  };
}

interface BetOption {
  answer: string;
  correct: boolean;
}
