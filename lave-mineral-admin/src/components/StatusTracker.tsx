"use client";

import { motion } from "framer-motion";
import {
  FaCheck,
  FaClipboardCheck,
  FaCogs,
  FaBoxOpen,
  FaTruck,
  FaHome,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";

type Props = {
  status: string;
};

const steps = [
  { label: "Pending Approval", icon: FaHourglassHalf },
  { label: "Confirmed", icon: FaClipboardCheck },
  { label: "Processing", icon: FaCogs },
  { label: "Packaging", icon: FaBoxOpen },
  { label: "Shipped", icon: FaTruck },
  { label: "Delivered", icon: FaHome },
] as const;

function getTrackerStatus(status: string) {
  const normalized = (status || "").trim();

  if (normalized === "Partially Shipped") return "Shipped";
  if (normalized === "Partially Delivered") return "Delivered";

  return normalized || "Pending Approval";
}

function getInsight(status: string) {
  switch ((status || "").trim()) {
    case "Pending Approval":
      return "Awaiting admin confirmation";
    case "Confirmed":
      return "Approved and queued";
    case "Processing":
      return "Order is being prepared";
    case "Packaging":
      return "Packed for dispatch";
    case "Shipped":
      return "On the way";
    case "Partially Shipped":
      return "Some items are on the way";
    case "Partially Delivered":
      return "Some items have been delivered";
    case "Delivered":
      return "Successfully completed";
    case "Cancelled":
      return "Order flow has been stopped";
    default:
      return "Order is in progress";
  }
}

export default function StatusTracker({ status }: Props) {
  const normalizedStatus = (status || "").trim();
  const isCancelled = normalizedStatus === "Cancelled";

  const trackerStatus = getTrackerStatus(normalizedStatus);

  const currentIndex = Math.max(
    steps.findIndex((step) => step.label === trackerStatus),
    0
  );

  const progressWidth = isCancelled
    ? "0%"
    : `${(currentIndex / (steps.length - 1)) * 100}%`;

  const badgeClass = isCancelled
    ? "bg-red-100 text-red-700 border-red-200"
    : normalizedStatus === "Delivered" || normalizedStatus === "Partially Delivered"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-blue-100 text-[#0066FF] border-blue-200";

  return (
    <div className="mt-10 w-full">
      <div className="rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_10px_35px_rgba(0,102,255,0.08)] backdrop-blur-xl sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
              Delivery Journey
            </h3>
            <p className="text-sm text-gray-500">
              Live order flow from approval to final delivery
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${badgeClass}`}
          >
            {isCancelled ? <FaTimesCircle /> : <FaCheck />}
            {normalizedStatus || "Pending Approval"}
          </div>
        </div>

        {isCancelled ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center"
          >
            <div className="mb-3 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FaTimesCircle size={24} />
              </div>
            </div>

            <h4 className="text-lg font-semibold text-red-700">
              Order Cancelled
            </h4>
            <p className="mt-2 text-sm text-red-600">
              This order is no longer in the fulfilment pipeline.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="relative mb-8">
              <div className="absolute left-0 top-5 h-1 w-full rounded-full bg-gray-200" />

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute left-0 top-5 h-1 rounded-full bg-gradient-to-r from-[#0066FF] to-blue-400"
              />

              <div className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={step.label}
                      className="flex flex-col items-center px-2 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0.96, opacity: 0.9 }}
                        animate={{
                          scale: isCurrent ? 1.08 : 1,
                          opacity: 1,
                        }}
                        transition={{ duration: 0.25 }}
                        className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12 ${
                          isCompleted
                            ? "border-transparent bg-gradient-to-r from-green-400 to-[#0066FF] text-white shadow-lg shadow-blue-200"
                            : isCurrent
                            ? "border-[#0066FF] bg-white text-[#0066FF] shadow-lg"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {isCompleted ? <FaCheck size={14} /> : <Icon size={16} />}
                      </motion.div>

                      <p
                        className={`mt-3 text-xs font-semibold leading-tight sm:text-sm ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                            ? "text-[#0066FF]"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          isCompleted
                            ? "text-green-500"
                            : isCurrent
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isCurrent
                          ? "Current Stage"
                          : "Upcoming"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm">
                <p className="mb-1 text-xs text-gray-500">Current Stage</p>
                <p className="font-semibold text-[#0066FF]">
                  {normalizedStatus || "Pending Approval"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm">
                <p className="mb-1 text-xs text-gray-500">Progress</p>
                <p className="font-semibold text-gray-800">
                  {currentIndex + 1} / {steps.length} Stages
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm">
                <p className="mb-1 text-xs text-gray-500">Status Insight</p>
                <p className="font-semibold text-gray-800">
                  {getInsight(normalizedStatus)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}