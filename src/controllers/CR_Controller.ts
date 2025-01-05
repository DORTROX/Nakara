import { uploadMetadata } from "@/lib/ipfsUpload";
import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateMetadata = async (
  req: Request,
  res: Response
): Promise<void> => {
  const meta: MetadataContentRequest = req.body;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          'You are an expert in creative writing and storytelling. Your task is to generate **unique character metadata** for a fictional character. Use the provided inputs to craft a distinctive theme and storytelling style.\n\n### Inputs:\n1. **Name**: [Character Name]\n2. **Image Description**: [Describe the uploaded image briefly or "N/A"]\n3. **Manga Inspirations**: [Manga 1], [Manga 2], [Manga 3]\n\n### Instructions:\n- Combine elements of the three manga inspirations to create a **unique theme**. The theme should reflect a fusion of their atmospheres, genres, and emotional tones but should not directly copy them.\n- Generate a **storytelling style** that is distinctive, blending narrative techniques from the manga inspirations with an unexpected twist (e.g., use an unconventional narrative tone, pacing, or perspective).\n- Ensure that both the theme and storytelling style are different from typical representations of the input mangas.\n\n### Output Format:\n1. **Theme**: [Describe the unique theme in 1-2 sentences. Include emotional tone, setting, or central conflict.]\n2. **Style**: [Describe the storytelling style in 1-2 sentences. Highlight narrative techniques, tone, or structure.]\n\n### Example Output:\nInputs:\n- **Name**: Arlon\n- **Image Description**: "A stoic warrior with a scarred face and glowing red eyes."\n- **Manga Inspirations**: Attack on Titan, Spirited Away, Death Note\n\nOutput:\n1. **Theme**: "A dystopian world where the boundaries between human and spiritual realms are blurred, and survival hinges on unraveling a celestial conspiracy."\n2. **Style**: "A layered narrative with alternating perspectives, combining intense action scenes with surreal dreamlike interludes and cryptic monologues."\n\n---\n\n### Notes for Creativity:\n- Always incorporate contrasting elements from the inspirations to ensure freshness. For example, blend dark, suspenseful tones with whimsical or hopeful ones.\n- Use words and concepts rarely associated with the manga inspirations to avoid overlap with existing themes.\n- Experiment with lesser-used narrative techniques, such as unreliable narrators, fourth-wall breaking, or poetic interludes.\n\n### Variables for Uniqueness:\n- Include random traits such as "a recurring visual motif," "a thematic obsession (e.g., duality, memory)," or "an unexpected genre blend (e.g., sci-fi with folklore)."\n- Introduce adjectives or abstract nouns like "ephemeral," "fractured," "labyrinthine," or "ethereal" to evoke fresh imagery.\n\n---',
      },
      {
        role: "user",
        content: `\`\`\`json\n${JSON.stringify(req.body)}\n\`\`\``,
      },
    ],
    response_format: {
      type: "json_object",
    },
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let response: MetadataContent = JSON.parse(
    completion.choices[0].message.content || ""
  );
  const user = await prisma.user.findUnique({
    where: {
      walletAddress: req.user?.wallet,
    },
  });
  const newMetadata = await prisma.metadata.create({
    data: {
      storyName: meta.StoryName as string || "Untitled Story",
      characterName: meta.Name as string,
      profile: meta?.image || ("" as string),
      theme: response.Theme as string,
      storytellingStyle: response.Style as string,
      ownerId: user?.id as string,
    },
  });

  await uploadMetadata({
    name: newMetadata?.storyName as string,
    attributes: newMetadata?.storytellingStyle,
    tokenId: newMetadata?.id,
    description: newMetadata.theme,
    image: newMetadata?.profile || "https://4learn.co/wp-content/uploads/woocommerce-placeholder-600x600.png",
  });
  res.status(200).json({ message: "Metadata created!", data: response });
};

export const generateChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const walletAddress = req.user?.wallet;
    const chapterIds: string[] = req.body.chapterIds;
    const random = req.body.random === true ? Math.random() * 0.5 + 0.5 : 1;
    const prompt = req.body.prompt;

    // Fetch the metadata using the id
    const metadata = await prisma.metadata.findUnique({
      where: { id: id },
    });

    if (!metadata) {
      res.status(404).json({ message: "Metadata not found" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the user is the owner of the metadata
    if (metadata.ownerId !== user.id) {
      res.status(403).json({
        message: "Unauthorized: You do not have access to this metadata",
      });
      return;
    }

    const previousChapters = await prisma.chapter.findMany({
      where: { metadataId: id },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      select: {
        title: true,
        content: true,
      },
    });
    const referenceChapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds }, metadataId: id },
      select: {
        title: true,
        content: true,
      },
    });

    console.log(previousChapters, referenceChapters);

    // Fetch the user using the wallet address

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Create an advanced and unique chapter for a story while ensuring it remains aligned with the provided context, regardless of the Temperature setting. Additionally, structure the chapter to include clear plot points and developments that can be utilized by a betting model, depending on the \"Bet\" parameter.\n\nYour role is to craft a cohesive and engaging continuation based on the provided context, maintaining the established tone, theme, and storytelling style, ensuring uniqueness even if the Temperature is set to 0, while also accommodating the \"Bet\" parameter.\n\nStory Metadata:\n\nTitle: {Provide the story's title here}\n\nTheme: {Define the story's central theme, e.g., \"redemption,\" \"adventure,\" \"betrayal\"}\n\nStorytelling Style: {Specify the narrative style, e.g., \"third-person limited,\" \"omniscient narrator,\" \"first-person introspection\"}\n\nTemperature: {Define creativity/consistency balance: 0 for strict consistency, 1 for maximum creativity}\n\nBet: {True or False - Determines if the chapter should include guessable plot points based on the previous chapter.}\n\nPrevious Chapters Summary:\n{Provide concise summaries or full texts of the previous chapters. Ensure the content establishes sufficient context for the new chapter. Include critical character arcs, plot points, and conflicts.}\n\nReference Materials:\n{Include any additional resources or materials critical to story development, such as character profiles, world-building notes, or thematic inspirations.}\n\nUser Prompt for the New Chapter:\n{Offer specific guidance for the upcoming chapter. Highlight desired plot developments, key character interactions, themes to explore, or stylistic elements to maintain.}\n\nInstructions\n\nUsing the information provided, write the next chapter of the story while maintaining consistency with the established narrative, theme, storytelling style, and the specified Temperature and Bet settings.\n\nUniqueness and Consistency:\n\nEnsure that the chapter is unique, contributing distinctly to the story's progression.\n\nEven if the Temperature is 0, the story should maintain its unique identity within the established context and adhere closely to the User Prompt and reference materials.\n\nTemperature Guidelines:\n\nIf the Temperature is 0, strictly adhere to the existing story context and ensure the content is uniquely aligned with it, preventing deviation.\n\nIf the Temperature is 1, fully embrace the User Prompt, prioritizing creativity and new developments while staying aligned with the narrative tone and style.\n\nFor Temperature values between 0 and 1, balance adherence to the story context and User Prompt proportionally.\n\nBet Guidelines:\n\nIf Bet is True, structure the chapter to include clear, identifiable plot points, character decisions, or thematic elements that allow for guessable developments based on the previous chapter.\n\nEnsure the chapter facilitates the creation of questions like \"What will happen next?\" or \"Why did this character act this way?\" using only the previous chapter for context.\n\nAvoid including resolutions or developments that directly contradict the ability to speculate based on the prior chapter.\n\nFor every chapter where Bet is True, include at least one question with four options, where one is the correct answer, and provide the answer with a boolean flag indicating correctness.\n\nIf Bet is False, focus purely on advancing the narrative without prioritizing guessable elements.\n\nOutput Requirements:\n\nThe chapter should not exceed 250 words.\n\nWrite in the established storytelling style and tone.\n\nAvoid inconsistencies or contradictions with prior chapters and reference materials.\n\nDo not include chapter numbers in the title.\n\nOutput Format\n\nReturn the chapter in JSON format:\n\n```json\n{\n  \"title\": \"{Chapter Title}\",\n  \"content\": \"{Chapter Content}\",\n  \"bet\": {\n    \"question\": \"{Betting question derived from the chapter}\",\n    \"options\": [\n      {\"answer\": \"{Option 1}\", \"correct\": {true/false}},\n      {\"answer\": \"{Option 2}\", \"correct\": {true/false}},\n      {\"answer\": \"{Option 3}\", \"correct\": {true/false}},\n      {\"answer\": \"{Option 4}\", \"correct\": {true/false}}\n    ]\n  }\n}\n```",
        },
        {
          role: "user",
          content: `\`\`\`json\n{
          "Bet": "${req.body.random}"
          "Story Theme": "${metadata.theme}",
          "Narrative Style": "${metadata.storytellingStyle}",
          "Temperature Value": ${random},
          "Previous Chapters": ${previousChapters},
          "Reference Materials": ${referenceChapters},
          "User Prompt for the New Chapter": ${prompt}
          }\`\`\``,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.8,
      max_completion_tokens: 4096,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let response: StoryContent = JSON.parse(
      completion.choices[0].message.content || ""
    );

    const newChapter = await prisma.chapter.create({
      data: {
        title: response.title,
        content: response.content,
        metadataId: id,
      }
    });
    

    if (response.bet) {
      await prisma.bet.create({
        data: {
          ques: response.bet?.question as string,
          options: JSON.stringify(response.bet?.options),
          chapterId: newChapter.id,
        },
      });
    }


    res.status(200).json({ message: "Chapter generated!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
