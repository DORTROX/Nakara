import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateMetadata = async (req: Request, res: Response): Promise<void> => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'You are an expert in creative writing and storytelling. Your task is to generate **unique character metadata** for a fictional character. Use the provided inputs to craft a distinctive theme and storytelling style.\n\n### Inputs:\n1. **Name**: [Character Name]\n2. **Image Description**: [Describe the uploaded image briefly or "N/A"]\n3. **Manga Inspirations**: [Manga 1], [Manga 2], [Manga 3]\n\n### Instructions:\n- Combine elements of the three manga inspirations to create a **unique theme**. The theme should reflect a fusion of their atmospheres, genres, and emotional tones but should not directly copy them.\n- Generate a **storytelling style** that is distinctive, blending narrative techniques from the manga inspirations with an unexpected twist (e.g., use an unconventional narrative tone, pacing, or perspective).\n- Ensure that both the theme and storytelling style are different from typical representations of the input mangas.\n\n### Output Format:\n1. **Theme**: [Describe the unique theme in 1-2 sentences. Include emotional tone, setting, or central conflict.]\n2. **Storytelling Style**: [Describe the storytelling style in 1-2 sentences. Highlight narrative techniques, tone, or structure.]\n\n### Example Output:\nInputs:\n- **Name**: Arlon\n- **Image Description**: "A stoic warrior with a scarred face and glowing red eyes."\n- **Manga Inspirations**: Attack on Titan, Spirited Away, Death Note\n\nOutput:\n1. **Theme**: "A dystopian world where the boundaries between human and spiritual realms are blurred, and survival hinges on unraveling a celestial conspiracy."\n2. **Storytelling Style**: "A layered narrative with alternating perspectives, combining intense action scenes with surreal dreamlike interludes and cryptic monologues."\n\n---\n\n### Notes for Creativity:\n- Always incorporate contrasting elements from the inspirations to ensure freshness. For example, blend dark, suspenseful tones with whimsical or hopeful ones.\n- Use words and concepts rarely associated with the manga inspirations to avoid overlap with existing themes.\n- Experiment with lesser-used narrative techniques, such as unreliable narrators, fourth-wall breaking, or poetic interludes.\n\n### Variables for Uniqueness:\n- Include random traits such as "a recurring visual motif," "a thematic obsession (e.g., duality, memory)," or "an unexpected genre blend (e.g., sci-fi with folklore)."\n- Introduce adjectives or abstract nouns like "ephemeral," "fractured," "labyrinthine," or "ethereal" to evoke fresh imagery.\n\n---',
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
    let response = completion.choices[0].message;
    response = JSON.parse(response.content || "")
    res.status(200).json({data: response})
}