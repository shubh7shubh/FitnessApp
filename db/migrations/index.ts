import {
  addColumns,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: "foods",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),

        addColumns({
          table: "diary_entries",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),

        addColumns({
          table: "weight_entries",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
  ],
});
