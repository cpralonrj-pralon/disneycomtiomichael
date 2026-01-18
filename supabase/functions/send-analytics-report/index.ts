import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL')
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'pralonrj'
const ADMIN_PHONE = Deno.env.get('ADMIN_PHONE') // e.g., 5521999999999

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Get stats for today (UTC)
        const today = new Date().toISOString().split('T')[0]
        const todayStart = `${today}T00:00:00`
        const todayEnd = `${today}T23:59:59`

        const { data: views, error } = await supabase
            .from('page_views')
            .select('visitor_token, page_path')
            .gte('created_at', todayStart)
            .lte('created_at', todayEnd)

        if (error) throw error

        const totalViews = views.length
        const uniqueVisitors = new Set(views.map(v => v.visitor_token)).size

        // 2. Format Message
        const message = `📊 *Relatório do Site - Tio Michael*\n🗓 *Data*: ${today.split('-').reverse().join('/')}\n\n👀 *Visualizações Totais*: ${totalViews}\n👤 *Visitantes Únicos*: ${uniqueVisitors}\n\n_Dados atualizados agora._`

        // 3. Send WhatsApp
        if (ADMIN_PHONE) {
            await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY!,
                },
                body: JSON.stringify({
                    number: ADMIN_PHONE,
                    options: { delay: 1000, presence: "composing" },
                    text: message
                }),
            })
        }

        return new Response(
            JSON.stringify({ success: true, totalViews, uniqueVisitors }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
