import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  ChevronLeft, 
  Plus, 
  Flame, 
  Utensils, 
  GraduationCap,
  MessageSquare,
  AlertCircle,
  Clock,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, Screen } from "../types";
import { initialMenuItems } from "../data";

interface AISommelierProps {
  onNavigateBack: () => void;
  onAddToCart: (item: MenuItem) => void;
  cart: { [itemId: number]: number };
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export default function AISommelier({
  onNavigateBack,
  onAddToCart,
  cart,
}: AISommelierProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Namaste and Aadab, Dear Patron! 🌟\n\nI am **Chef Arjan**, your Royal Saffron Sommelier. I have stoked the clay ovens, ground the fresh cardamoms, and slow-braised the black lentils to velvety perfection.\n\nAre you craving the opulent sweet cream dishes of Delhi, the fragrant coastal gold of Bengaluru, or the robust rustic fire-spices of Amritsar? Tell me your palate's desires, and I shall customize an extraordinary culinary feast just for you!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickPrompts = [
    { text: "Suggest a mild, sweet feast for families 🍛", prompt: "I am hosting a family dinner. I prefer mild, rich, sweet dishes. Can you recommend a full-course feast from starter to dessert?" },
    { text: "Direct me to the spiciest Punjabi main tracks! 🔥", prompt: "What are the spiciest Punjabi dishes on our clay oven menu? Please suggest some direct pairings." },
    { text: "Vibrant vegetarian coastal selections 🥥", prompt: "I am a vegetarian. Can you design a coastal South Indian feast matching your options?" },
    { text: "Recommend a royal anniversary couple meal 🌹", prompt: "I need a royal couple feast menu for an anniversary dinner. Make it elegant and luxurious." }
  ];

  // Elite recommendations overlay list to purchase directly
  const gourmetHighlightItems = initialMenuItems.filter(item => 
    [103, 110, 201, 204, 303, 309].includes(item.id)
  );

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setErrorMessage("");

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/gemini/sommelier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Saffron Sommelier backend is heating up.");
      }

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-model`,
          role: "model",
          content: data.message,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      const fallbackResponse = getLocalSommelierResponse(textToSend);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-model-fallback`,
          role: "model",
          content: fallbackResponse,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111622] text-slate-100 select-none overflow-hidden">
      {/* Saffron Header */}
      <div className="shrink-0 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3.5 flex items-center justify-between shadow-lg relative z-30">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onNavigateBack}
            className="p-1 rounded-lg bg-black/15 text-white hover:bg-black/25 active:scale-95 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center font-bold text-amber-800 text-lg overflow-hidden shadow-inner">
              👳🏽‍♂️
            </div>
            {/* Online Status Light */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-amber-600 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-amber-200 tracking-wider uppercase leading-none">
              Saffron Sommelier
            </span>
            <span className="text-sm font-display font-black text-white tracking-tight leading-normal">
              Chef Arjan
            </span>
          </div>
        </div>

        <div className="bg-amber-800/40 text-amber-200 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
          <Sparkles size={10} className="text-amber-300 animate-spin" />
          <span>Royal AI</span>
        </div>
      </div>

      {/* Sommelier Recommendations Row (Directly Add items discussed in conversation) */}
      <div className="shrink-0 bg-slate-900/60 border-b border-white/5 py-2 px-3 flex flex-col gap-1.5 z-20">
        <span className="text-[10px] font-mono tracking-wider font-bold text-amber-400 uppercase">
          ✦ Quick-Add Sommelier Recommendations
        </span>
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {gourmetHighlightItems.map(item => {
            const inCartCount = cart[item.id] || 0;
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between gap-3 bg-slate-800/80 border border-white/5 pl-2.5 pr-2 py-1.5 rounded-xl text-[10px] shrink-0 hover:bg-slate-800 hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col">
                  <span className="font-extrabold text-white truncate max-w-[120px]">{item.name}</span>
                  <span className="text-amber-500/90 font-mono font-bold">₹{item.price}</span>
                </div>
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white/95 h-5 px-1.5 rounded-lg font-bold flex items-center justify-center gap-0.5 transition-all"
                >
                  <Plus size={10} />
                  <span>{inCartCount > 0 ? `${inCartCount} in Cart` : "Add"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Body Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-sans [scrollbar-width:none] bg-gradient-to-b from-[#111622] via-[#0b0e16] to-[#111622]"
      >
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            {/* Sender Subtitle */}
            <span className="text-[9px] text-slate-500 font-mono mb-1">
              {m.role === "user" ? "You" : "Chef Arjan"} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Bubble Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-md ${
                m.role === "user"
                  ? "bg-amber-600 text-white rounded-tr-none font-semibold"
                  : "bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-line"
              }`}
            >
              {/* Custom renderer for Chef Arjan's beautiful culinary markdown formatting */}
              {m.content}
            </motion.div>
          </div>
        ))}

        {/* Typing State Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start max-w-[80%] self-start">
            <span className="text-[9px] text-slate-500 font-mono mb-1">
              Chef Arjan is typing...
            </span>
            <div className="bg-slate-900 border border-white/5 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
              <span className="text-[10px] font-mono text-amber-500 ml-1.5 font-bold animate-pulse">Checking Spices...</span>
            </div>
          </div>
        )}

        {/* Backend Endpoint Error Panel */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-500/20 text-rose-200 p-3.5 rounded-2xl flex flex-col gap-1 text-[11px] font-medium leading-normal">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <AlertCircle size={14} />
              <span>Sommelier Alert</span>
            </div>
            <p>{errorMessage}</p>
            <button 
              onClick={() => {
                const lastUser = [...messages].reverse().find(m => m.role === "user");
                if (lastUser) sendMessage(lastUser.content);
              }}
              className="mt-2 text-rose-400 underline self-start font-bold cursor-pointer hover:text-rose-300"
            >
              Retry sending message
            </button>
          </div>
        )}

        {/* Welcome Prompt Recommendations Board */}
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
              <MessageSquare size={10} />
              <span>Prompt suggestions for Chef Arjan</span>
            </span>
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.prompt)}
                  className="bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-amber-500/20 text-left p-2.5 rounded-xl text-[11px] font-semibold text-slate-300 transition-all hover:translate-x-1 duration-200 cursor-pointer flex items-center justify-between group"
                >
                  <span>{p.text}</span>
                  <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-all">✦</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Tray Bar */}
      <div className="shrink-0 bg-slate-900/90 border-t border-white/5 p-3.5 flex flex-col gap-2 z-30">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Describe your perfect feast preference..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50 text-slate-100 placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:hover:bg-amber-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
        <span className="text-[9px] font-mono text-center text-slate-500">
          Chef Arjan evaluates recipes from legacy kitchen books in real-time.
        </span>
      </div>
    </div>
  );
}

// --- Local Fallback Sommelier Logic ---
function getLocalSommelierResponse(userText: string): string {
  const query = userText.toLowerCase();
  
  // 1. Anniversary / Couple / Date / Romantic
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
