import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const getStatusBadge = (status) => {
  // Normalize casing for key lookup
  const normalized = status?.toLowerCase() || "";

  const styles = {
    queued: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    inprogress:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    approved:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    "needs-review":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  const icons = {
    queued: Clock,
    inprogress: Clock,
    completed: CheckCircle,
    failed: XCircle,
    approved: CheckCircle,
    rejected: XCircle,
    "needs-review": AlertCircle,
  };

  const Icon = icons[normalized] || Clock;
  const style = styles[normalized] || styles.queued;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

export default getStatusBadge;
