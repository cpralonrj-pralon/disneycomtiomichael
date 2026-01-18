import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { name, email, phone, message, date } = await req.json()

        const evolutionUrl = Deno.env.get('EVOLUTION_API_URL')
        const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE')
        const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
        const adminPhone = Deno.env.get('ADMIN_PHONE')

        if (!evolutionUrl || !evolutionInstance || !evolutionApiKey || !adminPhone) {
            throw new Error('Missing Evolution API configuration')
        }

        const text = `🚀 *Novo Lead do Site!*

👤 *Nome:* ${name}
📧 *Email:* ${email}
📱 *WhatsApp:* ${phone || 'Não informado'}
📅 *Data:* ${date}

💬 *Mensagem:*
${message}

_Enviado via Tio Michael App_`

        const response = await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey,
            },
            body: JSON.stringify({
                number: adminPhone,
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                textMessage: {
                    text: text,
                },
            }),
        })

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
