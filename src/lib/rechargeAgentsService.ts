import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type RechargeAgentType = "individual" | "institution" | "company";
export type RechargeAgentStatus = "pending" | "approved" | "rejected";

export interface RechargeAgent {
  id: string;
  userId: string;
  agentType: RechargeAgentType;
  status: RechargeAgentStatus;
  rejectionReason?: string;
  createdAt?: any;
  updatedAt?: any;
  fullName?: string;
  nationalId?: string;
  idFront?: string;
  idBack?: string;
  dob?: string;
  selfie?: string;
  gender?: string;
  companyName?: string;
  activityType?: string;
  commercialReg?: string;
  regSource?: string;
  calendarType?: "gregorian" | "hijri";
  regExpiry?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  countryCode?: string;
}

export function subscribeToRechargeAgents(
  params: { status?: RechargeAgentStatus },
  callback: (agents: RechargeAgent[]) => void,
  onError?: (error: unknown) => void,
) {
  const baseRef = collection(db, "recharge-agents");
  const q = params.status
    ? query(baseRef, where("status", "==", params.status), orderBy("createdAt", "desc"))
    : query(baseRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const agents = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RechargeAgent, "id">) }));
      callback(agents as RechargeAgent[]);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export async function updateRechargeAgentStatus(params: {
  agentId: string;
  status: RechargeAgentStatus;
  rejectionReason?: string;
}) {
  const agentRef = doc(db, "recharge-agents", params.agentId);

  const updateData: Record<string, unknown> = {
    status: params.status,
    updatedAt: serverTimestamp(),
  };

  if (params.status === "rejected") {
    updateData.rejectionReason = params.rejectionReason || "";
  } else {
    updateData.rejectionReason = "";
  }

  await updateDoc(agentRef, updateData);
}
