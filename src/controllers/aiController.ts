import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Extract movies from markdown-formatted list
const extractMovies = (responseText: string) => {
  const lines = responseText.split("\n").filter((line) => line.includes("**"));
  const movies = lines.map((line) => {
    const nameMatch = line.match(/\*\*(.*?)\*\*/);
    const descMatch = line.match(/\*\*.*?\*\*\s*-\s*(.*)/);
    return {
      name: nameMatch ? nameMatch[1].trim() : "Unknown",
      description: descMatch ? descMatch[1].trim() : "No description available",
    };
  });
  return movies.filter((movie) => movie.name !== "Unknown");
};

// Fetch movie image from OMDb
const fetchMovieImage = async (title: string): Promise<string | null> => {
  try {
    const response = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        t: title,
      },
    });
    return response.data?.Poster !== "N/A" ? response.data?.Poster : null;
  } catch (error) {
    console.error("Image fetch error:", error);
    return null;
  }
};

// Controller
export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { symptoms, count } = req.body;

if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
  res.status(400).json({ message: "Please provide symptoms as a non-empty string." });
  return;
}

if (!count) {
  const match = symptoms.match(/(?:give me|show me|recommend)\s+(\d+)/i);
  if (match) {
    count = parseInt(match[1], 10);
  }
}

// Clamp count between 2 and 5
const recommendationCount = Math.max(2, Math.min(count || 2, 5));


    console.log("🟢 Symptoms (sanitized):", JSON.stringify(symptoms));
    console.log("🟢 Received symptoms:", symptoms);
    console.log("🟢 Recommendation count:", recommendationCount);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are a movie recommendation engine.

The user asked for: "${symptoms}"

🎯 Your task:
- Recommend exactly **${recommendationCount}** movies
- Stick strictly to the requested genre or tone (e.g., action, horror, romantic, etc.)
- Do not include unrelated genres unless explicitly asked

✅ Format:
Respond ONLY in this format:

1. **Movie Title** - movie description.
2. **Movie Title** - movie description.
${recommendationCount >= 3 ? "3. **Movie Title** - movie description." : ""}
${recommendationCount >= 4 ? "4. **Movie Title** - movie description." : ""}
${recommendationCount === 5 ? "5. **Movie Title** - movie description." : ""}

❌ No intro text, no follow-ups, no bonus picks.
❌ No genre mismatches or duplications.
Just the list. Return now.`;

    console.log("🟢 Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    console.log("🟢 AI Response text:\n", aiResponse);

    // Extract and enforce exact count
    const extractedMovies = extractMovies(aiResponse).slice(0, recommendationCount);

    if (extractedMovies.length < recommendationCount) {
      console.warn(
        `⚠️ Gemini returned only ${extractedMovies.length} of ${recommendationCount} requested`
      );
      res.status(500).json({
        message: `Only ${extractedMovies.length} movies returned instead of ${recommendationCount}. Please try again.`,
      });
      return;
    }

    const recommendations = [];

    for (const movie of extractedMovies) {
      const image = await fetchMovieImage(movie.name);
      recommendations.push({
        name: movie.name,
        description: movie.description,
        image: image || "https://via.placeholder.com/300x450?text=No+Image",
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error("❌ AI Recommendation Error:", error);
    res.status(500).json({ message: "Error fetching AI recommendations", error });
  }
};
