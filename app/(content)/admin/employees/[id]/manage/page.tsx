import ManageEmployeeClient from "./page.client";
import { getEmployeeDetail } from "@/actions/employees/core";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page(props: PageProps) {
  const { id } = await props.params;           // ✅ unwrap params

  const res = await getEmployeeDetail({ id }); 

  if (!res?.data?.ok || !res.data.employee) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Employee not found</h1>
        <p className="text-muted-foreground mt-1">ID: {id}</p>
      </div>
    );
  }

  return <ManageEmployeeClient initial={res.data.employee} />;
}
