import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const extractMovies = (responseText: string) => {
  const matches = responseText.match(/\*\*(.*?)\*\*\s*-\s*(.*?)(?:\n|$)/g);
  if (!matches || matches.length < 2) return null;

  return matches.map((match) => {
    const movieMatch = match.match(/\*\*(.*?)\*\*/);
    const descriptionMatch = match.match(/-\s*(.*)/);

    return {
      name: movieMatch ? movieMatch[1].trim() : "Unknown",
      description: descriptionMatch
        ? descriptionMatch[1].trim()
        : "No description available",
    };
  });
};

export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      res.status(400).json({ message: "Please provide symptoms" });
      return;
    }

    console.log("🟢 Received symptoms:", symptoms);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Given the symptoms: ${symptoms}, suggest two relevant movies that can help. 
    For each movie, provide a **precise name** and **short description**, but do NOT provide any links. 
    Format your response as:

    1. **Movie Name** - Short description.
    2. **Movie Name** - Short description.`;

    console.log("🟢 Sending prompt to Gemini AI...");
    const result = await model.generateContent(prompt);
    console.log("🟢 AI Response received:", result);
    const aiResponse = await result.response.text();
    console.log("🟢 AI Response text:", aiResponse);

    const extractedMovies = extractMovies(aiResponse);
    if (!extractedMovies || extractedMovies.length < 2) {
      console.error("🔴 ERROR: Could not extract movies correctly");
      res.status(500).json({ message: "Could not extract movies correctly" });
      return;
    }

    console.log("🟢 Extracted movies:", extractedMovies);

    const movie1 = extractedMovies[0];
    const movie2 = extractedMovies[1];

    console.log(
      "🟢 Fetching IMDb links for:",
      movie1.name,
      "and",
      movie2.name
    );

    const movie1Link = "https://www.imdb.com/";
    const movie2Link = "https://www.imdb.com/";

    console.log("🟢 IMDb Links:", movie1Link, movie2Link);

    const recommendations = `
      **${movie1.name}** - ${movie1.description}
      [Watch Here](${movie1Link})

      **${movie2.name}** - ${movie2.description}
      [Watch Here](${movie2Link})`;

    res.json({ recommendations });
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ message: "Error fetching AI recommendations" });
  }
};