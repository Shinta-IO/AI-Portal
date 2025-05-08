import Layout from "@/components/Layout";
import { createSupabaseServerClient } from "@/lib/supabase";
import CrowdClientWrapper from "@/components/crowd/CrowdClientWrapper";

export default async function CrowdProjectsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
          <div className="text-red-500 font-semibold text-lg">
            You must be logged in to view Crowd Projects.
          </div>
        </div>
      </Layout>
    );
  }

  const [{ data: projects }, { data: joined }] = await Promise.all([
    supabase
      .from("crowd_projects")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase
      .from("crowd_participation")
      .select("crowd_project_id")
      .eq("user_id", user.id),
  ]);

  const joinedIds = new Set((joined || []).map((j) => j.crowd_project_id));

  return (
    <Layout>
      <CrowdClientWrapper projects={projects || []} joinedIds={joinedIds} userId={user.id} />
    </Layout>
  );
}
