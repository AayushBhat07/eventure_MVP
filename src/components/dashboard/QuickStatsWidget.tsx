import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function QuickStatsWidget() {
  const stats = useQuery(api.dashboard.getUserStats);

  const statItems = [
    {
      icon: Calendar,
      label: "EVENTS",
      value: stats?.totalEventsJoined ?? 0,
    },
    {
      icon: Award,
      label: "CERTIFICATES",
      value: stats?.totalCertificates ?? 0,
    },
    {
      icon: CheckCircle,
      label: "ACTIVE STATUS",
      isCheck: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          className="flex items-center justify-between border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-neutral-800"
        >
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-black dark:text-white" />
            <span className="text-[11px] font-black uppercase tracking-wide">{item.label}</span>
          </div>
          {item.isCheck ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <span className="text-lg font-black">{item.value}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}