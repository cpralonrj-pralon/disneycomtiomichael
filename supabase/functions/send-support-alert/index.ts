import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL')
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'pralonrj'
const ADMIN_PHONE = Deno.env.get('ADMIN_PHONE')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { chatId, visitorName, messageContent } = await req.json()

        if (!chatId) throw new Error('Missing chatId')

        const adminLink = `https://cpralonrj-pralon.github.io/disneycomtiomichael/?admin_chat=${chatId}`
        const text = `🔔 *Novo Cliente no Site*\n\n👤 *Nome*: ${visitorName || 'Visitante'}\n💬 *Mensagem*: ${messageContent}\n\n👉 *Responder*: ${adminLink}`

        // Send WhatsApp to Admin
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY!,
            },
            body: JSON.stringify({
                number: ADMIN_PHONE,
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                text: text
            }),
        })

        const result = await response.json()

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
