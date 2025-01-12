import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  await prisma.user
    .findUnique({
      where: {
        walletAddress: req.user?.wallet,
      },
    })
    .then(async (user) => {
      if (!user) {
        await prisma.user.create({
          data: {
            username: req.user?.username as string,
            walletAddress: req.user?.wallet as string,
          },
        });
        res.status(200).json({ message: "User has been created." });
        return;
      }
      res.status(200).json({ error: "User Already Exist" });
    });
};

export const AddComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { chapterId, comment } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      walletAddress: req.user?.wallet,
    },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await prisma.comment
    .create({
      data: {
        content: comment,
        chapterId: chapterId,
        author: user.id,
      },
    })
    .then(async (resp) => {
      res.status(200).json({ message: "Comment has been added.", data: {...resp, owner: {username: user.username, user_profile: user.user_profile, title: user.title} } });
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
};

export const GetComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { chapterId } = req.params;
  const comments = await prisma.comment.findMany({
    where: {
      chapterId: chapterId,
    },
    take: 10,
    orderBy: {
      date: "desc"
    },
    include: {
      owner: {
        select: {
            username: true,
            user_profile: true,
            title: true,
        }
      }
    },
  });
  res.status(200).json(comments);
};


export const GetProfile = async (
  req: Request,
  res: Response
) => {
  const user = await prisma.user.findUnique({
    where: {
      walletAddress: req.user?.wallet,
    },
    select: {
      user_profile: true,
    }
  });
  
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(user);
}

export const GetUser = async (
  req: Request,
  res: Response
) => {
  const user = await prisma.user.findUnique({
    where: {
      walletAddress: req.user?.wallet,
    },
    select: {
      user_profile: true,
      username: true,
      id: true,
      bio: true,
      title: true,
      premium: true,
      _count: {
        select: {
          metadata: true,
        },
      },
      metadata: {
        select: {
          id: true,
          storyName: true,
          ended: true,
          ListedStory: {
            select: {
              pricing: true,
              storyId: true,
            },
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json(user);
}