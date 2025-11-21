import { ProfessionType, ProfessionConfig } from './types';

export const PROFESSIONS: Record<ProfessionType, ProfessionConfig> = {
  [ProfessionType.NONE]: {
    id: ProfessionType.NONE,
    title: "SmartGuard Dashboard",
    roleDescription: "Select a mode to activate specialized support.",
    color: "bg-gray-900",
    icon: "🛡️",
    promptContext: "standing confidently in a modern African city street with vibrant colors and activity in the background, casual but neat attire, warm lighting",
    actionVerbs: ["Scan", "Detect", "Prepare"]
  },
  [ProfessionType.DOCTOR]: {
    id: ProfessionType.DOCTOR,
    title: "Medical Emergency",
    roleDescription: "Immediate medical triage and ambulance coordination.",
    color: "bg-medical-teal",
    icon: "⚕️",
    promptContext: "wearing a white doctor's coat with a stethoscope, standing in a sterile modern hospital emergency room, professional lighting, serious and helpful expression",
    actionVerbs: ["Triaging", "Stabilizing", "Contacting EMS"]
  },
  [ProfessionType.FIREFIGHTER]: {
    id: ProfessionType.FIREFIGHTER,
    title: "Fire & Rescue",
    roleDescription: "Rapid fire station dispatch and evacuation protocols.",
    color: "bg-fire-red",
    icon: "🔥",
    promptContext: "wearing a firefighter turnout gear with helmet under arm, standing in front of a fire truck, dramatic lighting, heroic and ready",
    actionVerbs: ["Alerting", "Evacuating", "Dispatching"]
  },
  [ProfessionType.LAWYER]: {
    id: ProfessionType.LAWYER,
    title: "Legal Aid / Police",
    roleDescription: "Rights protection and law enforcement connection.",
    color: "bg-police-blue",
    icon: "⚖️",
    promptContext: "wearing a sharp professional suit, standing in a courtroom setting with a gavel in the background, authoritative and calm",
    actionVerbs: ["Recording", "Advising", "Connecting"]
  },
  [ProfessionType.MECHANIC]: {
    id: ProfessionType.MECHANIC,
    title: "Roadside Assist",
    roleDescription: "Vehicle breakdown and mechanical support.",
    color: "bg-mech-orange",
    icon: "🔧",
    promptContext: "wearing blue mechanic coveralls with grease smudges, holding a wrench, standing in a modern auto repair shop, garage background",
    actionVerbs: ["Diagnosing", "Towing", "Repairing"]
  },
  [ProfessionType.ENGINEER]: {
    id: ProfessionType.ENGINEER,
    title: "Structural/Utility",
    roleDescription: "Infrastructure failure and hazard reporting.",
    color: "bg-yellow-600",
    icon: "👷",
    promptContext: "wearing a safety vest and hard hat, holding rolled blueprints, standing at a construction site with cranes in background",
    actionVerbs: ["Assessing", "Securing", "Reporting"]
  },
  [ProfessionType.HANDYMAN]: {
    id: ProfessionType.HANDYMAN,
    title: "DIY & Repairs",
    roleDescription: "Household fixes, vehicle maintenance, and off-grid projects.",
    color: "bg-orange-700",
    icon: "🛠️",
    promptContext: "wearing a rugged utility vest, leather gloves, and a tool belt, standing in a well-equipped workshop with wood and metal tools visible, warm practical lighting",
    actionVerbs: ["Analyzing", "Fixing", "Building"]
  }
};