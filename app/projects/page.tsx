import { createSupabaseServerClient } from "@/lib/supabase";
import Layout from "@/components/Layout";
import AdminProjectsTable from "@/components/projects/AdminProjectsTable";
import UserProjectsTable from "@/components/projects/UserProjectsTable";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <Layout>
        <div className="p-4 text-center text-red-500">
          You must be logged in to view projects.
        </div>
      </Layout>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <Layout>
        <div className="p-4 text-center text-red-500">
          Failed to load your profile. Please refresh the page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        {profile.role === "admin" ? (
          <AdminProjectsTable />
        ) : (
          <UserProjectsTable userId={user.id} />
        )}
      </div>
    </Layout>
  );
}
