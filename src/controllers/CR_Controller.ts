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
  await prisma.metadata.create({
    data: {
      characterName: meta.Name as string,
      profile: meta?.image || ("" as string),
      theme: response.Theme as string,
      storytellingStyle: response.Style as string,
      ownerId: user?.id as string,
    },
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
    res.status(200).json({ message: metadata});

    // if (!metadata) {
    //   res.status(404).json({ message: "Metadata not found" });
    //   return;
    // }
    // const user = await prisma.user.findUnique({
    //   where: { walletAddress: walletAddress },
    // });

    // if (!user) {
    //   res.status(404).json({ message: "User not found" });
    //   return;
    // }

    // // Check if the user is the owner of the metadata
    // if (metadata.ownerId !== user.id) {
    //   res.status(403).json({
    //     message: "Unauthorized: You do not have access to this metadata",
    //   });
    //   return;
    // }

    // const previousChapters = await prisma.chapter.findMany({
    //   where: { metadataId: id },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    //   take: 1,
    //   select: {
    //     title: true,
    //     content: true,
    //   },
    // });
    // const referenceChapters = await prisma.chapter.findMany({
    //   where: { id: { in: chapterIds }, metadataId: id },
    //   select: {
    //     title: true,
    //     content: true,
    //   },
    // });

    // console.log(previousChapters, referenceChapters);

    // // Fetch the user using the wallet address

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         'You are an AI language model tasked with writing the next chapter of a story.\n\n**Story Metadata:**\n- **Title:** {Story Title}\n- **Theme:** {Story Theme}\n- **Storytelling Style:** {Narrative Style}\n- **Temperature:** {Temperature Value}\n\n**Previous Chapters:**\n{Provide summaries or full texts of previous chapters here, ensuring the model has sufficient context.}\n\n**Reference Materials:**\n{Include any additional reference chapters or materials that are relevant to the story\'s development.}\n\n**User Prompt for the New Chapter:**\n{Provide specific guidance or ideas for the upcoming chapter, such as desired plot developments, character interactions, or themes to explore.}\n\n**Instructions:**\nBased on the information provided above, write the next chapter of the story, ensuring consistency with the existing narrative, theme, storytelling style, and the temperature setting.\n- If the Temperature is 0, rely solely on the existing story context and reference materials. Ignore the User Prompt but creatively adapt and incorporate the references to make the content non-guessable while maintaining coherence.\n- If the Temperature is 1, fully incorporate the User Prompt into the new chapter.\n- For Temperature values between 0 and 1, adjust the influence of the User Prompt proportionally while ensuring the references are creatively integrated and remain consistent with the story.\n- Regardless of the Temperature value, avoid straying from the established narrative, theme, and storytelling style.\n- It should be in 250 words max.\n**Output Format:**\nReturn the output in JSON format with the following structure:\n{\n  "title": "{Chapter Title}",\n  "content": "{Chapter Content}"\n}',
    //     },
    //     {
    //       role: "user",
    //       content: `\`\`\`json\n{
    //       "Story Theme": "${metadata.theme}",
    //       "Narrative Style": "${metadata.storytellingStyle}",
    //       "Temperature Value": ${random},
    //       "Previous Chapters": ${previousChapters},
    //       "Reference Materials": ${referenceChapters},
    //       "User Prompt for the New Chapter": ${prompt}
    //       }\`\`\``,
    //     },
    //   ],
    //   response_format: {
    //     type: "json_object",
    //   },
    //   temperature: 0.8,
    //   max_completion_tokens: 4096,
    //   top_p: 1,
    //   frequency_penalty: 0,
    //   presence_penalty: 0,
    // });

    // let response: StoryContent = JSON.parse(
    //   completion.choices[0].message.content || ""
    // );

    // await prisma.chapter.create({
    //   data: {
    //     title: response.title,
    //     content: response.content,
    //     metadataId: id,
    //   },
    // });

    // // IPFS upload metadata of the chapter
    

    // res.status(200).json({ message: "Chapter generated!"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
