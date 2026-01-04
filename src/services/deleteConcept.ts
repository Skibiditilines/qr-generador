export async function deleteConcept(slug: string, access_token: string) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/concepts/delete-concept?slug=${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error deleting concept");
  }
}
