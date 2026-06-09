import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Initialize Gemini SDK with custom user-agent for AI Studio telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Local Fallback Sommelier Logic ---
  function getLocalSommelierResponse(userText: string): string {
    const query = userText.toLowerCase();
    
    // 1. Anniversary / Couple / Date / Romantic / Anniversary
    if (query.includes("anniversary") || query.includes("couple") || query.includes("romantic") || query.includes("date") || query.includes("love") || query.includes("husband") || query.includes("wife")) {
      return `Namaste and Aadab, Dear Patron! 🌹\n\nFor a grand celebration of your love, I have designed an opulent, luxurious feast fit for royalty. Here is my customized menu recommendation:\n\n` +
        `✦ **Appetizer:** *Murg Malai Kebab (₹380)* - boneless chicken chunks steeped in heavy cardamom cream, grated cheese, and mild spices, grilled to melt-in-mouth perfection.\n` +
        `✦ **Main Course:** *Grand Royal Butter Chicken (₹450)* - tender coal-smoked chicken simmered in rich cream and tomato gravy, paired with our buttery, hand-stretched *Garlic Naan (₹90)*.\n` +
        `✦ **Dessert:** *Rose Cardamom Gulab Jamun (₹150)* - golden milk solids soaked in warm rosewater syrup, presenting a floral and sweet finale.\n\n` +
        `🍷 **Sommelier's Note:** I suggest mopping up the luxurious gravy with the hot garlic naan, and pairing the mains with a soothing *Mango Lassi* to balance the imperial spices. May your anniversary be as splendid as the Taj!`;
    }
    
    // 2. Spicy / Punjabi / Fire / Dhaba
    if (query.includes("spicy") || query.includes("punjabi") || query.includes("dhaba") || query.includes("fire") || query.includes("hot")) {
      return `Namaste and Aadab! 🔥\n\nIf it is robust rustic spices and fiery flavors you seek, our clay oven Punjabi kitchen is ready for you! Here is a menu that will dance on your palate:\n\n` +
        `✦ **Main:** *Amritsari Spicy Butter Chicken (₹420)* or *Dhaba style Kadhai Paneer (₹360)* - cooked with crushed coriander seeds and fiery red chilies in a heavy iron wok.\n` +
        `✦ **Bread:** Pair with *Sarson Ka Saag & Makki Roti (₹310)* or our hot *Amritsari Stuffed potato Kulcha*.\n` +
        `✦ **Dessert:** Cleanse the palate with *Desi Ghee Moong Dal Halwa (₹140)* - rich, sweet, and slow-roasted for hours in pure ghee.\n\n` +
        `🍷 **Sommelier's Note:** To handle the fiery clay oven spices, keep a glass of sweet lassi by your side, and let the rich moong dal halwa soothe your taste buds at the end!`;
    }

    // 3. Vegetarian / Veg / Green
    if (query.includes("vegetarian") || query.includes("veg") || query.includes("pure veg") || query.includes("no meat")) {
      return `Namaste, Dear Patron! 🌿\n\nI take immense pride in our green gardens. Here is a hand-picked pure vegetarian royal feast:\n\n` +
        `✦ **Starter:** *Tandoori Saffron Paneer Tikka (₹320)* - premium paneer cubes marinated in rich spiced yogurt and hand-picked saffron, char-roasted in the tandoor.\n` +
        `✦ **Mains:** *Shahi Paneer Cream Masala (₹390)* and our legendary *Imperial Dal Bukhara (₹320)* - black lentils slow-simmered for 24 hours on coal embers with rich butter.\n` +
        `✦ **Dessert:** *Kesar Pista Shahi Kulfi (₹180)* - traditional dense saffron and pistachio ice cream.\n\n` +
        `🍷 **Sommelier's Note:** The smoky depth of Dal Bukhara pairs marvelously with buttered flatbreads. Enjoy this vegetarian bounty!`;
    }

    // 4. South Indian / Coastal / Coconut / Bengaluru / Dosa
    if (query.includes("south") || query.includes("coastal") || query.includes("coconut") || query.includes("dosa") || query.includes("dakshin")) {
      return `Namaste and Vanakkam! 🥥\n\nWelcome to the coastal paradise of Dakshin Palace. Let us embark on a journey of curry leaves, mustard seeds, and fresh coconut:\n\n` +
        `✦ **Starter:** *Ghee Roast Masala Dosa (₹180)* - crispy golden fermented rice crepe smeared with aromatic pure cow ghee and stuffed with spiced potato masala.\n` +
        `✦ **Mains:** *Coastal Malabar Prawn Curry (₹520)* - fresh juicy prawns simmered in an aromatic kokum and coconut milk gravy, paired with flaky *Malabar Parotta*.\n` +
        `✦ **Dessert:** *Chilled Elaneer Payasam (₹165)* - tender coconut pulp and milk sweetened with golden jaggery.\n\n` +
        `🍷 **Sommelier's Note:** The tang of kokum in the prawn curry pairs perfectly with the flaky layers of parotta. The sweet coconut payasam is a cool, heavenly finish.`;
    }

    // 5. Dessert / Sweet / Halwa / Jamun / Kulfi
    if (query.includes("dessert") || query.includes("sweet") || query.includes("sugar") || query.includes("halwa") || query.includes("kulfi")) {
      return `Namaste, Dear Patron! 🌟\n\nAh, the sweet crown of the royal meal! I have prepared three distinct sweet nectars to delight your senses:\n\n` +
        `✦ **The Delhi Royal:** *Rose Cardamom Gulab Jamun (₹150)* - warm, floral, and deeply comforting.\n` +
        `✦ **The Punjabi Heritage:** *Desi Ghee Moong Dal Halwa (₹140)* - slow-roasted lentils with nuts, aromatic cardamom, and pure ghee.\n` +
        `✦ **The Southern Coast:** *Chilled Elaneer Payasam (₹165)* - refreshing, creamy tender coconut milk dessert sweetened with jaggery.\n\n` +
        `🍷 **Sommelier's Note:** For the ultimate dessert platter, try the warm Gulab Jamun side-by-side with our frozen *Kesar Pista Shahi Kulfi (₹180)* - the hot and cold contrast is absolute magic!`;
    }

    // 6. Chicken / Meat / Non-Veg / Biryani
    if (query.includes("chicken") || query.includes("mutton") || query.includes("meat") || query.includes("non veg") || query.includes("biryani") || query.includes("fish") || query.includes("prawn")) {
      return `Aadab, Dear Patron! 🍗\n\nFor the lovers of rich meats and dum-cooked rice, I present our royal non-vegetarian recommendations:\n\n` +
        `✦ **Appetizer:** *Murg Malai Kebab (₹380)* - soft, creamy, and mildly spiced chicken kebabs.\n` +
        `✦ **Biryani:** *Nawabi Murgh Dum Biryani (₹480)* - long-grain basmati rice layered with spiced chicken, saffron, and mint, slow-cooked under a sealed dough crust.\n` +
        `✦ **Curry:** *Grand Royal Butter Chicken (₹450)* - the classic Delhi icon, rich in cashew-tomato cream.\n\n` +
        `🍷 **Sommelier's Note:** Pair the biryani with our chilled cucumber raita to soothe the palate. Mop up the butter chicken with a hot buttered naan!`;
    }

    // 7. General Default / Fallback Response
    return `Namaste and Aadab, Dear Patron! 🌟\n\nI am **Chef Arjan**, your Royal Sommelier. I am delighted to guide you through our legendary kitchens. \n\nTell me: what kind of culinary experience would you prefer today?\n- A rich, creamy vegetarian feast from *The Saffron Taj*\n- A zesty, coconut-infused coastal trip from *Dakshin Palace*\n- Or perhaps a fiery, robust Punjabi main course from *Clay Oven Punjabi*\n\nTell me your preferences (spicy, mild, vegetarian, sweet, or family style) and I shall construct a beautiful feast for you!`;
  }

  // --- API Endpoint: AI Saffron Sommelier ---
  app.post("/api/gemini/sommelier", async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array provided." });
        return;
      }

      // Base system instruction defining Chef Arjan's context
      const systemInstruction = `You are Chef Arjan, the "Royal Saffron Sommelier" at our premium Indian dining app which connects customers to three legendary kitchens:
1. "The Saffron Taj" (Connaught Place, New Delhi): Royal Mughlai & luxury clay oven dishes (Tandoori Paneer Tikka, Shahi Paneer, Grand Royal Butter Chicken, Imperial Dal Bukhara, Nawabi Murgh Dum Biryani, Garlic Naan). Rich, luxurious cashews, saffron, cream.
2. "Dakshin Palace" (Indiranagar, Bengaluru): South Indian coastal gold (Ghee Roast Masala Dosa, Chettinad Pepper Chicken, Coastal Malabar Prawn Curry, Malabar Parotta). Fragrant curry leaves, coconut, mustard seeds.
3. "Clay Oven Punjabi" (Juhu, Mumbai): Robust Punjabi Dhaba cooking (Kadhai Paneer, Sarson Ka Saag & Makki Roti, Amritsari Spicy Butter Chicken, Mutton Dum Biryani, Amritsari Stuffed potato Kulcha, Moong Dal Halwa). Fiery spices, pure ghee, rustic clay pot depths.

Your role:
- You are a highly professional, welcoming, warm, and elite Indian culinary expert. Use polite and respectful terms (e.g., "Namaste", "Aadab", "Dear Patron", "Your royal Highness").
- Guide patrons with perfect wine/beverage pairing thoughts (like Mango Lassi with spicy curries, or buttered breads to mop up creamy Dal Bukhara).
- Give precise recommendation advice referring to our specific menu items:
  - Tandoori Saffron Paneer Tikka (₹320)
  - Murg Malai Kebab (₹380)
  - Grand Royal Butter Chicken (₹450)
  - Shahi Paneer Cream Masala (₹390)
  - Imperial Dal Bukhara (₹320)
  - Nawabi Murgh Dum Biryani (₹480)
  - Ghee Roast Masala Dosa (₹180)
  - Chettinad Pepper Chicken Fry (₹360)
  - Coastal Malabar Prawn Curry (₹520)
  - Dhaba style Kadhai Paneer (₹360)
  - Sarson Ka Saag & Makki Roti (₹310)
  - Amritsari Spicy Butter Chicken (₹420)
  - Pind Da Mutton Dum Biryani (₹540)
  - Desi Ghee Moong Dal Halwa (₹140)
  - Rose Cardamom Gulab Jamun (₹150)
  - Kesar Pista Shahi Kulfi (₹180)
  - Chilled Elaneer Payasam (₹165)
- If a patron asks for a dynamic menu set, suggest a customized multi-course meal (e.g. Starter -> Main -> Bread -> Dessert) matching their spice levels or dietary specifications (Veg vs Non-Veg).
- Keep responses relatively brief so they fit beautifully on a smartphone viewport, but ensure your explanations remain poetic, mouth-watering, and vivid. Limit formatting to bold headers and clean markdown bullets. Do not speak about system internals.`;

      // Extract current user prompt & format historical matches
      const currentPromptMessage = messages[messages.length - 1];
      const userText = currentPromptMessage?.content || "Namaste Chef Arjan!";

      // Convert history to content history structure
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      // Call Gemini 3.5-flash for hospitable elite reasoning
      let text = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        text = response.text || "";
      } catch (geminiError) {
        console.warn("Gemini API failed or key missing. Falling back to local smart sommelier logic.");
        text = getLocalSommelierResponse(userText);
      }

      if (!text) {
        text = getLocalSommelierResponse(userText);
      }

      res.json({ message: text });
    } catch (error: any) {
      console.error("Critical Error in Sommelier route:", error);
      res.json({ message: "Forgive me, my dear patron, my kitchen thoughts got tangled. What can I cook for you?" });
    }
  });

  // --- Vite Dev Server Middleware Setup ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode. Serving static built assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
