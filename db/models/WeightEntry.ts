// db/models/WeightEntry.ts
import { Model } from "@nozbe/watermelondb";
import {
  field,
  text,
  readonly,
  date,
  relation,
} from "@nozbe/watermelondb/decorators";
import { User } from "./User";

export class WeightEntry extends Model {
  static table = "weight_entries";

  @field("weight_kg") weightKg!: number;
  @text("date") date!: string;
  @text("notes") notes?: string;
  @text("user_id") userId!: string;

  @relation("users", "user_id") user!: User;
}
