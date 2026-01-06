"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase-server";

// Helper to check admin
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("Unauthorized");

  const serviceClient = await createServiceClient();

  // Check if Super Admin via Env Var
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const isSuperAdmin = adminEmails.includes(user.email);

  let { data: dbUser } = await serviceClient
    .from("users")
    .select("*")
    .eq("email", user.email)
    .single();

  // Auto-create Super Admin if missing in DB
  if (!dbUser && isSuperAdmin) {
      // Check if user exists in auth but not in public.users
      // We assume user.id is correct from auth.
      const { data: newUser, error } = await serviceClient.from("users").insert({
          id: user.id,
          email: user.email,
          role: "admin",
          status: "active",
      }).select().single();
      
      if (error) {
          console.error("Failed to create admin user. Error:", error);
          if ('message' in error) {
             console.error("Error message:", (error as any).message);
          }
          // If insert fails (maybe ID conflict?), try fetching again
          const { data: existing } = await serviceClient.from("users").select("*").eq("email", user.email).single();
          if (existing) dbUser = existing;
          else throw new Error("Failed to create admin user");
      } else {
          dbUser = newUser;
      }
  }

  // Auto-promote if Super Admin but has wrong role
  if (dbUser && dbUser.role !== "admin" && isSuperAdmin) {
      await serviceClient.from("users").update({ role: "admin" }).eq("id", dbUser.id);
      dbUser.role = "admin";
  }
  
  if (!dbUser || (dbUser.role !== "admin" && !isSuperAdmin)) {
    throw new Error("Forbidden");
  }
  return { user, dbUser, serviceClient };
}

export async function getUsers() {
  const { serviceClient } = await checkAdmin();
  
  // 1. Fetch users from public.users
  const { data: users, error } = await serviceClient
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  // 2. Fetch plans from user_plans
  const { data: userPlans } = await serviceClient
    .from("user_plans")
    .select("user_id, plan");

  // Map plans to users
  const planMap = new Map();
  if (userPlans) {
      userPlans.forEach((up: any) => planMap.set(up.user_id, up.plan));
  }

  return users.map((u: any) => ({
      ...u,
      createdAt: new Date(u.created_at),
      updatedAt: u.updated_at ? new Date(u.updated_at) : null,
      plan: { name: planMap.get(u.id) || "basic" }
  }));
}

export async function updateUserStatus(userId: string, status: "pending" | "active" | "rejected" | "suspended") {
  const { dbUser, serviceClient } = await checkAdmin();
  
  await serviceClient.from("users").update({ status }).eq("id", userId);

  await serviceClient.from("audit_logs").insert({
      action: "UPDATE_USER_STATUS",
      admin_id: dbUser.id,
      target_id: userId,
      details: { status }
  });

  revalidatePath("/boss/users");
  revalidatePath(`/boss/users/${userId}`);
}

export async function updateUserPlan(userId: string, plan: string) {
  const { dbUser, serviceClient } = await checkAdmin();

  // Upsert into user_plans
  // We assume user_plans has (user_id, plan) columns. 
  // If it has a primary key or constraint, upsert works.
  // user_plans table structure: likely user_id (PK/FK), plan (text).
  
  const { error } = await serviceClient
      .from("user_plans")
      .upsert({ user_id: userId, plan }, { onConflict: "user_id" });

  if (error) {
      console.error("Failed to update user plan", error);
      throw new Error("Failed to update user plan");
  }

  await serviceClient.from("audit_logs").insert({
      action: "UPDATE_USER_PLAN",
      admin_id: dbUser.id,
      target_id: userId,
      details: { plan }
  });

  revalidatePath("/boss/users");
  revalidatePath(`/boss/users/${userId}`);
}

export async function addPayment(data: { userId: string; amount: number; mode: string; status?: string; notes?: string }) {
  const { dbUser, serviceClient } = await checkAdmin();

  await serviceClient.from("payments").insert({
      user_id: data.userId,
      amount: data.amount,
      mode: data.mode,
      status: data.status || "completed",
      notes: data.notes,
  });

  await serviceClient.from("audit_logs").insert({
      action: "ADD_MANUAL_PAYMENT",
      admin_id: dbUser.id,
      target_id: data.userId,
      details: data,
  });

  revalidatePath("/boss/users");
  revalidatePath("/boss/payments");
}
