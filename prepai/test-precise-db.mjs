import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function testPreciseAnswersTable() {
  console.log("Testing precise_answers table...");

  const testUserId = "1625a2aa-3bcf-4eba-b80f-0bc0b17876f1";
  const testQuestion = "Test Question " + Date.now();

  const sampleAnswer = {
    summary_statement: "Test summary",
    key_bullets: ["Bullet 1"],
    sample_spoken_answer: "Sample answer",
  };

  // Attempt upsert
  const { data, error } = await supabaseAdmin.from("precise_answers").upsert(
    {
      user_id: testUserId,
      question_text: testQuestion,
      precise_answer: sampleAnswer,
    },
    { onConflict: "user_id,question_text" }
  ).select();

  if (error) {
    console.error("UPSERT ERROR:", error);
  } else {
    console.log("UPSERT SUCCESS:", data);
  }

  // Attempt query
  const { data: readData, error: readError } = await supabaseAdmin
    .from("precise_answers")
    .select("*")
    .eq("user_id", testUserId)
    .eq("question_text", testQuestion);

  if (readError) {
    console.error("READ ERROR:", readError);
  } else {
    console.log("READ SUCCESS:", readData);
  }
}

testPreciseAnswersTable();
