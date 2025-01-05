import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";

export const CreateBedEndJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const timezone = "UTC"; // Change to your preferred timezone
  const schedule = {
    timezone: timezone,
    hours: [12], // Hour in 24-hour format (e.g., 12 = 12 PM)
    mdays: [-1], // Every day of the month
    minutes: [0], // Minute of the hour (e.g., 0 = on the hour)
    months: [-1], // Every month
    wdays: [-1], // Every day of the week
  };
  const payload = {
    job: {
      url: `https://ourHostedUrl.com/${id}`, // url for it here
      enabled: true,
      saveResponses: false,
      schedule: schedule,
      requestMethod: 0, // 0 corresponds to HTTP GET
    },
  };
  try {
    const response = await fetch("https://api.cron-job.org/jobs", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + process.env.CRON_JOB_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorMessage = await response.text(); // Get the error response text
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorMessage}`
      );
    }
    const data = await response.json();
    console.log("Cron job created successfully:", data);
    res.status(200).json({ message: "Cron job created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
