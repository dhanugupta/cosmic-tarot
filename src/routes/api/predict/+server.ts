import { json } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore
import { GeneratePrompt_default } from "../../../lib/components/prompts/GeneratePrompt_default.ts";
import { env } from "$env/dynamic/private";
const GEMINI_API_KEY = env.GEMINI_API_KEY;
// @ts-ignore
export async function POST({ request }) {
  const { prompt } = await request.json();
  const promptText = GeneratePrompt_default({
    userName: prompt.userName,
    currentMood: prompt.currentMood,
    currentContext: prompt.currentContext,
    pastCard: prompt.past,
    presentCard: prompt.present,
    futureCard: prompt.future,
  });
  const responseModel = {
    text:
      "{\n" +
      '"greeting": "Dear hhu, while you navigate this season of Melancholy, I invite you on a journey of introspection and empowerment through these tarot cards. Their messages will illuminate your path and provide guidance for the future.",\n' +
      '"summary": "Your cards suggest a powerful interplay between past leadership, current joy, and a future grounded in practicality. Embrace the balance of these forces to unlock your full potential.",\n' +
      '"past": {\n' +
      '"card": "King of Wands",\n' +
      '"interpretation": "Your past is marked by the King of Wands, symbolizing strong leadership, ambition, and a pioneering spirit. These qualities have shaped your path and laid the foundation for your present endeavors."\n' +
      "},\n" +
      '"present": {\n' +
      '"card": "Three of Cups",\n' +
      '"interpretation": "The present Three of Cups brings a sense of celebration, joy, and camaraderie. Nurture your connections, embrace moments of laughter, and find solace in the support of loved ones. This card encourages you to savor the sweetness of the present."\n' +
      "},\n" +
      '"future": {\n' +
      '"card": "Queen of Pentacles (Reversed)",\n' +
      '"interpretation": "Looking ahead, the reversed Queen of Pentacles suggests a need to re-evaluate your relationship with stability, security, and self-worth. Release any limiting beliefs or patterns that hinder your ability to manifest abundance. This card invites you to ground yourself in practical, nourishing actions that support your well-being."\n' +
      "},\n" +
      '"combined_meaning": "The journey from your assertive past to your joyful present leads to a future where you can redefine stability and abundance. Trust your intuition, embrace opportunities for growth, and take practical steps towards creating a fulfilling life. Let go of what no longer serves you and focus on building a solid foundation for the future.",\n' +
      '"closing_message": "hhu, remember that you possess the strength, joy, and wisdom to navigate any challenge. As you move forward, stay grounded, celebrate your successes, and trust in your ability to manifest your dreams. The cards are with you, and so am I."\n' +
      "}",
  };

  try {
    return json(responseModel);
    /*const API_KEY = GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const result = await model.generateContent(promptText);

        const response = result.response;
        const candidates = response.candidates;

        if (candidates && candidates.length > 0) {
            const contentParts = candidates[0].content.parts;
            console.log(contentParts)

            const generatedText = contentParts.map(part => part.text).join(' ');
            const responseData = {text: generatedText};
            return json(responseData);
        } else {
            return json({ error: 'No content generated.' }, { status: 500 });
        }*/
  } catch (error) {
    console.log(error);
    return json({ error: "Failed to fetch reading." }, { status: 500 });
  }
}
