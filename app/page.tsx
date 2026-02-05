import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("non_existing_table")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-semibold">CEREMO</h1>
    </main>
  );
}
