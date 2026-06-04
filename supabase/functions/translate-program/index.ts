import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── DeepL translation helper ──────────────────────────────────────────────────
async function deeplTranslate(texts: string[], targetLang: string, apiKey: string): Promise<string[]> {
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts, target_lang: targetLang }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.translations.map((t: { text: string }) => t.text);
}

// ── Recursively collect all strings from a JSON object ────────────────────────
function collectStrings(obj: unknown, paths: string[][], currentPath: string[]): void {
  if (typeof obj === 'string') {
    paths.push([...currentPath]);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectStrings(item, paths, [...currentPath, String(i)]));
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      collectStrings(val, paths, [...currentPath, key]);
    }
  }
}

// ── Get value at path ─────────────────────────────────────────────────────────
function getAtPath(obj: unknown, path: string[]): string {
  let cur: unknown = obj;
  for (const key of path) cur = (cur as Record<string, unknown>)[key];
  return cur as string;
}

// ── Set value at path (mutates) ───────────────────────────────────────────────
function setAtPath(obj: unknown, path: string[], value: string): void {
  let cur = obj as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

// ── Deep-clone a JSON-serialisable value ──────────────────────────────────────
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ── Translate an entire program object to a target language ───────────────────
async function translateProgram(programData: unknown, targetLang: string, apiKey: string): Promise<unknown> {
  const paths: string[][] = [];
  collectStrings(programData, paths, []);

  const texts = paths.map(p => getAtPath(programData, p));

  // DeepL allows max 50 texts per request — batch if needed
  const BATCH = 50;
  const translated: string[] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const results = await deeplTranslate(batch, targetLang, apiKey);
    translated.push(...results);
  }

  const clone = deepClone(programData);
  paths.forEach((path, i) => setAtPath(clone, path, translated[i]));
  return clone;
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const rowId: string = body.record?.id ?? body.rowId;
    const programData = body.record?.data_es ?? body.programData;

    if (!rowId || !programData) {
      return new Response(JSON.stringify({ error: 'Missing rowId or programData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('DEEPL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DEEPL_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[translate-program] Translating row "${rowId}" → EN + FR`);

    // Translate to both languages in parallel
    const [dataEn, dataFr] = await Promise.all([
      translateProgram(programData, 'EN', apiKey),
      translateProgram(programData, 'FR', apiKey),
    ]);

    const { error: updateError } = await supabaseAdmin
      .from('program_content')
      .update({
        data_en: dataEn,
        data_fr: dataFr,
        translated_at: new Date().toISOString(),
      })
      .eq('id', rowId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[translate-program] Row "${rowId}" translated successfully.`);
    return new Response(JSON.stringify({ success: true, rowId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[translate-program] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
