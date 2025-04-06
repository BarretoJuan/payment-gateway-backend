import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

@Injectable()
export class SupabaseService {
  getStorage() {
    throw new Error("Method not implemented.");
  }
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_KEY || "",
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
