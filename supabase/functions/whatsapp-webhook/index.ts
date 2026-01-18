import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"

const apiKey = Deno.env.get('GEMINI_API_KEY')
const evolutionUrl = Deno.env.get('EVOLUTION_API_URL')
const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE')
const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')

serve(async (req) => {
    try {
        const body = await req.json()

        // Evolution API Webhook Structure for MESSAGES_UPSERT
        const { type, data } = body

        if (type !== 'MESSAGE_UPSERT' && type !== 'MESSAGES_UPSERT') {
            return new Response('Ignored event type', { status: 200 })
        }

        const messageData = data.message || data
        const key = data.key || messageData.key

        // Ignore messages from me (the bot itself)
        if (key.fromMe) {
            return new Response('Ignored self message', { status: 200 })
        }

        const remoteJid = key.remoteJid
        const userMessage = messageData.conversation || messageData.extendedTextMessage?.text

        if (!userMessage) {
            return new Response('No text content', { status: 200 })
        }

        // Call Gemini AI
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found")
            return new Response('Configuration Error', { status: 500 })
        }

        const genAI = new GoogleGenAI({ apiKey })

        // Simplistic chat history could be implemented here by fetching from Supabase DB
        // For now, we use a single-turn prompt with system instructions
        const systemInstruction = `Você é o assistente virtual do "Tio Michael - Orlando Travel VIP". 
    Sua personalidade é amigável, entusiasmada e prestativa. 
    Seu objetivo é responder perguntas sobre pacotes de viagem, roteiros em Orlando, dicas de parques (Disney, Universal), e serviços de Personal Shopper e Transfer.
    
    Informações principais:
    - Oferecemos Guia Especialista, Transfers VIP e Personal Shopper.
    - Destinos: Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Universal Studios, Islands of Adventure, SeaWorld e Outlets.
    - Próximas saídas: Janeiro, Maio e Julho de 2026.
    - Valores aproximados: R$ 9.800 a R$ 15.200.
    
    Sempre incentive o usuário a falar diretamente com o Tio Michael no WhatsApp para fechamentos e detalhes personalizados. 
    Responda em Português do Brasil.
    Seja conciso, pois é uma conversa de WhatsApp.`

        const chat = genAI.chats.create({
            model: 'gemini-2.0-flash',
            config: {
                systemInstruction,
            }
        })

        const result = await chat.sendMessage({ message: userMessage })
        const botResponse = result.text

        // Send Response via Evolution API
        await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey!,
            },
            body: JSON.stringify({
                number: remoteJid, // Direct JID or phone number
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                textMessage: {
                    text: botResponse,
                },
            }),
        })

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
