import { ApiError } from "@/lib/util/apierror";

export class ChatService {
  static async askQuestion(question: string) {
    const pythonApiUrl = process.env.PYTHON_ML_API_URL || "http://localhost:8000";
    
    try {
      const response = await fetch(`${pythonApiUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new ApiError(500, "Failed to communicate with AI Chat service");
      }

      return await response.json();
    } catch (error) {
      throw new ApiError(500, "AI Chat service is currently unavailable");
    }
  }
}