import { supabase } from "./supabase";

export async function getCurrentClientUserId() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    throw new Error(
      "You must be signed in."
    );
  }

  return session.user.id;
}