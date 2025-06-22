import { DatabaseProvider as WatermelonDBProvider } from "@nozbe/watermelondb/DatabaseProvider";
import { database } from "@/db";

export default function DatabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WatermelonDBProvider database={database}>{children}</WatermelonDBProvider>
  );
}
