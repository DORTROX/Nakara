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
  "Manga Inspiration": string;
  image: string;
}

interface MetadataContent {
  StoryName: string;
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

interface IPFSResponse {
  Name: string;
  Hash: string;
  Size: string;
}
