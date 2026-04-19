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

export default function StatusTracker({ status }: Props) {
  const normalizedStatus = (status || "").trim();
  const isCancelled = normalizedStatus === "Cancelled";

  const getTrackerStatus = () => {
    if (normalizedStatus === "Partially Shipped") return "Shipped";
    if (normalizedStatus === "Partially Delivered") return "Delivered";
    return normalizedStatus;
  };

  const trackerStatus = getTrackerStatus();

  const currentIndex = Math.max(
    steps.findIndex((s) => s.label === trackerStatus),
    0
  );

  const progressWidth = isCancelled
    ? 0
    : `${(currentIndex / (steps.length - 1)) * 100}%`;

  return (
    <div className="mt-10 w-full">
      <div className="rounded-3xl bg-white/45 backdrop-blur-xl border border-white/50 shadow-[0_10px_35px_rgba(0,102,255,0.08)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              Delivery Journey
            </h3>
            <p className="text-sm text-gray-500">
              Live order flow from approval to doorstep delivery
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold w-fit ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : normalizedStatus === "Delivered" || normalizedStatus === "Partially Delivered"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-[#0066FF]"
            }`}
          >
            {isCancelled ? <FaTimesCircle /> : <FaCheck />}
            {normalizedStatus || "Pending Approval"}
          </div>
        </div>

        {isCancelled ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <FaTimesCircle size={24} />
              </div>
            </div>

            <h4 className="text-lg font-semibold text-red-700">
              Order Cancelled
            </h4>
            <p className="text-sm text-red-600 mt-2">
              This order is no longer in the fulfilment pipeline.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="relative mb-8">
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#0066FF] to-blue-400 rounded-full shadow-md"
              />

              <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8">
                {steps.map((step, index) => {
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.label}
                      className="relative flex flex-col items-center text-center px-2"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{
                          scale: isCurrent ? 1.12 : 1,
                          opacity: 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 z-10
                          ${
                            isCompleted
                              ? "bg-gradient-to-r from-green-400 to-[#0066FF] text-white border-transparent shadow-lg shadow-blue-200"
                              : isCurrent
                              ? "bg-white border-[#0066FF] text-[#0066FF] shadow-lg"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                      >
                        {isCompleted ? <FaCheck size={14} /> : <Icon size={16} />}

                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full bg-[#0066FF] opacity-20 animate-ping"></span>
                        )}
                      </motion.div>

                      <p
                        className={`text-xs sm:text-sm mt-3 font-semibold leading-tight
                          ${
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
                        className={`text-[11px] mt-1
                          ${
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

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/60 border border-white/50 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Current Stage</p>
                <p className="font-semibold text-[#0066FF]">
                  {normalizedStatus || "Pending Approval"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 border border-white/50 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <p className="font-semibold text-gray-800">
                  {currentIndex + 1} / {steps.length} Stages
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 border border-white/50 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Status Insight</p>
                <p className="font-semibold text-gray-800">
                  {normalizedStatus === "Pending Approval"
                    ? "Awaiting admin confirmation"
                    : normalizedStatus === "Confirmed"
                    ? "Approved and queued"
                    : normalizedStatus === "Processing"
                    ? "Order is being prepared"
                    : normalizedStatus === "Packaging"
                    ? "Packed for dispatch"
                    : normalizedStatus === "Shipped"
                    ? "On the way"
                    : normalizedStatus === "Partially Shipped"
                    ? "Some items are on the way"
                    : normalizedStatus === "Partially Delivered"
                    ? "Some items have been delivered"
                    : normalizedStatus === "Delivered"
                    ? "Successfully completed"
                    : "In progress"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}