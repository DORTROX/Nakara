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
        story: {
          select: {
            id: true,
            storyName: true,
            theme: true,
            profile: true,
            chapters: {
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
              select: {
                createdAt: true,
                title: true,
              },
            },
          },
        },
        User: {
          select: {
            user_profile: true,
          },
        },
      },
    });
    console.log(stories[0].story.chapters);
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetStories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = 10;
  const { page = 0 } = req.query;
  const skip = Number(page) * Number(limit);
  const take = Number(limit);

  try {
    const stories = await prisma.storyMetadata.findMany({
      skip: skip,
      take: take,
      select: {
        id: true,
        storyName: true,
        profile: true,
        theme: true,
        chapters: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
            title: true,
          },
        },
        User: {
          select: {
            user_profile: true,
          },
        },
      },
    });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const story = await prisma.storyMetadata.findUnique({
      where: {
        id: id,
      },
      select: {
        profile: true,
        storyName: true,
        theme: true,
        characterName: true,
        ListedStory: true,
        chapters: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            bet: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        User: {
          select: {
            user_profile: true,
            username: true,
            bio: true,
            title: true,
            walletAddress: true,
            _count: {
              select: {
                metadata: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(story);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetStoryChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const story = await prisma.chapter.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        bet: {
          select: {
            id: true,
            ques: true,
            options: true,
            amount: true,
            createdAt: true,
            ended: true,
            responses: {
              where: {
                address: req.user?.wallet,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(story);
  } catch {
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
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: req.user?.wallet,
      },
    });
    const story = await prisma.storyMetadata.findUnique({
      where: {
        id: id,
      },
    });

    await prisma.listedStory.create({
      data: {
        owner: user?.id as string,
        storyId: story?.id as string,
        pricing: pricing,
      },
    });

    res.status(200).json({ message: "Story listed successfully" });
  } catch  (err){
    console.log(err)
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// #HIMATODO: Make payment and once payment made this will alot the owner ship (add verification here cuz anyone can use it right now)
export const BuyStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const walletAddress = req.user?.wallet;

  try {
    const story = await prisma.storyMetadata.findUnique({
      where: {
        id: id,
      },
      select: {
        ListedStory: {
          select: {
            id: true,
          }
        }
      }
    });

    if (!story) {
      res.status(400).json({ message: "Invalid story id" });
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
        id: id,
      },
      data: {
        ownerId: user.id,
      },
    });

    await prisma.listedStory.delete({
      where: {
        id: story.ListedStory?.id as string,
      },
    });

    res.status(200).json({ message: "Story bought successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const PlaceBet = async (req: Request, res: Response): Promise<void> => {
  const { betId, option } = req.body;
  const walletAddress = req.user?.wallet;
  const bet = await prisma.bet.findUnique({
    where: {
      id: betId,
    },
    include: {
      responses: {
        where: {
          address: walletAddress as string,
        },
      },
    },
  });
  if (bet && bet.responses?.length > 0) {
    res.status(400).json({ message: "You have already placed a bet" });
    return;
  }
  const betOptions = JSON.parse(bet?.options as string);
  const isCorrectOption =
    betOptions?.some(
      (opt: any) => opt.correct === true && opt.answer === option
    ) ?? false;
  await prisma.betResponse.create({
    data: {
      betId: betId,
      address: walletAddress as string,
      correct: isCorrectOption,
    },
  });

  res.status(200).json({ message: "Bet placed successfully" });
};
