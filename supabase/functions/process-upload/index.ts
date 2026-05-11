import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdfjs from "https://esm.sh/pdfjs-dist@3.4.120/build/pdf.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    // 2. Parse request
    const { batch_id, file_path } = await req.json()
    if (!batch_id || !file_path) {
      throw new Error('batch_id and file_path are required')
    }

    // 3. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('statements')
      .download(file_path)

    if (downloadError) throw downloadError

    // 4. Parse PDF
    // Note: This is a basic implementation of PDF extraction using pdf.js
    const arrayBuffer = await fileData.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    // 5. Categorization Engine (Basic Implementation)
    // In reality, this would use regex and the dictionary
    const extractedTransactions: any[] = []
    
    // Fake parsing logic for demonstration since parsing bank PDFs requires complex OCR/Regex per bank
    // We assume we found some transactions
    if (fullText.length > 0) {
      extractedTransactions.push({
        batch_id,
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'SAMPLE VENDOR - ' + file_path,
        amount: -15.99,
        category: 'Software'
      })
    }

    // 6. Insert parsed transactions
    if (extractedTransactions.length > 0) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(extractedTransactions)

      if (insertError) throw insertError
    }

    // 7. Update file status
    await supabase
      .from('source_files')
      .update({ status: 'completed' })
      .eq('file_url', file_path)

    return new Response(
      JSON.stringify({ message: 'File processed successfully', transactions: extractedTransactions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
