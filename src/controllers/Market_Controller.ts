import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";

export const GetListedStories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = 10;
  const { page = 0 } = req.query;
  const skip = Number(page) * Number(limit);
  const take = Number(limit);

  try {
    const stories = await prisma.listedStory.findMany({
      skip: skip,
      take: take,
      include: {
        story: true,
      },
    });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const listStories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const pricing = req.body.pricing;

  // #HIMATODO: Add user own this check

  try {
    const story = await prisma.storyMetadata.findUnique({
      where: {
        id: id,
      },
    });

    await prisma.listedStory.create({
      data: {
        storyId: story?.id as string,
        pricing: pricing,
      },
    });

    res.status(200).json({ message: "Story listed successfully" });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// #HIMATODO: Make payment and once payment made this will alot the owner ship (add verification here cuz anyone can use it right now)
export const BuyStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const walletAddress = req.user?.wallet;

  try {
    const story = await prisma.listedStory.findUnique({
      where: {
        id: id,
      },
      include: {
        story: true,
      },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.storyMetadata.update({
      where: {
        id: story.story.id,
      },
      data: {
        ownerId: user.id,
      },
    });

    await prisma.listedStory.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Story bought successfully" });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};
